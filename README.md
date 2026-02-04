# SL WebApp NIPKG

[![npm version](https://badge.fury.io/js/sl-webapp-nipkg.svg)](https://badge.fury.io/js/sl-webapp-nipkg)
[![Tests](https://github.com/ni/sl-webapp-nipkg/workflows/Tests/badge.svg)](https://github.com/ni/sl-webapp-nipkg/actions)
[![Coverage Status](https://coveralls.io/repos/github/ni/sl-webapp-nipkg/badge.svg?branch=main)](https://coveralls.io/github/ni/sl-webapp-nipkg?branch=main)

A Node.js tool for packaging Angular applications into `.nipkg` format for National Instruments Package Manager.

## Features

- 🚀 **Easy Integration**: Works seamlessly with Angular CLI projects
- 📦 **Automated Packaging**: Builds and packages your Angular app in one command  
- ⚙️ **Configurable**: Flexible configuration through JSON files
- 🎯 **TypeScript Support**: Written in TypeScript with full type definitions
- 🌈 **Beautiful CLI**: Colorful, informative command-line interface
- ✅ **Well Tested**: Comprehensive test suite with 17 passing tests
- 🔧 **CI/CD Ready**: Easy integration with build pipelines
- 🆓 **No External Dependencies**: Creates .nipkg packages without requiring NI Package Manager

## Installation

### Global Installation (Recommended)

```bash
npm install -g sl-webapp-nipkg
```

### Project-specific Installation

```bash
# As a dev dependency in your Angular project
npm install --save-dev sl-webapp-nipkg
```

## Quick Start

1. **Navigate to your Angular project**:

   ```bash
   cd my-angular-project
   ```

2. **Initialize configuration**:

   ```bash
   ng-nipkg init
   ```

3. **Edit the generated `nipkg.config.json`**:

   ```json
   {
     "name": "my-angular-app",
     "version": "1.0.0", 
     "description": "My Angular application",
     "maintainer": "John Doe <john.doe@company.com>",
     "displayName": "My Angular App",
     "buildDir": "dist/my-app/browser",
     "userVisible": true
   }
   ```

   **Note:** The `buildDir` should match the `outputPath` from your `angular.json` (plus `/browser` for Angular 19+).

4. **Build and package**:

   ```bash
   ng-nipkg build --build --configuration production
   ```

## CLI Commands

### `ng-nipkg build`

Build and package your Angular application.

#### Options

- `-b, --build` - Run `ng build` before packaging
- `-c, --configuration <config>` - Angular build configuration (e.g., 'production')
- `-v, --verbose` - Enable verbose output
- `--skip-cleanup` - Skip cleanup of existing packages
- `--config <path>` - Custom config file path (default: 'nipkg.config.json')

#### Examples

```bash
# Build with production configuration
ng-nipkg build --build --configuration production

# Use existing build output
ng-nipkg build

# Verbose output with custom config  
ng-nipkg build --build --verbose --config my-nipkg.config.json
```

### `ng-nipkg init`

Initialize a `nipkg.config.json` file in the current directory.

## Configuration

### Configuration File (`nipkg.config.json`)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✅ | Package name |
| `version` | string | ✅ | Package version (semver format) |
| `description` | string | ✅ | Package description |
| `maintainer` | string | ✅ | Maintainer information |
| `architecture` | string | ❌ | Target architecture (default: 'all') |
| `displayName` | string | ❌ | Display name for the package |
| `projectName` | string | ❌ | Angular project name (auto-detected) |
| `buildDir` | string | ❌ | Custom build output directory |
| `outputDir` | string | ❌ | Custom nipkg output directory |
| `depends` | string[] | ❌ | Package dependencies |
| `userVisible` | boolean | ❌ | Whether package is user visible |

### Example Configuration

```json
{
  "name": "my-angular-app",
  "version": "1.2.3",
  "description": "A powerful Angular application for National Instruments", 
  "maintainer": "John Doe <john.doe@company.com>",
  "architecture": "all",
  "displayName": "My Angular Application",
  "projectName": "my-angular-app",
  "userVisible": true,
  "depends": [
    "ni-labview-runtime-2023-q1",
    "ni-visa-runtime >= 23.0"
  ],
  "buildDir": "dist/my-angular-app/browser",
  "outputDir": "packages"
}
```

## Integration with Angular Projects

### Add to package.json Scripts

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve", 
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "build:nipkg": "ng-nipkg build --build --configuration production",
    "package:nipkg": "ng-nipkg build"
  }
}
```

### Use in npm Scripts

```bash
# Build and package for production
npm run build:nipkg

# Package existing build
npm run package:nipkg
```

## Programmatic Usage

```typescript
import { AngularNipkgBuilder, NipkgConfig, BuildOptions } from 'sl-webapp-nipkg';

const config: NipkgConfig = {
  name: 'my-app',
  version: '1.0.0',
  description: 'My Angular application',
  maintainer: 'John Doe <john@example.com>',
  userVisible: true
};

const options: BuildOptions = {
  build: true,
  configuration: 'production',
  verbose: true
};

const builder = new AngularNipkgBuilder(config, options);
await builder.build();
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Build and Package

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build and Package
      run: npm run build:nipkg
    
    - name: Upload Package
      uses: actions/upload-artifact@v3
      with:
        name: nipkg-package
        path: dist/nipkg/*.nipkg
```

### Azure DevOps

```yaml
trigger:
- main

pool:
  vmImage: 'windows-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'

- script: npm ci
  displayName: 'Install dependencies'

- script: npm run build:nipkg  
  displayName: 'Build and package'

- task: PublishBuildArtifacts@1
  inputs:
    PathtoPublish: 'dist/nipkg'
    ArtifactName: 'nipkg-package'
```

## Package Structure

After packaging, your project will have this structure:

```
your-angular-project/
├── dist/
│   ├── your-app/                    # Angular build output
│   │   └── browser/
│   └── nipkg/                       # NIPKG packaging
│       ├── your-app_1.0.0_windows_x64.nipkg  # Final package
│       └── file-package/
│           ├── debian-binary
│           ├── control/
│           │   └── control          # Package metadata
│           └── data/
│               └── ApplicationFiles_64/  # Your Angular app files
│                   ├── index.html
│                   ├── main.js
│                   └── assets/
├── nipkg.config.json                # Package configuration  
└── package.json                     # NPM scripts
```

## Requirements

- Node.js 16+
- Angular CLI
- National Instruments Package Manager (nipkg)

## Development

### Building from Source

```bash
git clone https://github.com/ni/sl-webapp-nipkg.git
cd sl-webapp-nipkg
npm install
npm run build
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Local Development

```bash
# Link globally for testing
npm link

# Use in any Angular project
cd /path/to/angular/project
ng-nipkg --help
```

## Troubleshooting

### Common Issues

#### "Angular build directory not found"

- Run with `--build` flag to build before packaging
- Check that your Angular project builds successfully with `ng build`

#### "This is not an Angular workspace"

- Ensure you're running the command in an Angular project directory
- Check that `angular.json` exists in the current directory

#### Package dependencies missing

- Add required NI runtime dependencies to `depends` array in config
- Example: `"depends": ["ni-labview-runtime-2023-q1"]`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for your changes
5. Ensure tests pass: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Submit a pull request

## License

MIT © National Instruments

## Support

- 📚 [Documentation](https://github.com/ni/sl-webapp-nipkg/wiki)
- 🐛 [Report Issues](https://github.com/ni/sl-webapp-nipkg/issues)
- 💬 [Discussions](https://github.com/ni/sl-webapp-nipkg/discussions)

---

*Made with ❤️ for the National Instruments community*
