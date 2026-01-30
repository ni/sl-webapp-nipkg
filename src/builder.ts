import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import * as tar from 'tar';
import { NipkgConfig, BuildOptions } from './types.js';

export class AngularNipkgBuilder {
  private config: NipkgConfig;
  private options: BuildOptions;
  private projectRoot: string;

  constructor(config: NipkgConfig, options: BuildOptions = {}) {
    this.config = config;
    this.options = options;
    this.projectRoot = process.cwd();
  }

  /**
   * Check if current directory is an Angular workspace
   */
  private isAngularWorkspace(): boolean {
    return fs.existsSync(path.join(this.projectRoot, 'angular.json'));
  }

  /**
   * Get the package version from config or package.json
   */
  private getVersion(): string {
    // If version is explicitly set in config, use it
    if (this.config.version) {
      return this.config.version;
    }

    // Otherwise, try to read from package.json
    try {
      const packageJson = fs.readJsonSync(path.join(this.projectRoot, 'package.json'));
      if (packageJson.version) {
        console.log(chalk.cyan(`📦 Using version ${packageJson.version} from package.json`));
        return packageJson.version;
      }
    } catch (error) {
      // Fall through
    }

    // Default to 1.0.0 if not found anywhere
    console.log(chalk.yellow('⚠️  No version found, defaulting to 1.0.0'));
    return '1.0.0';
  }

  /**
   * Get the Angular project name from angular.json
   */
  private getProjectName(): string {
    if (this.config.projectName) {
      return this.config.projectName;
    }

    try {
      const angularJson = fs.readJsonSync(path.join(this.projectRoot, 'angular.json'));
      const defaultProject = angularJson.defaultProject || Object.keys(angularJson.projects)[0];
      return defaultProject;
    } catch (error) {
      return path.basename(this.projectRoot);
    }
  }

  /**
   * Get the Angular build output path directly from angular.json
   */
  private getBuildOutputPath(): string | null {
    try {
      const angularJson = fs.readJsonSync(path.join(this.projectRoot, 'angular.json'));

      // Get the first project (or default project if specified)
      const projectKey = angularJson.defaultProject || Object.keys(angularJson.projects)[0];
      const project = angularJson.projects[projectKey];

      // Return the outputPath from build options
      if (project?.architect?.build?.options?.outputPath) {
        return project.architect.build.options.outputPath;
      }
    } catch (error) {
      // Fall through to return null
    }
    return null;
  }

  /**
   * Create an ar archive (Unix archiver format used by Debian packages)
   */
  private async createArArchive(outputPath: string, files: Array<{ name: string, data: Buffer }>): Promise<void> {
    const AR_MAGIC = '!<arch>\n';
    const chunks: Buffer[] = [Buffer.from(AR_MAGIC)];

    for (const file of files) {
      // Pad filename to 16 bytes
      const filename = file.name.padEnd(16, ' ');
      // Current timestamp
      const timestamp = Math.floor(Date.now() / 1000).toString().padEnd(12, ' ');
      // Owner/Group ID (use 0 for root)
      const owner = '0'.padEnd(6, ' ');
      const group = '0'.padEnd(6, ' ');
      // File mode (octal, typically 100644 for regular files)
      const mode = '100644'.padEnd(8, ' ');
      // File size
      const size = file.data.length.toString().padEnd(10, ' ');
      // Magic bytes
      const magic = '`\n';

      // Create header (60 bytes total)
      const header = Buffer.from(filename + timestamp + owner + group + mode + size + magic);
      chunks.push(header);
      chunks.push(file.data);

      // Pad to even length (ar format requirement)
      if (file.data.length % 2 !== 0) {
        chunks.push(Buffer.from('\n'));
      }
    }

    const archive = Buffer.concat(chunks);
    await fs.writeFile(outputPath, archive);
  }

  /**
   * Create a tar.gz archive from a directory
   */
  private async createTarGz(sourceDir: string, outputPath: string): Promise<Buffer> {
    const tempFile = outputPath + '.tmp';

    await tar.create(
      {
        gzip: true,
        file: tempFile,
        cwd: path.dirname(sourceDir),
        portable: true,
      },
      [path.basename(sourceDir)]
    );

    const data = await fs.readFile(tempFile);
    await fs.remove(tempFile);
    return data;
  }

  /**
   * Run Angular build
   */
  private async runAngularBuild(): Promise<void> {
    if (!this.options.build) {
      return;
    }

    console.log(chalk.blue('🔨 Building Angular application...'));

    try {
      const buildCmd = this.options.configuration
        ? `ng build --configuration=${this.options.configuration}`
        : 'ng build';

      execSync(buildCmd, { stdio: this.options.verbose ? 'inherit' : 'pipe' });
      console.log(chalk.green('✅ Angular build completed successfully'));
    } catch (error) {
      throw new Error(`Angular build failed: ${error}`);
    }
  }

