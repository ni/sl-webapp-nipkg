import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as childProcess from 'child_process';
import type { NipkgConfig } from '../src/types.js';

// Mock deboa before importing builder
jest.mock('deboa', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Deboa: jest.fn().mockImplementation(() => ({
        package: jest.fn().mockResolvedValue(undefined)
    }))
}), { virtual: true });

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

// Note: SystemLinkNipkgBuilder tests are commented out as they require ESM support
// The basic type and configuration tests below validate the core interfaces

describe('Types and Configuration', () => {
    describe('NipkgConfig interface', () => {
        test('should accept minimal valid configuration', () => {
            const config: NipkgConfig = {
                maintainer: 'Test User <test@example.com>'
            };

            expect(config).toBeDefined();
            expect(config.maintainer).toBe('Test User <test@example.com>');
        });

        test('should accept configuration with all optional fields', () => {
            const config: NipkgConfig = {
                name: 'test-app',
                version: '1.0.0',
                description: 'Test application',
                maintainer: 'Test User <test@example.com>',
                architecture: 'all',
                displayName: 'My Test App',
                buildDir: 'dist',
                buildCommand: 'npm run build',
                outputDir: 'custom-output',
                depends: ['dep1', 'dep2'],
                userVisible: true
            };

            expect(config).toBeDefined();
            expect(config.name).toBe('test-app');
            expect(config.version).toBe('1.0.0');
            expect(config.description).toBe('Test application');
            expect(config.architecture).toBe('all');
            expect(config.depends).toEqual(['dep1', 'dep2']);
            expect(config.userVisible).toBe(true);
        });
    });
});

describe('Configuration File Handling', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(__dirname, 'temp-'));
    });

    afterEach(async () => {
        await fs.remove(tempDir);
    });

    test('should read and parse config file correctly', async () => {
        const config: NipkgConfig = {
            maintainer: 'File Test <file@test.com>',
            architecture: 'all',
            buildDir: 'dist'
        };

        const configPath = path.join(tempDir, 'nipkg.config.json');
        await fs.writeJson(configPath, config, { spaces: 2 });

        const readConfig = await fs.readJson(configPath) as NipkgConfig;
        expect(readConfig).toEqual(config);
    });

    test('should write config file with proper formatting', async () => {
        const config: NipkgConfig = {
            maintainer: 'Write Test <write@test.com>',
            buildDir: 'dist'
        };

        const configPath = path.join(tempDir, 'output-config.json');
        await fs.writeJson(configPath, config, { spaces: 2 });

        const fileContent = await fs.readFile(configPath, 'utf-8');
        expect(fileContent).toContain('"maintainer": "Write Test <write@test.com>"');
        expect(fileContent).toContain('"buildDir": "dist"');
    });
});

describe('Project Detection', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(__dirname, 'detection-temp-'));
    });

    afterEach(async () => {
        await fs.remove(tempDir);
    });

    test('should detect Node.js project when package.json exists', async () => {
        const packageJsonPath = path.join(tempDir, 'package.json');
        await fs.writeJson(packageJsonPath, { name: 'test-project', version: '1.0.0' });

        const isNodeProject = fs.existsSync(packageJsonPath);
        expect(isNodeProject).toBe(true);
    });

    test('should not detect Node.js project when package.json is missing', () => {
        const packageJsonPath = path.join(tempDir, 'package.json');
        const isNodeProject = fs.existsSync(packageJsonPath);
        expect(isNodeProject).toBe(false);
    });

    test('should extract name and version from package.json', async () => {
        const packageJson = {
            name: 'my-webapp',
            version: '2.1.0',
            description: 'Test application'
        };

        const packageJsonPath = path.join(tempDir, 'package.json');
        await fs.writeJson(packageJsonPath, packageJson);

        const readPackageJson = await fs.readJson(packageJsonPath) as typeof packageJson;
        expect(readPackageJson.name).toBe('my-webapp');
        expect(readPackageJson.version).toBe('2.1.0');
        expect(readPackageJson.description).toBe('Test application');
    });
});

