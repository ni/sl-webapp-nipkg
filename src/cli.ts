#!/usr/bin/env node
/* eslint-disable no-console */

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { SystemLinkNipkgBuilder } from './builder.js';
import { NipkgConfig, BuildOptions } from './types.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Read version from package.json
const packageJson = await fs.readJson(path.join(dirname, '../package.json')) as { version: string };

const program = new Command();

program
    .name('sl-webapp-nipkg')
    .description('Build tool for packaging Node.js applications into SystemLink WebApp .nipkg format')
    .version(packageJson.version);

program
    .command('build')
    .description('Build and package application as SystemLink WebApp .nipkg')
    .option('-c, --configuration <config>', 'Build configuration (e.g., production)')
    .option('-b, --build', 'Run build command before packaging', false)
    .option('-v, --verbose', 'Verbose output', false)
    .option('--skip-cleanup', 'Skip cleanup of existing packages', false)
    .option('--build-suffix <suffix>', 'Add a suffix to the package name (e.g., build ID)')
    .option('--config <path>', 'Path to nipkg config file', 'nipkg.config.json')
    .option('--build-dir <path>', 'Build output directory to package')
    .option('--name <name>', 'Package name')
    .option('--version <version>', 'Package version')
    .option('--description <description>', 'Package description')
    .option('--maintainer <maintainer>', 'Maintainer information')
    .option('--output-dir <path>', 'Output directory for nipkg files')
    .action(async (options: {
        configuration?: string,
        build: boolean,
        verbose: boolean,
        skipCleanup: boolean,
        buildSuffix?: string,
        config: string,
        buildDir?: string,
        name?: string,
        version?: string,
        description?: string,
        maintainer?: string,
        outputDir?: string
    }) => {
        try {
            const configPath = path.resolve(options.config);

            let config: NipkgConfig = {};

            if (fs.existsSync(configPath)) {
                config = await fs.readJson(configPath) as NipkgConfig;
                console.log(chalk.blue(`📋 Using config from: ${configPath}`));
            } else if (options.config !== 'nipkg.config.json') {
                // If user specified a custom config path and it doesn't exist, throw error
                throw new Error(`Config file not found: ${configPath}`);
            } else {
                // No config file found, will rely on CLI options and defaults
                console.log(chalk.yellow('⚠️  No nipkg.config.json found, using CLI options and defaults'));
            }

            const buildOptions: BuildOptions = {
                build: options.build,
                configuration: options.configuration,
                verbose: options.verbose,
                skipCleanup: options.skipCleanup,
                buildSuffix: options.buildSuffix,
                buildDir: options.buildDir,
                name: options.name,
                version: options.version,
                description: options.description,
                maintainer: options.maintainer,
                outputDir: options.outputDir
            };

            const builder = new SystemLinkNipkgBuilder(config, buildOptions);
            await builder.build();
        } catch (error) {
            console.error(chalk.red.bold('❌ Error:'), (error as Error).message);
            process.exit(1);
        }
    });

program
    .command('init')
    .description('Initialize nipkg.config.json in current directory')
    .action(async () => {
        try {
            const configPath = path.resolve('nipkg.config.json');

            if (fs.existsSync(configPath)) {
                console.log(chalk.yellow('⚠️  nipkg.config.json already exists'));
                return;
            }

            const config = await generateConfigFromPackageJson();
            await fs.writeJson(configPath, config, { spaces: 2 });

            console.log(chalk.green('✅ Created nipkg.config.json'));
            console.log(chalk.cyan('💡 Edit the file to customize your package configuration'));
        } catch (error) {
            console.error(chalk.red.bold('❌ Error:'), (error as Error).message);
            process.exit(1);
        }
    });

async function generateConfigFromPackageJson(): Promise<NipkgConfig> {
    const packageJsonPath = path.resolve('package.json');

    let projectPackageJson: { [key: string]: unknown } = {};
    if (fs.existsSync(packageJsonPath)) {
        projectPackageJson = await fs.readJson(packageJsonPath) as { [key: string]: unknown };
    }

    const projectName = (projectPackageJson.name as string) || path.basename(process.cwd());
    const maintainer = projectPackageJson.author as string;

    return {
        ...(maintainer && { maintainer }),
        architecture: 'all',
        displayName: projectName,
        buildDir: 'dist',
        buildCommand: 'npm run build',
        userVisible: true
    };
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: unknown) => {
    console.error(chalk.red.bold('❌ Unhandled error:'), error);
    process.exit(1);
});

program.parse();