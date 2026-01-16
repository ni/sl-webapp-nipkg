import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as fs from 'fs-extra';
import * as path from 'path';
import { NipkgConfig } from '../src/types';

// Simple unit tests that focus on the core functionality
describe('Types and Configuration', () => {
  describe('NipkgConfig interface', () => {
    test('should accept valid configuration', () => {
      const config: NipkgConfig = {
        name: 'test-app',
        version: '1.0.0',
        description: 'Test application',
        maintainer: 'Test User <test@example.com>'
      };

      expect(config.name).toBe('test-app');
      expect(config.version).toBe('1.0.0');
      expect(config.description).toBe('Test application');
      expect(config.maintainer).toBe('Test User <test@example.com>');
    });

    test('should accept optional fields', () => {
      const config: NipkgConfig = {
        name: 'test-app',
        version: '1.0.0',
        description: 'Test application',
        maintainer: 'Test User <test@example.com>',
        architecture: 'windows_x64',
        displayName: 'My Test App',
        projectName: 'custom-project',
        buildDir: 'dist/custom/browser',
        outputDir: 'custom-output',
        nipkgPath: 'C:\\\\Custom\\\\Path\\\\nipkg.exe',
        depends: ['dep1', 'dep2'],
        userVisible: true
      };

      expect(config.architecture).toBe('windows_x64');
      expect(config.depends).toEqual(['dep1', 'dep2']);
      expect(config.userVisible).toBe(true);
    });
  });
});

describe('Configuration File Handling', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create temp directory for tests
    tempDir = await fs.mkdtemp(path.join(__dirname, 'temp-'));
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.remove(tempDir);
  });

  test('should read and parse config file correctly', async () => {
    const config = {
      name: 'file-test-app',
      version: '2.1.0',
      description: 'Config file test',
      maintainer: 'File Test <file@test.com>',
      architecture: 'windows_x64'
    };

    const configPath = path.join(tempDir, 'nipkg.config.json');
    await fs.writeJson(configPath, config, { spaces: 2 });

    const readConfig = await fs.readJson(configPath);
    expect(readConfig).toEqual(config);
  });

  test('should write config file with proper formatting', async () => {
    const config = {
      name: 'write-test-app',
      version: '1.5.2',
      description: 'Write test application',
      maintainer: 'Write Test <write@test.com>'
    };

    const configPath = path.join(tempDir, 'output-config.json');
    await fs.writeJson(configPath, config, { spaces: 2 });

    const fileContent = await fs.readFile(configPath, 'utf-8');
    expect(fileContent).toContain('"name": "write-test-app"');
    expect(fileContent).toContain('"version": "1.5.2"');
  });
});

describe('Utility Functions', () => {
  describe('Angular project detection', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(__dirname, 'util-temp-'));
    });

    afterEach(async () => {
      await fs.remove(tempDir);
    });

    test('should detect Angular workspace when angular.json exists', async () => {
      const angularJsonPath = path.join(tempDir, 'angular.json');
      await fs.writeJson(angularJsonPath, { version: 1 });

      const isAngularWorkspace = fs.existsSync(angularJsonPath);
      expect(isAngularWorkspace).toBe(true);
    });

    test('should not detect Angular workspace when angular.json is missing', async () => {
      const angularJsonPath = path.join(tempDir, 'angular.json');
      const isAngularWorkspace = fs.existsSync(angularJsonPath);
      expect(isAngularWorkspace).toBe(false);
    });
  });

  describe('Project name extraction', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(__dirname, 'name-temp-'));
    });

    afterEach(async () => {
      await fs.remove(tempDir);
    });

    test('should extract project name from angular.json', async () => {
      const angularJson = {
        version: 1,
        defaultProject: 'my-angular-app',
        projects: {
          'my-angular-app': { projectType: 'application' }
        }
      };

      const angularJsonPath = path.join(tempDir, 'angular.json');
      await fs.writeJson(angularJsonPath, angularJson);

      const readAngularJson = await fs.readJson(angularJsonPath);
      const projectName = readAngularJson.defaultProject || 
                          Object.keys(readAngularJson.projects)[0];
      
      expect(projectName).toBe('my-angular-app');
    });

    test('should fall back to first project when no default', async () => {
      const angularJson = {
        version: 1,
        projects: {
          'first-project': { projectType: 'application' },
          'second-project': { projectType: 'library' }
        }
      };

      const angularJsonPath = path.join(tempDir, 'angular.json');
      await fs.writeJson(angularJsonPath, angularJson);

      const readAngularJson = await fs.readJson(angularJsonPath);
      const projectName = Object.keys(readAngularJson.projects)[0];
      
      expect(projectName).toBe('first-project');
    });
  });

  describe('Control file generation', () => {
    test('should generate proper control file content', () => {
      const config: NipkgConfig = {
        name: 'control-test-app',
        version: '1.2.3',
        description: 'Control file test',
        maintainer: 'Control Test <control@test.com>',
        architecture: 'windows_x64',
        displayName: 'Control Test App',
        userVisible: true,
        depends: ['runtime-dep-1', 'runtime-dep-2']
      };

      const generateControlFile = (cfg: NipkgConfig): string => {
        const depends = cfg.depends ? cfg.depends.join(', ') : '';
        
        return `Architecture: ${cfg.architecture || 'windows_x64'}
${depends ? `Depends: ${depends}` : '# Depends:'}
Description: ${cfg.description}
${cfg.displayName ? `DisplayName: ${cfg.displayName}` : '# DisplayName:'}
Maintainer: ${cfg.maintainer}
Package: ${cfg.name}
Plugin: file
${cfg.userVisible ? `UserVisible: ${cfg.userVisible}` : '# UserVisible:'}
Version: ${cfg.version}
`;
      };

      const controlContent = generateControlFile(config);
      
      expect(controlContent).toContain('Package: control-test-app');
      expect(controlContent).toContain('Version: 1.2.3');
      expect(controlContent).toContain('Depends: runtime-dep-1, runtime-dep-2');
      expect(controlContent).toContain('UserVisible: true');
      expect(controlContent).toContain('DisplayName: Control Test App');
    });

    test('should handle missing optional fields', () => {
      const config: NipkgConfig = {
        name: 'minimal-app',
        version: '1.0.0',
        description: 'Minimal configuration',
        maintainer: 'Minimal <minimal@test.com>'
      };

      const generateControlFile = (cfg: NipkgConfig): string => {
        const depends = cfg.depends ? cfg.depends.join(', ') : '';
        
        return `Architecture: ${cfg.architecture || 'windows_x64'}
${depends ? `Depends: ${depends}` : '# Depends:'}
Description: ${cfg.description}
${cfg.displayName ? `DisplayName: ${cfg.displayName}` : '# DisplayName:'}
Maintainer: ${cfg.maintainer}
Package: ${cfg.name}
Plugin: file
${cfg.userVisible ? `UserVisible: ${cfg.userVisible}` : '# UserVisible:'}
Version: ${cfg.version}
`;
      };

      const controlContent = generateControlFile(config);
      
      expect(controlContent).toContain('Package: minimal-app');
      expect(controlContent).toContain('Architecture: windows_x64');
      expect(controlContent).toContain('# Depends:');
      expect(controlContent).toContain('# DisplayName:');
      expect(controlContent).toContain('# UserVisible:');
    });
  });
});

