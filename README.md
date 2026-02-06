# SL WebApp NIPKG

[![npm version](https://badge.fury.io/js/sl-webapp-nipkg.svg)](https://badge.fury.io/js/sl-webapp-nipkg)
[![Tests](https://github.com/ni/sl-webapp-nipkg/workflows/Tests/badge.svg)](https://github.com/ni/sl-webapp-nipkg/actions)
[![Coverage Status](https://coveralls.io/repos/github/ni/sl-webapp-nipkg/badge.svg?branch=main)](https://coveralls.io/github/ni/sl-webapp-nipkg?branch=main)

A flexible tool for packaging web applications into SystemLink WebApp `.nipkg` format for National Instruments Package Manager. Works with any web application framework including Node.js (React, Angular, Vue), Python (Pyodide), .NET (Blazor), and static HTML sites.

## Features

- 🚀 **Easy Integration**: Works seamlessly with any web application
- 📦 **Automated Packaging**: Builds and packages your app in one command  
- ⚙️ **Flexible Configuration**: Optional config files - use CLI flags or JSON config
- 🎯 **TypeScript Support**: Written in TypeScript with full type definitions
- 🌈 **Beautiful CLI**: Colorful, informative command-line interface
- ✅ **Well Tested**: Comprehensive test suite with 17 passing tests
- 🔧 **CI/CD Ready**: Easy integration with build pipelines
- 🌍 **Cross-Platform**: Works on Windows, macOS, and Linux without external dependencies
- 🔌 **Framework Agnostic**: Works with React, Angular, Vue, Blazor, Pyodide, static HTML, and more
- 🎨 **Zero Config**: No config files required - just point to your build directory

## Prerequisites

- Node.js 16 or higher (only to run the packaging tool)

## Installation

### Global Installation (Recommended)

```bash
npm install -g @ni-kismet/sl-webapp-nipkg
```

### Project-specific Installation

```bash
# As a dev dependency in your project
npm install --save-dev @ni-kismet/sl-webapp-nipkg
```

## Quick Start

### Option 1: Minimal Usage (No Config Files)

```bash
# Package any web application - just point to the build directory
sl-webapp-nipkg build --build-dir ./dist --name my-app

# With full metadata
sl-webapp-nipkg build \
  --build-dir ./dist \
  --name "My WebApp" \
  --version "1.0.0" \
  --maintainer "Your Name <name@example.com>"
```

### Option 2: With Configuration File (Recommended for Node.js projects)

1. **Navigate to your project**:

   ```bash
   cd my-webapp-project
   ```

2. **Initialize configuration** (optional):

   ```bash
   sl-webapp-nipkg init
   ```

3. **Edit the generated `nipkg.config.json`** (all fields optional):

   ```json
   {
     "maintainer": "John Doe <john.doe@company.com>",
     "displayName": "My WebApp",
     "buildDir": "dist",
     "buildCommand": "npm run build",
     "userVisible": true
   }
   ```

   **Note:** The `name`, `version`, and `description` are auto-detected from your `package.json` if present.

4. **Build and package**:

   ```bash
   sl-webapp-nipkg build --build
   ```

## CLI Commands

### `sl-webapp-nipkg build`

Build and package your web application.

#### Options

**Core Options:**

- `--build-dir <path>` - Build output directory to package (required if not in config)
- `--name <name>` - Package name (auto-detected from package.json or directory name)
- `--version <version>` - Package version (auto-detected from package.json or defaults to 1.0.0)
- `--description <description>` - Package description (optional)
- `--maintainer <maintainer>` - Maintainer info (defaults to 'Unknown')
- `--output-dir <path>` - Output directory for nipkg files (default: dist/nipkg)

**Build Options:**

- `-b, --build` - Run your build command before packaging
- `-c, --configuration <config>` - Build configuration (e.g., 'production')
- `-v, --verbose` - Enable verbose output
- `--skip-cleanup` - Skip cleanup of existing packages
- `--build-suffix <suffix>` - Add a suffix to the package name (e.g., build ID for CI/CD)
- `--config <path>` - Custom config file path (default: 'nipkg.config.json')

**Note:** CLI options override config file values, which override package.json values.

#### Examples

**Node.js Projects:**

```bash
# Build with production configuration
sl-webapp-nipkg build --build --configuration production

# Use existing build output (with config file)
sl-webapp-nipkg build

# Build with build ID suffix for CI/CD
sl-webapp-nipkg build --build --build-suffix "${BUILD_ID}"

# Verbose output with custom config  
sl-webapp-nipkg build --build --verbose --config my-nipkg.config.json
```

**Non-Node.js Projects (Python, Blazor, Static Sites):**

```bash
# Python Pyodide webapp
sl-webapp-nipkg build --build-dir ./public --name my-pyodide-app

# .NET Blazor webapp
sl-webapp-nipkg build \
  --build-dir ./bin/Release/net8.0/publish \
  --name "My Blazor App" \
  --version "2.0.0"

# Static HTML site
sl-webapp-nipkg build --build-dir ./dist --name my-static-site --version 1.0.0

# With full metadata
sl-webapp-nipkg build \
  --build-dir ./output \
  --name "My WebApp" \
  --version "1.5.0" \
  --description "My awesome webapp" \
  --maintainer "Team <team@company.com>"
```

### `sl-webapp-nipkg init`

Initialize a `nipkg.config.json` file in the current directory.

## Configuration

### Configuration File (`nipkg.config.json`)

**All fields are optional.** CLI options override config file values. Config file values override package.json auto-detection.

| Property | Type | Required | Description |
| -------- | ---- | -------- | ----------- |
| `name` | string | ❌ | Package name (auto-detected from package.json or directory name) |
| `version` | string | ❌ | Package version (auto-detected from package.json, defaults to 1.0.0) |
| `description` | string | ❌ | Package description (auto-detected from package.json, defaults to empty) |
| `maintainer` | string | ❌ | Maintainer information (defaults to 'Unknown') |
| `architecture` | string | ❌ | Target architecture (default: 'all') |
| `displayName` | string | ❌ | Display name for the package |
| `buildDir` | string | ❌* | Build output directory (e.g., 'dist', 'build') - *Required if not provided via CLI |
| `buildCommand` | string | ❌ | Custom build command (default: 'npm run build') |
| `outputDir` | string | ❌ | Custom nipkg output directory (default: 'dist/nipkg') |
| `buildSuffix` | string | ❌ | Optional suffix for package filename (e.g., build ID for CI/CD) |
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

### Non-Node.js Projects

**Python Pyodide:**

```bash
# No config file needed
sl-webapp-nipkg build \
  --build-dir ./public \
  --name my-pyodide-app \
  --version 1.0.0 \
  --maintainer "Python Team <team@example.com>"
```

**.NET Blazor:**

```bash
# Package Blazor WebAssembly output
sl-webapp-nipkg build \
  --build-dir ./bin/Release/net8.0/publish/wwwroot \
  --name my-blazor-app \
  --version 2.0.0
```

**Static HTML:**

```bash
# Package any static web content
sl-webapp-nipkg build --build-dir ./dist --name my-static-site
```

### Node.js Projects

**React:**

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
    "build:nipkg": "sl-webapp-nipkg build --build",
    "package:nipkg": "sl-webapp-nipkg build"
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
import { SystemLinkNipkgBuilder, NipkgConfig, BuildOptions } from '@ni-kismet/sl-webapp-nipkg';

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

The `--build-suffix` option allows you to create unique package names for PR/branch builds while keeping clean names for production releases.

**Output examples:**

- PR builds: `my-app_1.0.0_12345_all.nipkg` (includes build ID)
- Main/production: `my-app_1.0.0_all.nipkg` (standard naming)

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
    
    - name: Build and Package (PR)
      if: github.event_name == 'pull_request'
      run: sl-webapp-nipkg build --build --build-suffix "${{ github.run_number }}"
    
    - name: Build and Package (Main)
      if: github.event_name == 'push' && github.ref == 'refs/heads/main'
      run: sl-webapp-nipkg build --build
    
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

- script: |
    if [ "$(Build.SourceBranch)" = "refs/heads/main" ]; then
      npm run build
      sl-webapp-nipkg build
    else
      npm run build
      sl-webapp-nipkg build --build-suffix "$(Build.BuildId)"
    fi
  displayName: 'Build and package'

- task: PublishBuildArtifacts@1
  inputs:
    PathtoPublish: 'dist/nipkg'
    ArtifactName: 'nipkg-package'
```

## Package Structure

After packaging, your project will have this structure:

```text
your-webapp-project/
├── dist/                            # Your build output
│   ├── index.html
│   ├── assets/
│   └── ...
├── dist/nipkg/                      # NIPKG packaging
│   ├── your-app_1.0.0_all.nipkg    # Final package
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
sl-webapp-nipkg --help
```

## Troubleshooting

### Common Issues

#### "Build directory not found"

- Provide build directory via CLI: `--build-dir ./dist`
- Or run with `--build` flag to build before packaging
- Check that your build command runs successfully
- Verify `buildDir` in nipkg.config.json points to the correct directory

#### "buildDir is required"

- Provide via CLI: `sl-webapp-nipkg build --build-dir ./dist`
- Or add to nipkg.config.json: `"buildDir": "dist"`

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
