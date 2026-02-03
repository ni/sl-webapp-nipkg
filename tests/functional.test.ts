import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as childProcess from 'child_process';
import { AngularNipkgBuilder } from '../src/builder.js';
import type { NipkgConfig } from '../src/types.js';

// Mock child_process and chalk modules
jest.mock('child_process');
jest.mock('chalk', () => {
    const createMock = (): ((str: string) => string) & { bold: (str: string) => string } => {
        const fn = ((str: string): string => str) as ((str: string) => string) & { bold: (str: string) => string };
        fn.bold = (str: string): string => str;
        return fn;
    };

    const chalk = {
        cyan: createMock(),
        blue: createMock(),
        yellow: createMock(),
        gray: createMock(),
        red: createMock(),
        green: createMock()
    };

    return chalk;
});

const mockedExecSync = jest.mocked(childProcess.execSync);

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

            // Type check by assignment
            const _name: string = config.name;
            const _version: string | undefined = config.version;
            const _description: string = config.description;
            const _maintainer: string = config.maintainer;

            expect(config).toBeDefined();
            expect(_name).toBe('test-app');
            expect(_version).toBe('1.0.0');
            expect(_description).toBe('Test application');
            expect(_maintainer).toBe('Test User <test@example.com>');
        });

        test('should accept optional fields', () => {
            const config: NipkgConfig = {
                name: 'test-app',
                version: '1.0.0',
                description: 'Test application',
                maintainer: 'Test User <test@example.com>',
                architecture: 'all',
                displayName: 'My Test App',
                projectName: 'custom-project',
                buildDir: 'dist/custom/browser',
                outputDir: 'custom-output',
                depends: ['dep1', 'dep2'],
                userVisible: true
            };

            const _architecture: string | undefined = config.architecture;
            const _depends: string[] | undefined = config.depends;
            const _userVisible: boolean | undefined = config.userVisible;

            expect(config).toBeDefined();
            expect(_architecture).toBe('all');
            expect(_depends).toEqual(['dep1', 'dep2']);
            expect(_userVisible).toBe(true);
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
            architecture: 'all'
        };

        const configPath = path.join(tempDir, 'nipkg.config.json');
        await fs.writeJson(configPath, config, { spaces: 2 });

        const readConfig: typeof config = await fs.readJson(configPath) as typeof config;
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

        test('should not detect Angular workspace when angular.json is missing', () => {
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

            const readAngularJson = await fs.readJson(angularJsonPath) as typeof angularJson;
            const projectName = readAngularJson.defaultProject
                || Object.keys(readAngularJson.projects)[0];

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

            const readAngularJson = await fs.readJson(angularJsonPath) as typeof angularJson;
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
                architecture: 'all',
                displayName: 'Control Test App',
                userVisible: true,
                depends: ['runtime-dep-1', 'runtime-dep-2']
            };

            const generateControlFile = (cfg: NipkgConfig): string => {
                const dependsArray = cfg.depends ?? [];
                const depends = dependsArray.join(', ');

                return `Architecture: ${cfg.architecture ?? 'all'}
${depends.length > 0 ? `Depends: ${depends}` : '# Depends:'}
Description: ${cfg.description}
${cfg.displayName !== undefined ? `DisplayName: ${cfg.displayName}` : '# DisplayName:'}
Maintainer: ${cfg.maintainer}
Package: ${cfg.name}
Plugin: file
${cfg.userVisible !== undefined ? `UserVisible: ${cfg.userVisible}` : '# UserVisible:'}
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
                const dependsArray = cfg.depends ?? [];
                const depends = dependsArray.join(', ');

                return `Architecture: ${cfg.architecture ?? 'all'}
${depends.length > 0 ? `Depends: ${depends}` : '# Depends:'}
Description: ${cfg.description}
${cfg.displayName !== undefined ? `DisplayName: ${cfg.displayName}` : '# DisplayName:'}
Maintainer: ${cfg.maintainer}
Package: ${cfg.name}
Plugin: file
${cfg.userVisible !== undefined ? `UserVisible: ${cfg.userVisible}` : '# UserVisible:'}
Version: ${cfg.version}
`;
            };

            const controlContent = generateControlFile(config);

            expect(controlContent).toContain('Package: minimal-app');
            expect(controlContent).toContain('Architecture: all');
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
        // Always cleanup when skipCleanup is false
        if (await fs.pathExists(filePackageDir)) {
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
        interface BuildOptions {
            build?: boolean;
            configuration?: string;
            verbose?: boolean;
            skipCleanup?: boolean;
        }

        const validateBuildOptions = (
            options: BuildOptions
        ): {
            build: boolean,
            configuration: string | undefined,
            verbose: boolean,
            skipCleanup: boolean
        } => {
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

        const input2 = { verbose: 'invalid' } as unknown as BuildOptions; // invalid type
        const result2 = validateBuildOptions(input2);
        expect(result2.verbose).toBe(false); // should default to false
    });

    test('should handle configuration validation', () => {
        interface ConfigToValidate {
            name?: string;
            version?: string;
            description?: string;
            maintainer?: string;
        }

        const validateConfiguration = (config: ConfigToValidate): string[] => {
            const errors: string[] = [];
            const required: (keyof ConfigToValidate)[] = ['name', 'version', 'description', 'maintainer'];

            for (const field of required) {
                if (config[field] === undefined || typeof config[field] !== 'string') {
                    errors.push(`Missing or invalid ${field}`);
                }
            }

            if (config.version !== undefined && !/^\d+\.\d+\.\d+(\.\d+)?$/.test(config.version)) {
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

describe('AngularNipkgBuilder Integration Tests', () => {
    let tempDir: string;
    let config: NipkgConfig;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(__dirname, 'builder-temp-'));

        config = {
            name: 'test-app',
            version: '1.0.0',
            description: 'Test application',
            maintainer: 'Test <test@example.com>',
            architecture: 'all',
            buildDir: path.join(tempDir, 'dist', 'test-app', 'browser')
        };

        // Mock execSync to prevent actual Angular build
        mockedExecSync.mockImplementation((() => Buffer.from('')) as unknown as typeof childProcess.execSync);
    });

    afterEach(async () => {
        await fs.remove(tempDir);
        jest.clearAllMocks();
    });

    test('should successfully build package without running Angular build', async () => {
        // Create Angular workspace structure
        const angularJsonPath = path.join(tempDir, 'angular.json');
        await fs.writeJson(angularJsonPath, {
            version: 1,
            projects: { 'test-app': { projectType: 'application' } }
        });

        // Create build directory with sample files
        await fs.ensureDir(config.buildDir!);
        await fs.writeFile(path.join(config.buildDir!, 'index.html'), '<html>Test</html>');
        await fs.writeFile(path.join(config.buildDir!, 'main.js'), 'console.log("test");');

        // Change to temp directory
        const originalCwd = process.cwd();
        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(config, { build: false });
            await builder.build();

            // Verify package was created
            const nipkgDir = path.join(tempDir, 'dist', 'nipkg');
            const packageFile = `${config.name}_${config.version}_${config.architecture}.nipkg`;
            const packagePath = path.join(nipkgDir, packageFile);

            expect(await fs.pathExists(packagePath)).toBe(true);
            expect(await fs.pathExists(path.join(nipkgDir, 'file-package', 'control', 'control'))).toBe(true);
            expect(await fs.pathExists(path.join(nipkgDir, 'file-package', 'data', 'ApplicationFiles_64'))).toBe(true);

            // Verify Angular build was not called
            expect(mockedExecSync).not.toHaveBeenCalled();
        } finally {
            process.chdir(originalCwd);
        }
    });

    test('should run Angular build when build option is true', async () => {
        const angularJsonPath = path.join(tempDir, 'angular.json');
        await fs.writeJson(angularJsonPath, {
            version: 1,
            projects: { 'test-app': { projectType: 'application' } }
        });

        await fs.ensureDir(config.buildDir!);
        await fs.writeFile(path.join(config.buildDir!, 'index.html'), '<html>Test</html>');

        const originalCwd = process.cwd();
        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(config, { build: true });
            await builder.build();

            // Verify Angular build was called
            expect(mockedExecSync).toHaveBeenCalledWith('ng build', expect.any(Object));
        } finally {
            process.chdir(originalCwd);
        }
    });

    test('should run Angular build with configuration option', async () => {
        const angularJsonPath = path.join(tempDir, 'angular.json');
        await fs.writeJson(angularJsonPath, {
            version: 1,
            projects: { 'test-app': { projectType: 'application' } }
        });

        await fs.ensureDir(config.buildDir!);
        await fs.writeFile(path.join(config.buildDir!, 'index.html'), '<html>Test</html>');

        const originalCwd = process.cwd();
        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(config, {
                build: true,
                configuration: 'production'
            });
            await builder.build();

            expect(mockedExecSync).toHaveBeenCalledWith(
                'ng build --configuration=production',
                expect.any(Object)
            );
        } finally {
            process.chdir(originalCwd);
        }
    });

    test('should use custom output directory when specified', async () => {
        const customOutputDir = path.join(tempDir, 'custom-output');
        config.outputDir = customOutputDir;

        const angularJsonPath = path.join(tempDir, 'angular.json');
        await fs.writeJson(angularJsonPath, {
            version: 1,
            projects: { 'test-app': { projectType: 'application' } }
        });

        await fs.ensureDir(config.buildDir!);
        await fs.writeFile(path.join(config.buildDir!, 'index.html'), '<html>Test</html>');

        const originalCwd = process.cwd();
        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(config, { build: false });
            await builder.build();

            const packageFile = `${config.name}_${config.version}_${config.architecture}.nipkg`;
            // Package is created in customOutputDir/nipkg, not directly in customOutputDir
            expect(await fs.pathExists(path.join(customOutputDir, 'nipkg', packageFile))).toBe(true);
        } finally {
            process.chdir(originalCwd);
        }
    });

    test('should read version from package.json when not specified in config', async () => {
        const { version: _version, ...configWithoutVersion } = config;

        const packageJsonPath = path.join(tempDir, 'package.json');
        await fs.writeJson(packageJsonPath, { version: '2.5.3' });

        const angularJsonPath = path.join(tempDir, 'angular.json');
        await fs.writeJson(angularJsonPath, {
            version: 1,
            projects: { 'test-app': { projectType: 'application' } }
        });

        await fs.ensureDir(config.buildDir!);
        await fs.writeFile(path.join(config.buildDir!, 'index.html'), '<html>Test</html>');

        const originalCwd = process.cwd();
        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(configWithoutVersion, { build: false });
            await builder.build();

            const packageFile = `${config.name}_2.5.3_${config.architecture}.nipkg`;
            const packagePath = path.join(tempDir, 'dist', 'nipkg', packageFile);
            expect(await fs.pathExists(packagePath)).toBe(true);
        } finally {
            process.chdir(originalCwd);
        }
    });

    test('should use default version 1.0.0 when not found anywhere', async () => {
        const { version: _version, ...configWithoutVersion } = config;

        const angularJsonPath = path.join(tempDir, 'angular.json');
        await fs.writeJson(angularJsonPath, {
            version: 1,
            projects: { 'test-app': { projectType: 'application' } }
        });

        await fs.ensureDir(config.buildDir!);
        await fs.writeFile(path.join(config.buildDir!, 'index.html'), '<html>Test</html>');

        const originalCwd = process.cwd();
        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(configWithoutVersion, { build: false });
            await builder.build();

            const packageFile = `${config.name}_1.0.0_${config.architecture}.nipkg`;
            const packagePath = path.join(tempDir, 'dist', 'nipkg', packageFile);
            expect(await fs.pathExists(packagePath)).toBe(true);
        } finally {
            process.chdir(originalCwd);
        }
    });
});

describe('AngularNipkgBuilder Error Handling', () => {
    let tempDir: string;
    let config: NipkgConfig;
    let originalCwd: string;

    beforeEach(async () => {
        originalCwd = process.cwd();
        tempDir = await fs.mkdtemp(path.join(__dirname, 'error-temp-'));

        config = {
            name: 'test-app',
            version: '1.0.0',
            description: 'Test application',
            maintainer: 'Test <test@example.com>',
            buildDir: path.join(tempDir, 'dist', 'test-app', 'browser')
        };

        mockedExecSync.mockImplementation((() => Buffer.from('')) as unknown as typeof childProcess.execSync);
    });

    afterEach(async () => {
        // Always change back to original directory before cleanup
        process.chdir(originalCwd);
        await fs.remove(tempDir);
        jest.clearAllMocks();
    });

    test('should throw error when not in Angular workspace', async () => {
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(config, { build: false });
            await builder.build();

            // If we reach here, build() didn't call process.exit
            fail('Expected build() to call process.exit');
        } catch {
            // Check if process.exit was called
            expect(mockExit).toHaveBeenCalledWith(1);
        } finally {
            mockExit.mockRestore();
        }
    });

    test('should throw error when buildDir is not specified', async () => {
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
        const { buildDir: _buildDir, ...configWithoutBuildDir } = config;

        const angularJsonPath = path.join(tempDir, 'angular.json');
        await fs.writeJson(angularJsonPath, {
            version: 1,
            projects: { 'test-app': { projectType: 'application' } }
        });

        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(configWithoutBuildDir, { build: false });
            await builder.build();

            expect(mockExit).toHaveBeenCalledWith(1);
        } catch {
            // Expected to call process.exit
            expect(mockExit).toHaveBeenCalledWith(1);
        } finally {
            mockExit.mockRestore();
        }
    });

    test('should throw error when build directory does not exist', async () => {
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
        const angularJsonPath = path.join(tempDir, 'angular.json');
        await fs.writeJson(angularJsonPath, {
            version: 1,
            projects: { 'test-app': { projectType: 'application' } }
        });

        // Don't create build directory

        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(config, { build: false });
            await builder.build();

            expect(mockExit).toHaveBeenCalledWith(1);
        } catch {
            expect(mockExit).toHaveBeenCalledWith(1);
        } finally {
            mockExit.mockRestore();
        }
    });

    test('should throw error when Angular build fails', async () => {
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
        mockedExecSync.mockImplementation(() => {
            throw new Error('ng build failed with exit code 1');
        });

        const angularJsonPath = path.join(tempDir, 'angular.json');
        await fs.writeJson(angularJsonPath, {
            version: 1,
            projects: { 'test-app': { projectType: 'application' } }
        });

        await fs.ensureDir(config.buildDir!);
        await fs.writeFile(path.join(config.buildDir!, 'index.html'), '<html>Test</html>');

        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(config, { build: true });
            await builder.build();

            expect(mockExit).toHaveBeenCalledWith(1);
        } catch {
            expect(mockExit).toHaveBeenCalledWith(1);
        } finally {
            mockExit.mockRestore();
        }
    });

    test('should handle missing optional config fields gracefully', async () => {
        const minimalConfig: NipkgConfig = {
            name: 'minimal-app',
            description: 'Minimal test',
            maintainer: 'Test <test@example.com>',
            buildDir: path.join(tempDir, 'dist', 'minimal-app', 'browser')
        };

        const angularJsonPath = path.join(tempDir, 'angular.json');
        await fs.writeJson(angularJsonPath, {
            version: 1,
            projects: { 'minimal-app': { projectType: 'application' } }
        });

        await fs.ensureDir(minimalConfig.buildDir!);
        await fs.writeFile(path.join(minimalConfig.buildDir!, 'index.html'), '<html>Test</html>');

        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(minimalConfig, { build: false });
            await builder.build();

            // Should use default values for optional fields
            const packageFile = 'minimal-app_1.0.0_all.nipkg';
            const packagePath = path.join(tempDir, 'dist', 'nipkg', packageFile);
            expect(await fs.pathExists(packagePath)).toBe(true);
        } finally {
            process.chdir(originalCwd);
        }
    });

    test('should handle empty build directory', async () => {
        const angularJsonPath = path.join(tempDir, 'angular.json');
        await fs.writeJson(angularJsonPath, {
            version: 1,
            projects: { 'test-app': { projectType: 'application' } }
        });

        // Create empty build directory
        await fs.ensureDir(config.buildDir!);

        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(config, { build: false });
            await builder.build();

            // Should successfully create package even with empty directory
            const nipkgDir = path.join(tempDir, 'dist', 'nipkg');
            const packageFile = `${config.name}_${config.version}_all.nipkg`;
            expect(await fs.pathExists(path.join(nipkgDir, packageFile))).toBe(true);
        } finally {
            process.chdir(originalCwd);
        }
    });

    test('should clean up existing packages by default', async () => {
        const angularJsonPath = path.join(tempDir, 'angular.json');
        await fs.writeJson(angularJsonPath, {
            version: 1,
            projects: { 'test-app': { projectType: 'application' } }
        });

        await fs.ensureDir(config.buildDir!);
        await fs.writeFile(path.join(config.buildDir!, 'index.html'), '<html>Test</html>');

        const nipkgDir = path.join(tempDir, 'dist', 'nipkg');
        await fs.ensureDir(nipkgDir);

        // Create an old package file
        const oldPackage = path.join(nipkgDir, 'old-package_1.0.0_all.nipkg');
        await fs.writeFile(oldPackage, 'old package data');

        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(config, { build: false, skipCleanup: false });
            await builder.build();

            // Old package should be removed
            expect(await fs.pathExists(oldPackage)).toBe(false);

            // New package should exist
            const newPackage = path.join(nipkgDir, `${config.name}_${config.version}_all.nipkg`);
            expect(await fs.pathExists(newPackage)).toBe(true);
        } finally {
            process.chdir(originalCwd);
        }
    });

    test('should preserve existing packages when skipCleanup is true', async () => {
        const angularJsonPath = path.join(tempDir, 'angular.json');
        await fs.writeJson(angularJsonPath, {
            version: 1,
            projects: { 'test-app': { projectType: 'application' } }
        });

        await fs.ensureDir(config.buildDir!);
        await fs.writeFile(path.join(config.buildDir!, 'index.html'), '<html>Test</html>');

        const nipkgDir = path.join(tempDir, 'dist', 'nipkg');
        await fs.ensureDir(nipkgDir);

        // Create an old package file
        const oldPackage = path.join(nipkgDir, 'old-package_1.0.0_all.nipkg');
        await fs.writeFile(oldPackage, 'old package data');

        process.chdir(tempDir);

        try {
            const builder = new AngularNipkgBuilder(config, { build: false, skipCleanup: true });
            await builder.build();

            // Old package should still exist
            expect(await fs.pathExists(oldPackage)).toBe(true);

            // New package should also exist
            const newPackage = path.join(nipkgDir, `${config.name}_${config.version}_all.nipkg`);
            expect(await fs.pathExists(newPackage)).toBe(true);
        } finally {
            process.chdir(originalCwd);
        }
    });
});

describe('CLI Configuration Generation', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(__dirname, 'cli-temp-'));
    });

    afterEach(async () => {
        await fs.remove(tempDir);
    });

    test('should generate config from package.json', async () => {
        const packageJson = {
            name: 'my-angular-app',
            version: '2.0.0',
            description: 'My Angular Application',
            author: 'John Doe <john@example.com>'
        };

        const packageJsonPath = path.join(tempDir, 'package.json');
        await fs.writeJson(packageJsonPath, packageJson);

        const originalCwd = process.cwd();
        process.chdir(tempDir);

        try {
            // Simulate generateConfigFromPackageJson function
            const projectPackageJson = await fs.readJson(packageJsonPath) as typeof packageJson;
            const projectName = projectPackageJson.name || path.basename(process.cwd());

            const generatedConfig: NipkgConfig = {
                name: projectName,
                version: projectPackageJson.version || '1.0.0',
                description: projectPackageJson.description || `${projectName} Angular application`,
                maintainer: projectPackageJson.author || 'user_name <user@example.com>',
                architecture: 'all',
                displayName: projectName,
                buildDir: `dist/${projectName}/browser`,
                userVisible: true
            };

            expect(generatedConfig.name).toBe('my-angular-app');
            expect(generatedConfig.version).toBe('2.0.0');
            expect(generatedConfig.description).toBe('My Angular Application');
            expect(generatedConfig.maintainer).toBe('John Doe <john@example.com>');
            expect(generatedConfig.buildDir).toBe('dist/my-angular-app/browser');
        } finally {
            process.chdir(originalCwd);
        }
    });

    test('should generate config with defaults when package.json is minimal', async () => {
        const packageJson = {
            name: 'minimal-app'
        };

        const packageJsonPath = path.join(tempDir, 'package.json');
        await fs.writeJson(packageJsonPath, packageJson);

        const originalCwd = process.cwd();
        process.chdir(tempDir);

        try {
            const projectPackageJson = await fs.readJson(packageJsonPath) as { name: string, version?: string, description?: string, author?: string };
            const projectName = projectPackageJson.name || path.basename(process.cwd());

            const generatedConfig: NipkgConfig = {
                name: projectName,
                version: projectPackageJson.version || '1.0.0',
                description: projectPackageJson.description || `${projectName} Angular application`,
                maintainer: projectPackageJson.author || 'user_name <user@example.com>',
                architecture: 'all',
                displayName: projectName,
                buildDir: `dist/${projectName}/browser`,
                userVisible: true
            };

            expect(generatedConfig.name).toBe('minimal-app');
            expect(generatedConfig.version).toBe('1.0.0');
            expect(generatedConfig.description).toBe('minimal-app Angular application');
            expect(generatedConfig.maintainer).toBe('user_name <user@example.com>');
        } finally {
            process.chdir(originalCwd);
        }
    });

    test('should generate config from directory name when no package.json exists', () => {
        const originalCwd = process.cwd();
        process.chdir(tempDir);

        try {
            const projectName = path.basename(process.cwd());

            const generatedConfig: NipkgConfig = {
                name: projectName,
                version: '1.0.0',
                description: `${projectName} Angular application`,
                maintainer: 'user_name <user@example.com>',
                architecture: 'all',
                displayName: projectName,
                buildDir: `dist/${projectName}/browser`,
                userVisible: true
            };

            expect(generatedConfig.name).toBeTruthy();
            expect(generatedConfig.version).toBe('1.0.0');
            expect(generatedConfig.architecture).toBe('all');
        } finally {
            process.chdir(originalCwd);
        }
    });

    test('should create nipkg.config.json file in init command', async () => {
        const packageJson = {
            name: 'init-test-app',
            version: '1.5.0',
            description: 'Init test',
            author: 'Test Author <test@example.com>'
        };

        const packageJsonPath = path.join(tempDir, 'package.json');
        await fs.writeJson(packageJsonPath, packageJson);

        const originalCwd = process.cwd();
        process.chdir(tempDir);

        try {
            const configPath = path.join(tempDir, 'nipkg.config.json');

            // Simulate init command
            const projectPackageJson = await fs.readJson(packageJsonPath) as typeof packageJson;
            const projectName = projectPackageJson.name || path.basename(process.cwd());

            const config: NipkgConfig = {
                name: projectName,
                version: projectPackageJson.version || '1.0.0',
                description: projectPackageJson.description || `${projectName} Angular application`,
                maintainer: projectPackageJson.author || 'user_name <user@example.com>',
                architecture: 'all',
                displayName: projectName,
                buildDir: `dist/${projectName}/browser`,
                userVisible: true
            };

            await fs.writeJson(configPath, config, { spaces: 2 });

            expect(await fs.pathExists(configPath)).toBe(true);

            const savedConfig = await fs.readJson(configPath) as NipkgConfig;
            expect(savedConfig.name).toBe('init-test-app');
            expect(savedConfig.version).toBe('1.5.0');
        } finally {
            process.chdir(originalCwd);
        }
    });

    test('should not overwrite existing nipkg.config.json in init command', async () => {
        const originalCwd = process.cwd();
        process.chdir(tempDir);

        try {
            const configPath = path.join(tempDir, 'nipkg.config.json');
            const existingConfig = {
                name: 'existing-app',
                version: '5.0.0',
                description: 'Existing config',
                maintainer: 'Original <original@example.com>'
            };

            await fs.writeJson(configPath, existingConfig, { spaces: 2 });

            // Check if config already exists (init command behavior)
            const configExists = await fs.pathExists(configPath);
            expect(configExists).toBe(true);

            // Should not overwrite - read existing config
            const savedConfig = await fs.readJson(configPath) as typeof existingConfig;
            expect(savedConfig.name).toBe('existing-app');
            expect(savedConfig.version).toBe('5.0.0');
        } finally {
            process.chdir(originalCwd);
        }
    });
});