describe('File Operations', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(__dirname, 'file-temp-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  test('should create directory structure correctly', async () => {
    const nipkgDir = path.join(tempDir, 'nipkg');
    const filePackageDir = path.join(nipkgDir, 'file-package');
    const controlDir = path.join(filePackageDir, 'control');
    const dataDir = path.join(filePackageDir, 'data');
    const applicationFilesDir = path.join(dataDir, 'ApplicationFiles_64');

    // Create structure
    await fs.ensureDir(applicationFilesDir);
    await fs.ensureDir(controlDir);

    // Verify structure exists
    expect(await fs.pathExists(nipkgDir)).toBe(true);
    expect(await fs.pathExists(filePackageDir)).toBe(true);
    expect(await fs.pathExists(controlDir)).toBe(true);
    expect(await fs.pathExists(dataDir)).toBe(true);
    expect(await fs.pathExists(applicationFilesDir)).toBe(true);
  });

  test('should clean up existing file-package directory before creating new one', async () => {
    const nipkgDir = path.join(tempDir, 'nipkg');
    const filePackageDir = path.join(nipkgDir, 'file-package');
    const oldFile = path.join(filePackageDir, 'old-file.txt');

    // Create existing file-package directory with a file
    await fs.ensureDir(filePackageDir);
    await fs.writeFile(oldFile, 'old content');
    
    // Verify old file exists
    expect(await fs.pathExists(oldFile)).toBe(true);

    // Simulate cleanup (what the builder would do)
    const skipCleanup = false;
    if (!skipCleanup && await fs.pathExists(filePackageDir)) {
      await fs.remove(filePackageDir);
    }

    // Recreate structure
    const controlDir = path.join(filePackageDir, 'control');
    const dataDir = path.join(filePackageDir, 'data');
    const applicationFilesDir = path.join(dataDir, 'ApplicationFiles_64');
    
    await fs.ensureDir(applicationFilesDir);
    await fs.ensureDir(controlDir);

    // Verify old file is gone and new structure exists
    expect(await fs.pathExists(oldFile)).toBe(false);
    expect(await fs.pathExists(filePackageDir)).toBe(true);
    expect(await fs.pathExists(controlDir)).toBe(true);
    expect(await fs.pathExists(dataDir)).toBe(true);
    expect(await fs.pathExists(applicationFilesDir)).toBe(true);
  });

  test('should preserve existing files when skipCleanup is true', async () => {
    const nipkgDir = path.join(tempDir, 'nipkg');
    const filePackageDir = path.join(nipkgDir, 'file-package');
    const oldFile = path.join(filePackageDir, 'preserved-file.txt');

    // Create existing file-package directory with a file
    await fs.ensureDir(filePackageDir);
    await fs.writeFile(oldFile, 'preserved content');
    
    // Verify old file exists
    expect(await fs.pathExists(oldFile)).toBe(true);

    // Simulate skipCleanup behavior
    const skipCleanup = true;
    if (!skipCleanup && await fs.pathExists(filePackageDir)) {
      await fs.remove(filePackageDir);
    }

    // Ensure directories (this will not remove existing files)
    const controlDir = path.join(filePackageDir, 'control');
    const dataDir = path.join(filePackageDir, 'data');
    const applicationFilesDir = path.join(dataDir, 'ApplicationFiles_64');
    
    await fs.ensureDir(applicationFilesDir);
    await fs.ensureDir(controlDir);

    // Verify old file is preserved and new structure exists
    expect(await fs.pathExists(oldFile)).toBe(true);
    expect(await fs.pathExists(filePackageDir)).toBe(true);
    expect(await fs.pathExists(controlDir)).toBe(true);
    expect(await fs.pathExists(dataDir)).toBe(true);
    expect(await fs.pathExists(applicationFilesDir)).toBe(true);

    // Verify content is preserved
    const content = await fs.readFile(oldFile, 'utf-8');
    expect(content).toBe('preserved content');
  });

  test('should copy files correctly', async () => {
    // Create source directory with test files
    const sourceDir = path.join(tempDir, 'source');
    const destDir = path.join(tempDir, 'dest');

    await fs.ensureDir(sourceDir);
    await fs.writeFile(path.join(sourceDir, 'index.html'), '<html>Test</html>');
    await fs.writeFile(path.join(sourceDir, 'main.js'), 'console.log("test");');
    
    const assetsDir = path.join(sourceDir, 'assets');
    await fs.ensureDir(assetsDir);
    await fs.writeFile(path.join(assetsDir, 'logo.png'), 'fake-image-data');

    // Copy files
    await fs.copy(sourceDir, destDir);

    // Verify files were copied
    expect(await fs.pathExists(path.join(destDir, 'index.html'))).toBe(true);
    expect(await fs.pathExists(path.join(destDir, 'main.js'))).toBe(true);
    expect(await fs.pathExists(path.join(destDir, 'assets', 'logo.png'))).toBe(true);

    // Verify content
    const htmlContent = await fs.readFile(path.join(destDir, 'index.html'), 'utf-8');
    expect(htmlContent).toBe('<html>Test</html>');
  });
});

