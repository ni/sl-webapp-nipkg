#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
const chalk = require('chalk');
import { AngularNipkgBuilder } from './builder';
import { NipkgConfig, BuildOptions } from './types';

const program = new Command();

program
  .name('ng-nipkg')
  .description('Build tool for packaging Angular applications into .nipkg format')
  .version('1.0.0');

program
  .command('build')
  .description('Build and package Angular application as .nipkg')
  .option('-c, --configuration <config>', 'Angular build configuration (e.g., production)')
  .option('-b, --build', 'Run ng build before packaging', false)
  .option('-v, --verbose', 'Verbose output', false)
  .option('--skip-cleanup', 'Skip cleanup of existing packages', false)
  .option('--config <path>', 'Path to nipkg config file', 'nipkg.config.json')
  .action(async (options: any) => {
    try {
      const configPath = path.resolve(options.config);
      
      let config: NipkgConfig;
      
      if (fs.existsSync(configPath)) {
        config = await fs.readJson(configPath);
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

      const builder = new AngularNipkgBuilder(config, buildOptions);
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
  
  let packageJson: any = {};
  if (fs.existsSync(packageJsonPath)) {
    packageJson = await fs.readJson(packageJsonPath);
  }

  const projectName = packageJson.name || path.basename(process.cwd());
  
  return {
    name: projectName,
    version: packageJson.version || '1.0.0',
    description: packageJson.description || `${projectName} Angular application`,
    maintainer: packageJson.author || 'user_name <user@example.com>',
    architecture: 'windows_x64',
    displayName: projectName,
    buildDir: `dist/${projectName}/browser`,
    userVisible: true
  };
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: any) => {
  console.error(chalk.red.bold('❌ Unhandled error:'), error);
  process.exit(1);
});

program.parse();