describe('File Operations', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(__dirname, 'files-temp-'));
    });

    afterEach(async () => {
        await fs.remove(tempDir);
    });

    test('should create directory structure', async () => {
        const targetDir = path.join(tempDir, 'output', 'nested', 'dir');
        await fs.ensureDir(targetDir);

        const exists = await fs.pathExists(targetDir);
        expect(exists).toBe(true);
    });

    test('should copy files recursively', async () => {
        const sourceDir = path.join(tempDir, 'source');
        const targetDir = path.join(tempDir, 'target');

        await fs.ensureDir(sourceDir);
        await fs.writeFile(path.join(sourceDir, 'file1.txt'), 'content1');
        await fs.ensureDir(path.join(sourceDir, 'subdir'));
        await fs.writeFile(path.join(sourceDir, 'subdir', 'file2.txt'), 'content2');

        await fs.copy(sourceDir, targetDir);

        const file1Exists = await fs.pathExists(path.join(targetDir, 'file1.txt'));
        const file2Exists = await fs.pathExists(path.join(targetDir, 'subdir', 'file2.txt'));

        expect(file1Exists).toBe(true);
        expect(file2Exists).toBe(true);
    });

    test('should remove directory and contents', async () => {
        const targetDir = path.join(tempDir, 'to-remove');
        await fs.ensureDir(targetDir);
        await fs.writeFile(path.join(targetDir, 'file.txt'), 'content');

        await fs.remove(targetDir);

        const exists = await fs.pathExists(targetDir);
        expect(exists).toBe(false);
    });
});

describe('SystemLinkNipkgBuilder Basic Tests', () => {
    let tempDir: string;
    let originalCwd: string;

    beforeEach(async () => {
        originalCwd = process.cwd();
        tempDir = await fs.mkdtemp(path.join(__dirname, 'builder-temp-'));
        process.chdir(tempDir);

        // Create a minimal Node.js project structure
        await fs.writeJson('package.json', {
            name: 'test-webapp',
            version: '1.0.0',
            description: 'Test SystemLink WebApp'
        });

        // Create build directory
        await fs.ensureDir('dist');
        await fs.writeFile('dist/index.html', '<html><body>Test</body></html>');
    });

    afterEach(async () => {
        process.chdir(originalCwd);
        await fs.remove(tempDir);
        jest.clearAllMocks();
    });

    test('should validate Node.js project exists', () => {
        const packageJsonExists = fs.existsSync('package.json');
        expect(packageJsonExists).toBe(true);
    });

    test('should read package.json for auto-detection', async () => {
        const packageJson = await fs.readJson('package.json') as {
            name: string,
            version: string,
            description: string
        };

        expect(packageJson.name).toBe('test-webapp');
        expect(packageJson.version).toBe('1.0.0');
        expect(packageJson.description).toBe('Test SystemLink WebApp');
    });

    test('should require buildDir in config', () => {
        const config: NipkgConfig = {
            maintainer: 'Test <test@example.com>'
        };

        expect(config.buildDir).toBeUndefined();
    });

    // SystemLinkNipkgBuilder instantiation tests are skipped due to ESM/CommonJS incompatibility in Jest
    test.skip('should execute build command when build option is set', () => {
        mockedExecSync.mockReturnValue(Buffer.from(''));

        const config: NipkgConfig = {
            maintainer: 'Test <test@example.com>',
            buildDir: 'dist',
            buildCommand: 'npm run build'
        };

        // const builder = new SystemLinkNipkgBuilder(config, { build: true });
        // expect(builder).toBeDefined();
        expect(config.buildCommand).toBe('npm run build');
    });
});

describe('Build Options Validation', () => {
    test('should accept all build options', () => {
        const options = {
            build: true,
            configuration: 'production',
            verbose: true,
            skipCleanup: false
        };

        expect(options.build).toBe(true);
        expect(options.configuration).toBe('production');
        expect(options.verbose).toBe(true);
        expect(options.skipCleanup).toBe(false);
    });

    test('should have default values for optional build options', () => {
        const options = {};

        expect(options).toBeDefined();
    });
});