  /**
   * Create nipkg package structure
   */
  private async createPackageStructure(outputDir: string): Promise<string> {
    const nipkgDir = path.join(outputDir, 'nipkg');
    const filePackageDir = path.join(nipkgDir, 'file-package');
    const controlDir = path.join(filePackageDir, 'control');
    const dataDir = path.join(filePackageDir, 'data');
    const applicationFilesDir = path.join(dataDir, 'ApplicationFiles_64');

    // Clean up existing file-package directory if it exists
    if (!this.options.skipCleanup && await fs.pathExists(filePackageDir)) {
      console.log(chalk.yellow('🗑️  Cleaning up existing file-package directory...'));
      await fs.remove(filePackageDir);
    }

    // Create directory structure
    await fs.ensureDir(applicationFilesDir);
    await fs.ensureDir(controlDir);

    // Create debian-binary file
    await fs.writeFile(
      path.join(filePackageDir, 'debian-binary'),
      '2.0\\n'
    );

    // Create control file
    const controlContent = this.generateControlFile();
    await fs.writeFile(
      path.join(controlDir, 'control'),
      controlContent
    );

    console.log(chalk.green(`📁 Package structure created at ${nipkgDir}`));
    return nipkgDir;
  }

  /**
   * Generate control file content
   */
  private generateControlFile(): string {
    const depends = this.config.depends ? this.config.depends.join(', ') : '';

    return `Architecture: ${this.config.architecture || 'all'}
${depends ? `Depends: ${depends}` : '# Depends:'}
Description: ${this.config.description}
${this.config.displayName ? `DisplayName: ${this.config.displayName}` : '# DisplayName:'}
Maintainer: ${this.config.maintainer}
Package: ${this.config.name}
Plugin: file
${this.config.userVisible ? `UserVisible: ${this.config.userVisible}` : '# UserVisible:'}
Version: ${this.getVersion()}
`;
  }

  /**
   * Copy Angular build files to package structure
   */
  private async copyBuildFiles(nipkgDir: string): Promise<void> {
    if (!this.config.buildDir) {
      throw new Error(
        'buildDir is required in nipkg.config.json.\n' +
        'Please add the build output path from your angular.json, for example:\n' +
        '  "buildDir": "dist/my-app/browser"\n\n' +
        'Check your angular.json file for the outputPath value.'
      );
    }

    const buildDir = this.config.buildDir;
    const applicationFilesDir = path.join(nipkgDir, 'file-package', 'data', 'ApplicationFiles_64');

    if (!fs.existsSync(buildDir)) {
      throw new Error(
        `Angular build directory not found: ${buildDir}\n` +
        'Run \'ng build\' first or use --build flag.'
      );
    }

    console.log(chalk.blue('📋 Copying build files...'));
    await fs.copy(buildDir, applicationFilesDir, { overwrite: true });
    console.log(chalk.green(`✅ Build files copied to ${applicationFilesDir}`));
  }

  /**
   * Package the application into .nipkg format
   */
  private async packageApplication(nipkgDir: string): Promise<void> {
    const filePackageDir = path.join(nipkgDir, 'file-package');
    const controlDir = path.join(filePackageDir, 'control');
    const dataDir = path.join(filePackageDir, 'data');

    // Clean up existing packages
    if (!this.options.skipCleanup) {
      const existingPackages = (await fs.readdir(nipkgDir))
        .filter((file: string) => file.endsWith('.nipkg'));
      for (const pkg of existingPackages) {
        await fs.remove(path.join(nipkgDir, pkg));
        console.log(chalk.yellow(`🗑️  Removed existing package: ${pkg}`));
      }
    }

    console.log(chalk.blue('📦 Packaging application...'));

    try {
      // Create control.tar.gz
      if (this.options.verbose) {
        console.log(chalk.gray('  Creating control.tar.gz...'));
      }
      const controlTarGz = await this.createTarGz(controlDir, path.join(nipkgDir, 'control.tar.gz'));

      // Create data.tar.gz
      if (this.options.verbose) {
        console.log(chalk.gray('  Creating data.tar.gz...'));
      }
      const dataTarGz = await this.createTarGz(dataDir, path.join(nipkgDir, 'data.tar.gz'));

      // Read debian-binary file
      const debianBinary = await fs.readFile(path.join(filePackageDir, 'debian-binary'));

      // Create the .nipkg file as an ar archive
      const packageName = `${this.config.name}_${this.getVersion()}_${this.config.architecture || 'all'}.nipkg`;
      const packagePath = path.join(nipkgDir, packageName);

      if (this.options.verbose) {
        console.log(chalk.gray('  Creating ar archive...'));
      }

      await this.createArArchive(packagePath, [
        { name: 'debian-binary', data: debianBinary },
        { name: 'control.tar.gz', data: controlTarGz },
        { name: 'data.tar.gz', data: dataTarGz }
      ]);

      console.log(chalk.green(`🎉 Successfully created package: ${packageName}`));
      console.log(chalk.cyan(`📍 Package location: ${packagePath}`));
    } catch (error) {
      throw new Error(`Packaging failed: ${error}`);
    }
  }

  /**
   * Build the complete nipkg package
   */
  async build(): Promise<void> {
    try {
      // Validate environment
      if (!this.isAngularWorkspace()) {
        throw new Error('This is not an Angular workspace. Please run this command in an Angular project directory.');
      }

      console.log(chalk.cyan('🚀 Starting nipkg build process...'));

      // Run Angular build if requested
      await this.runAngularBuild();

      // Set up output directory
      const outputDir = this.config.outputDir || path.join(this.projectRoot, 'dist');
      await fs.ensureDir(outputDir);

      // Create package structure
      const nipkgDir = await this.createPackageStructure(outputDir);

      // Copy build files
      await this.copyBuildFiles(nipkgDir);

      // Package the application
      await this.packageApplication(nipkgDir);

      console.log(chalk.green.bold('🎯 Nipkg build completed successfully!'));

    } catch (error) {
      console.error(chalk.red.bold('❌ Build failed:'), (error as Error).message);
      process.exit(1);
    }
  }
}