describe('Path and Environment', () => {
  test('should handle Windows paths correctly', () => {
    const windowsPath = 'C:\\\\Program Files\\\\National Instruments\\\\NI Package Manager\\\\nipkg.exe';
    expect(windowsPath).toContain('Program Files');
    expect(windowsPath).toContain('nipkg.exe');
  });

  test('should normalize path separators', () => {
    const testPath = path.join('dist', 'my-app', 'browser');
    const normalized = path.normalize(testPath);
    expect(normalized).toBeTruthy();
    expect(typeof normalized).toBe('string');
  });

  test('should resolve relative paths', () => {
    const relativePath = './dist/nipkg';
    const resolved = path.resolve(relativePath);
    expect(path.isAbsolute(resolved)).toBe(true);
  });
});

describe('Build Options Validation', () => {
  test('should validate build options correctly', () => {
    const validateBuildOptions = (options: any) => {
      const validOptions = {
        build: typeof options.build === 'boolean' ? options.build : false,
        configuration: typeof options.configuration === 'string' ? options.configuration : undefined,
        verbose: typeof options.verbose === 'boolean' ? options.verbose : false,
        skipCleanup: typeof options.skipCleanup === 'boolean' ? options.skipCleanup : false
      };
      return validOptions;
    };

    const input1 = { build: true, configuration: 'production' };
    const result1 = validateBuildOptions(input1);
    expect(result1.build).toBe(true);
    expect(result1.configuration).toBe('production');
    expect(result1.verbose).toBe(false);

    const input2 = { verbose: 'invalid' }; // invalid type
    const result2 = validateBuildOptions(input2);
    expect(result2.verbose).toBe(false); // should default to false
  });

  test('should handle configuration validation', () => {
    const validateConfiguration = (config: any): string[] => {
      const errors: string[] = [];
      const required = ['name', 'version', 'description', 'maintainer'];
      
      for (const field of required) {
        if (!config[field] || typeof config[field] !== 'string') {
          errors.push(`Missing or invalid ${field}`);
        }
      }

      if (config.version && !/^\d+\.\d+\.\d+(\.\d+)?$/.test(config.version)) {
        errors.push('Invalid version format');
      }

      return errors;
    };

    // Valid config
    const validConfig = {
      name: 'test-app',
      version: '1.0.0',
      description: 'Test app',
      maintainer: 'Test <test@example.com>'
    };
    expect(validateConfiguration(validConfig)).toEqual([]);

    // Invalid config
    const invalidConfig = {
      name: 'test-app',
      version: 'invalid-version'
    };
    const errors = validateConfiguration(invalidConfig);
    expect(errors).toContain('Missing or invalid description');
    expect(errors).toContain('Invalid version format');
  });
});