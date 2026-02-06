/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { createRequire } from 'node:module';
import type { Deboa as DeboaType } from 'deboa';
import { NipkgConfig, BuildOptions } from './types.js';

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const { Deboa } = require('deboa') as { Deboa: typeof DeboaType };

export class SystemLinkNipkgBuilder {
    private readonly config: NipkgConfig;
    private readonly options: BuildOptions;
    private readonly projectRoot: string;

    constructor(config: NipkgConfig, options: BuildOptions = {}) {
        this.config = config;
        this.options = options;
        this.projectRoot = process.cwd();
    }

    /**
   * Build the complete nipkg package
   */
    public async build(): Promise<void> {
        try {
            console.log(chalk.cyan('🚀 Starting nipkg build process...'));

            // Run custom build command if requested
            this.runProjectBuild();

            // Set up output directory
            const outputDir = this.options.outputDir || this.config.outputDir || path.join(this.projectRoot, 'dist');
            await fs.ensureDir(outputDir);

            const nipkgDir = path.join(outputDir, 'nipkg');
            await fs.ensureDir(nipkgDir);

            // Package the application
            await this.packageApplication(nipkgDir);

            console.log(chalk.green.bold('🎯 Nipkg build completed successfully!'));
        } catch (error) {
            console.error(chalk.red.bold('❌ Build failed:'), (error as Error).message);
            process.exit(1);
        }
    }

    /**
   * Get the package name from CLI options, config, or package.json
   */
    private getName(): string {
        // Priority: CLI option > config > package.json > directory name
        if (this.options.name) {
            return this.options.name;
        }

        // If name is explicitly set in config, use it
        if (this.config.name) {
            return this.config.name;
        }

        // Otherwise, try to read from package.json
        try {
            const packageJson = fs.readJsonSync(path.join(this.projectRoot, 'package.json')) as { name?: string };
            if (packageJson.name !== undefined && packageJson.name !== '') {
                console.log(chalk.cyan(`📦 Using name "${packageJson.name}" from package.json`));
                return packageJson.name;
            }
        } catch (_error) {
            // Fall through
        }

        // Default to current directory name
        const dirName = path.basename(this.projectRoot);
        console.log(chalk.yellow(`⚠️  No package name found, using directory name: "${dirName}"`));
        return dirName;
    }

    /**
   * Get the package description from CLI options, config, or package.json
   */
    private getDescription(): string {
        // Priority: CLI option > config > package.json > empty string
        if (this.options.description) {
            return this.options.description;
        }

        // If description is explicitly set in config, use it
        if (this.config.description) {
            return this.config.description;
        }

        // Otherwise, try to read from package.json
        try {
            const packageJson = fs.readJsonSync(path.join(this.projectRoot, 'package.json')) as { description?: string };
            if (packageJson.description !== undefined && packageJson.description !== '') {
                console.log(chalk.cyan('📦 Using description from package.json'));
                return packageJson.description;
            }
        } catch (_error) {
            // Fall through
        }

        // Default to empty string if not found anywhere
        return '';
    }

    /**
   * Get the package version from CLI options, config, or package.json
   */
    private getVersion(): string {
        // Priority: CLI option > config > package.json > default
        if (this.options.version) {
            return this.options.version;
        }

        // If version is explicitly set in config, use it
        if (this.config.version) {
            return this.config.version;
        }

        // Otherwise, try to read from package.json
        try {
            const packageJson = fs.readJsonSync(path.join(this.projectRoot, 'package.json')) as { version?: string };
            if (packageJson.version !== undefined && packageJson.version !== '') {
                console.log(chalk.cyan(`📦 Using version ${packageJson.version} from package.json`));
                return packageJson.version;
            }
        } catch (_error) {
            // Fall through
        }

        // Default to 1.0.0 if not found anywhere
        console.log(chalk.yellow('⚠️  No version found, defaulting to 1.0.0'));
        return '1.0.0';
    }

    /**
   * Get the maintainer from CLI options, config, or use default
   */
    private getMaintainer(): string {
        // Priority: CLI option > config > default
        if (this.options.maintainer) {
            return this.options.maintainer;
        }

        if (this.config.maintainer) {
            return this.config.maintainer;
        }

        // Default maintainer if not specified
        console.log(chalk.yellow('⚠️  No maintainer specified, using default'));
        return 'Unknown <unknown@example.com>';
    }

