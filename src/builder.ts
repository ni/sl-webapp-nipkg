import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
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
   * Find nipkg executable path
   */
  private findNipkgPath(): string {
    if (this.config.nipkgPath) {
      return this.config.nipkgPath;
    }

    const defaultPath = 'C:\\Program Files\\National Instruments\\NI Package Manager\\nipkg.exe';
    if (fs.existsSync(defaultPath)) {
      return defaultPath;
    }

    // Try to find in PATH
    try {
      const result = execSync('where nipkg', { encoding: 'utf8' }).trim();
      return result.split('\\n')[0];
    } catch {
      throw new Error('nipkg executable not found. Please install NI Package Manager or specify the path in config.');
    }
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
    
    return `Architecture: ${this.config.architecture || 'windows_x64'}
${depends ? `Depends: ${depends}` : '# Depends:'}
Description: ${this.config.description}
${this.config.displayName ? `DisplayName: ${this.config.displayName}` : '# DisplayName:'}
Maintainer: ${this.config.maintainer}
Package: ${this.config.name}
Plugin: file
${this.config.userVisible ? `UserVisible: ${this.config.userVisible}` : '# UserVisible:'}
Version: ${this.config.version}
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
   * Package the application using nipkg
   */
  private async packageApplication(nipkgDir: string): Promise<void> {
    const nipkgPath = this.findNipkgPath();
    const filePackageDir = path.join(nipkgDir, 'file-package');

      // Clean up existing packages
      if (!this.options.skipCleanup) {
        const existingPackages = (await fs.readdir(nipkgDir))
          .filter((file: string) => file.endsWith('.nipkg'));      for (const pkg of existingPackages) {
        await fs.remove(path.join(nipkgDir, pkg));
        console.log(chalk.yellow(`🗑️  Removed existing package: ${pkg}`));
      }
    }

    console.log(chalk.blue('📦 Packaging application...'));
    
    try {
      const cmd = `"${nipkgPath}" pack "${filePackageDir}" "${nipkgDir}"`;
      execSync(cmd, { stdio: this.options.verbose ? 'inherit' : 'pipe' });
      
      // Find the created package
      const packages = (await fs.readdir(nipkgDir))
        .filter((file: string) => file.endsWith('.nipkg'));
      
      if (packages.length > 0) {
        console.log(chalk.green(`🎉 Successfully created package: ${packages[0]}`));
        console.log(chalk.cyan(`📍 Package location: ${path.join(nipkgDir, packages[0])}`));
      }
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