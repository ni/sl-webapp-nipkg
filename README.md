# SL WebApp NIPKG

[![npm version](https://badge.fury.io/js/sl-webapp-nipkg.svg)](https://badge.fury.io/js/sl-webapp-nipkg)
[![Tests](https://github.com/ni/sl-webapp-nipkg/workflows/Tests/badge.svg)](https://github.com/ni/sl-webapp-nipkg/actions)
[![Coverage Status](https://coveralls.io/repos/github/ni/sl-webapp-nipkg/badge.svg?branch=main)](https://coveralls.io/github/ni/sl-webapp-nipkg?branch=main)

A Node.js tool for packaging Node.js applications into SystemLink WebApp `.nipkg` format for National Instruments Package Manager.

## Features

- 🚀 **Easy Integration**: Works seamlessly with any Node.js project
- 📦 **Automated Packaging**: Builds and packages your app in one command  
- ⚙️ **Configurable**: Flexible configuration through JSON files
- 🎯 **TypeScript Support**: Written in TypeScript with full type definitions
- 🌈 **Beautiful CLI**: Colorful, informative command-line interface
- ✅ **Well Tested**: Comprehensive test suite with 17 passing tests
- 🔧 **CI/CD Ready**: Easy integration with build pipelines
- 🌍 **Cross-Platform**: Works on Windows, macOS, and Linux without external dependencies
- 🔌 **Framework Agnostic**: Works with React, Angular, Vue, or any Node.js application

## Prerequisites

- Node.js 16 or higher

## Installation

### Global Installation (Recommended)

```bash
npm install -g @ni/sl-webapp-nipkg
```

### Project-specific Installation

```bash
# As a dev dependency in your project
npm install --save-dev @ni/sl-webapp-nipkg
```

## Quick Start

1. **Navigate to your Node.js project**:

   ```bash
   cd my-webapp-project
   ```

2. **Initialize configuration**:

   ```bash
   sl-nipkg init
   ```

3. **Edit the generated `nipkg.config.json`**:

   ```json
   {
     "maintainer": "John Doe <john.doe@company.com>",
     "displayName": "My WebApp",
     "buildDir": "dist",
     "buildCommand": "npm run build",
     "userVisible": true
   }
   ```

   **Note:** The `name`, `version`, and `description` are auto-detected from your `package.json` if not specified. The `buildDir` should point to your application's build output directory (e.g., `dist`, `build`, `out`).

4. **Build and package**:

   ```bash
   sl-nipkg build --build
   ```

## CLI Commands

### `sl-nipkg build`

Build and package your Node.js application.

#### Options

- `-b, --build` - Run your build command before packaging
- `-c, --configuration <config>` - Build configuration (e.g., 'production')
- `-v, --verbose` - Enable verbose output
- `--skip-cleanup` - Skip cleanup of existing packages
- `--config <path>` - Custom config file path (default: 'nipkg.config.json')

#### Examples

```bash
# Build with production configuration
sl-nipkg build --build --configuration production

# Use existing build output
sl-nipkg build

# Verbose output with custom config  
sl-nipkg build --build --verbose --config my-nipkg.config.json
```

### `sl-nipkg init`

Initialize a `nipkg.config.json` file in the current directory.

## Configuration

### Configuration File (`nipkg.config.json`)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ❌ | Package name (auto-detected from package.json if not provided) |
| `version` | string | ❌ | Package version (auto-detected from package.json, defaults to 1.0.0) |
| `description` | string | ❌ | Package description (auto-detected from package.json, defaults to empty) |
| `maintainer` | string | ✅ | Maintainer information |
| `architecture` | string | ❌ | Target architecture (default: 'all') |
| `displayName` | string | ❌ | Display name for the package |
| `buildDir` | string | ✅ | Build output directory (e.g., 'dist', 'build') |
| `buildCommand` | string | ❌ | Custom build command (default: 'npm run build') |
| `outputDir` | string | ❌ | Custom nipkg output directory |
| `depends` | string[] | ❌ | Package dependencies |
| `userVisible` | boolean | ❌ | Whether package is user visible |

### Example Configuration

```json
{
  "name": "my-webapp",
  "version": "1.2.3",
  "description": "A SystemLink WebApp for National Instruments", 
  "maintainer": "John Doe <john.doe@company.com>",
  "architecture": "all",
  "displayName": "My WebApp",
  "buildDir": "dist",
  "buildCommand": "npm run build",
  "userVisible": true,
  "depends": [
    "ni-systemlink-server >= 2023.1"
  ],
  "outputDir": "packages"
}
```

## Framework Examples

### React

```json
{
  "maintainer": "Your Name <your.email@company.com>",
  "buildDir": "build",
  "buildCommand": "npm run build"
}
```

### Vue

```json
{
  "maintainer": "Your Name <your.email@company.com>",
  "buildDir": "dist",
  "buildCommand": "npm run build"
}
```

### Angular

```json
{
  "maintainer": "Your Name <your.email@company.com>",
  "buildDir": "dist/my-app/browser",
  "buildCommand": "ng build --configuration production"
}
```

### Next.js

```json
{
  "maintainer": "Your Name <your.email@company.com>",
  "buildDir": "out",
  "buildCommand": "npm run build && npm run export"
}
```

## Integration with Node.js Projects

### Add to package.json Scripts

```json
{
  "scripts": {
    "start": "npm run dev",
    "dev": "vite",
    "build": "vite build",
    "build:nipkg": "sl-nipkg build --build",
    "package:nipkg": "sl-nipkg build"
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
import { SystemLinkNipkgBuilder, NipkgConfig, BuildOptions } from '@ni/sl-webapp-nipkg';

const config: NipkgConfig = {
  name: 'my-app',
  version: '1.0.0',
  description: 'My SystemLink WebApp',
  maintainer: 'John Doe <john@example.com>',
  buildDir: 'dist',
  userVisible: true
};

const options: BuildOptions = {
  build: true,
  verbose: true
};

const builder = new SystemLinkNipkgBuilder(config, options);
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
your-webapp-project/
├── dist/                            # Your build output
│   ├── index.html
│   ├── assets/
│   └── ...
├── dist/nipkg/                      # NIPKG packaging
│   ├── your-app_1.0.0.nipkg        # Final package
│   └── temp-source/                # Temporary (auto-cleaned)
├── nipkg.config.json                # Package configuration  
└── package.json                     # NPM scripts
```

## Requirements

- Node.js 16+
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

# Use in any Node.js project
cd /path/to/your/project
sl-nipkg --help
```

## Troubleshooting

### Common Issues

#### "Build directory not found"

- Run with `--build` flag to build before packaging
- Check that your build command runs successfully: `npm run build`
- Verify `buildDir` in nipkg.config.json points to the correct directory

#### "This is not a Node.js project"

- Ensure you're running the command in a Node.js project directory
- Check that `package.json` exists in the current directory

#### Package dependencies missing

- Add required NI runtime dependencies to `depends` array in config
- Example: `"depends": ["ni-systemlink-server >= 2023.1"]`

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