    /**
   * Run project build command
   */
    private runProjectBuild(): void {
        if (!this.options.build) {
            return;
        }

        console.log(chalk.blue('🔨 Building application...'));

        try {
            // Use npm run build by default, or custom command from config
            const buildCmd = typeof this.config.buildCommand === 'string' && this.config.buildCommand !== ''
                ? this.config.buildCommand
                : 'npm run build';

            execSync(buildCmd, { stdio: this.options.verbose ? 'inherit' : 'pipe' });
            console.log(chalk.green('✅ Build completed successfully'));
        } catch (error) {
            throw new Error(`Build failed: ${(error as Error).message}`);
        }
    }

    /**
   * Prepare source directory with ApplicationFiles_64 structure
   */
    private async prepareSourceDirectory(nipkgDir: string): Promise<string> {
        // Priority: CLI option > config
        const buildDir = this.options.buildDir || this.config.buildDir;

        if (!buildDir) {
            throw new Error(
                'buildDir is required.\n'
                + 'Provide it via CLI: --build-dir <path>\n'
                + 'Or add it to nipkg.config.json:\n'
                + '  "buildDir": "dist"\n'
                + '  or "buildDir": "build"\n\n'
                + 'This should point to your application\'s build output directory.'
            );
        }

        if (!fs.existsSync(buildDir)) {
            throw new Error(
                `Build directory not found: ${buildDir}\n`
                + 'Run your build command first or use --build flag.'
            );
        }

        // Create temporary source directory with the required structure
        const sourceDir = path.join(nipkgDir, 'temp-source');
        const applicationFilesDir = path.join(sourceDir, 'ApplicationFiles_64');

        // Clean up if exists
        if (await fs.pathExists(sourceDir)) {
            await fs.remove(sourceDir);
        }

        await fs.ensureDir(applicationFilesDir);

        console.log(chalk.blue('📋 Copying build files...'));
        await fs.copy(buildDir, applicationFilesDir, { overwrite: true });
        console.log(chalk.green('✅ Build files copied'));

        return sourceDir;
    }

    /**
   * Package the application into .nipkg format
   */
    private async packageApplication(nipkgDir: string): Promise<void> {
        // Clean up existing packages
        if (!this.options.skipCleanup) {
            const existingPackages = (await fs.readdir(nipkgDir))
                .filter((file: string) => file.endsWith('.nipkg') || file.endsWith('.deb'));
            await Promise.all(existingPackages.map(async pkg => {
                await fs.remove(path.join(nipkgDir, pkg));
                console.log(chalk.yellow(`🗑️  Removed existing package: ${pkg}`));
            }));
        }

        console.log(chalk.blue('📦 Packaging application...'));

        try {
            // Prepare source directory with ApplicationFiles_64 structure
            const sourceDir = await this.prepareSourceDirectory(nipkgDir);

            const architecture = this.config.architecture || 'all';
            // Build package name with optional suffix (CLI option takes precedence over config)
            const suffix = this.options.buildSuffix || this.config.buildSuffix;
            const packageName = suffix
                ? `${this.getName()}_${this.getVersion()}.${suffix}_${architecture}`
                : `${this.getName()}_${this.getVersion()}_${architecture}`;
            const debPath = path.join(nipkgDir, `${packageName}.deb`);
            const nipkgPath = path.join(nipkgDir, `${packageName}.nipkg`);

            // Build control file options
            const depends = this.config.depends ? this.config.depends.join(', ') : undefined;

            const controlFileOptions = {
                maintainer: this.getMaintainer(),
                packageName: this.getName(),
                shortDescription: this.getDescription(),
                version: this.getVersion(),
                architecture,
                ...(depends && { depends }),
                ...(this.config.displayName && { displayName: this.config.displayName }),
                ...(this.config.userVisible && { userVisible: String(this.config.userVisible) }),
            };

            // Use Deboa to create the .deb file
            if (this.options.verbose) {
                console.log(chalk.gray('  Creating .deb package...'));
            }

            const deboa = new Deboa({
                controlFileOptions,
                sourceDir,
                targetDir: nipkgDir,
                targetFileName: `${packageName}`,
            });

            await deboa.package();

            // Clean up temp source directory
            await fs.remove(sourceDir);

            // Rename .deb to .nipkg
            await fs.rename(debPath, nipkgPath);

            console.log(chalk.green(`🎉 Successfully created package: ${packageName}.nipkg`));
            console.log(chalk.cyan(`📍 Package location: ${nipkgPath}`));
        } catch (error) {
            throw new Error(`Packaging failed: ${(error as Error).message}`);
        }
    }
}