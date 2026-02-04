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
    .name('sl-nipkg')
    .description('Build tool for packaging Node.js applications into SystemLink WebApp .nipkg format')
    .version(packageJson.version);

program
    .command('build')
    .description('Build and package Node.js application as SystemLink WebApp .nipkg')
    .option('-c, --configuration <config>', 'Build configuration (e.g., production)')
    .option('-b, --build', 'Run build command before packaging', false)
    .option('-v, --verbose', 'Verbose output', false)
    .option('--skip-cleanup', 'Skip cleanup of existing packages', false)
    .option('--config <path>', 'Path to nipkg config file', 'nipkg.config.json')
    .action(async (options: { configuration?: string, build: boolean, verbose: boolean, skipCleanup: boolean, config: string }) => {
        try {
            const configPath = path.resolve(options.config);

            let config: NipkgConfig;

            if (fs.existsSync(configPath)) {
                config = await fs.readJson(configPath) as NipkgConfig;
                console.log(chalk.blue(`📋 Using config from: ${configPath}`));
            } else {
                // Try to auto-generate config from package.json
                config = await generateConfigFromPackageJson();
                console.log(chalk.yellow('⚠️  No nipkg.config.json found, using auto-generated config'));
                console.log(chalk.cyan('💡 Create a nipkg.config.json file for customization'));
            }

            const buildOptions: BuildOptions = {
                build: options.build,
                configuration: options.configuration,
                verbose: options.verbose,
                skipCleanup: options.skipCleanup
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

    return {
        maintainer: (projectPackageJson.author as string) || 'user_name <user@example.com>',
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