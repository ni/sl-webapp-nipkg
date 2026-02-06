# 🚀 Quick Start Guide: SystemLink WebApp NIPKG Builder

## What You've Built

You now have a **professional packaging tool** that works with **any web application** - Node.js (React, Angular, Vue), Python (Pyodide), .NET (Blazor), static HTML, and more.

## ✅ What's Working

✅ **CLI Tool**: `sl-webapp-nipkg` command available globally  
✅ **Framework Agnostic**: Works with React, Angular, Vue, Blazor, Pyodide, static sites
✅ **Zero Config Mode**: No config files required - just point to your build directory
✅ **Flexible Configuration**: Use CLI flags, JSON config, or package.json auto-detection  
✅ **Error Handling**: Comprehensive error messages  
✅ **TypeScript Support**: Full type definitions included  

## 🎯 How to Use in Real Projects

### Option 1: Minimal Usage (No Config Files)

Perfect for Python, Blazor, or any non-Node.js webapp:

```bash
# Just point to your build output
sl-webapp-nipkg build --build-dir ./dist --name my-app

# With version and maintainer
sl-webapp-nipkg build \
  --build-dir ./public \
  --name my-pyodide-app \
  --version 1.0.0 \
  --maintainer "Your Name <name@example.com>"
```

### Option 2: With Configuration File

Recommended for Node.js projects:

### 1. Install the Tool

```bash
# Navigate to your project
cd my-webapp-project

# Install as dev dependency (for Node.js projects)
npm install --save-dev @ni/sl-webapp-nipkg

# Or install globally (for any project type)
npm install -g @ni/sl-webapp-nipkg
```

### 2. Quick Package (No Config Needed)

```bash
# Minimal - just specify build directory
sl-webapp-nipkg build --build-dir ./dist --name my-app

# With metadata
sl-webapp-nipkg build \
  --build-dir ./dist \
  --name "My WebApp" \
  --version "1.0.0" \
  --maintainer "Your Name <name@example.com>"
```

### 3. Or Initialize Configuration (Optional)

```bash
sl-webapp-nipkg init
```

This creates `nipkg.config.json`:

```json
{
  "maintainer": "Your Name <your.email@company.com>",
  "architecture": "all",
  "displayName": "My App",
  "buildDir": "dist",
  "buildCommand": "npm run build",
  "userVisible": true
}
```

**Note:** **All fields are optional.** The `name`, `version`, and `description` are automatically detected from your `package.json` if present.

### 3. Add NPM Scripts to package.json

```json
{
  "scripts": {
    "build": "vite build",
    "build:nipkg": "sl-webapp-nipkg build --build",
    "package:nipkg": "sl-webapp-nipkg build"
  }
}
```

### 4. Build and Package

```bash
# Option 1: Build app and package in one command (Node.js)
npm run build:nipkg

# Option 2: Use existing build output
npm run build
npm run package:nipkg

# Option 3: Direct command with options
sl-webapp-nipkg build --build --verbose

# Option 4: No config file needed (any project type)
sl-webapp-nipkg build --build-dir ./dist --name my-app
```

## 🔧 Framework-Specific Examples

### Non-Node.js Projects

**Python Pyodide:**

```bash
sl-webapp-nipkg build \
  --build-dir ./public \
  --name my-pyodide-app \
  --version 1.0.0 \
  --maintainer "Python Team <team@example.com>"
```

**.NET Blazor:**

```bash
sl-webapp-nipkg build \
  --build-dir ./bin/Release/net8.0/publish/wwwroot \
  --name my-blazor-app \
  --version 2.0.0
```

**Static HTML:**

```bash
sl-webapp-nipkg build --build-dir ./dist --name my-static-site
```

### Node.js Projects

### React (Vite)

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

### Vue

```json
{
  "maintainer": "Your Name <your.email@company.com>",
  "buildDir": "dist",
  "buildCommand": "npm run build"
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

## 🔧 Advanced Configuration

### Full Configuration Options

**Note:** All fields are optional. CLI options override config file values.

```json
{
  "name": "my-enterprise-app",
  "version": "2.1.3",
  "description": "Enterprise WebApp for SystemLink",
  "maintainer": "Enterprise Team <team@company.com>",
  "architecture": "all",
  "displayName": "My Enterprise App",
  "buildDir": "dist",
  "buildCommand": "npm run build",
  "outputDir": "packages",
  "userVisible": true,
  "depends": [
    "ni-systemlink-server >= 2023.1"
  ]
}
```

### Command Line Options

**Core Options:**

```bash
# Specify build directory
sl-webapp-nipkg build --build-dir ./dist

# Override package metadata
sl-webapp-nipkg build \
  --build-dir ./dist \
  --name "My App" \
  --version "2.0.0" \
  --maintainer "Team <team@example.com>" \
  --description "My awesome webapp"

# Custom output directory
sl-webapp-nipkg build --build-dir ./dist --output-dir ./packages
```

**Build Options:**

```bash
# Build with verbose output
sl-webapp-nipkg build --build --verbose

# Skip cleanup of existing packages
sl-webapp-nipkg build --skip-cleanup

# Use custom config file
sl-webapp-nipkg build --config custom-nipkg.config.json

# Add build suffix for CI/CD
sl-webapp-nipkg build --build-suffix "${BUILD_ID}"
```

## 🏭 CI/CD Integration

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

**Output examples:**

- PR builds: `my-app_1.0.0_12345_all.nipkg` (includes build ID)
- Main builds: `my-app_1.0.0_all.nipkg` (clean version-only name)

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
      sl-webapp-nipkg build --build
    else
      sl-webapp-nipkg build --build --build-suffix "$(Build.BuildId)"
    fi
  displayName: 'Build and package'

- task: PublishBuildArtifacts@1
  inputs:
    PathtoPublish: 'dist/nipkg'
    ArtifactName: 'nipkg-package'
```

### Using Build Suffix in Config File

Alternatively, you can set the suffix in your config file:

```json
{
  "maintainer": "Your Name <your.email@company.com>",
  "buildDir": "dist",
  "buildSuffix": "dev"
}
```

Then use CI environment variables:

```bash
# Override config with CLI option (takes precedence)
sl-webapp-nipkg build --build --build-suffix "${CI_BUILD_ID}"
```

## 📁 Project Structure After Packaging

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

## 🔍 Troubleshooting

### Common Issues & Solutions

#### "Build directory not found"

```bash
# Solution 1: Provide build directory via CLI
sl-webapp-nipkg build --build-dir ./dist

# Solution 2: Build first, then package
npm run build
sl-webapp-nipkg build --build-dir ./dist

# Solution 3: Use --build flag (for Node.js projects)
sl-webapp-nipkg build --build
```

#### "buildDir is required"

```bash
# Solution 1: Provide via CLI
sl-webapp-nipkg build --build-dir ./dist --name my-app

# Solution 2: Add to nipkg.config.json
{
  "buildDir": "dist"  // or "build", "out", etc.
}
```

## 🚀 Next Steps

### Publishing Your Tool

1. **Create GitHub Repository**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/sl-webapp-nipkg.git
   git push -u origin main
   ```

2. **Publish to NPM**

   ```bash
   npm login
   npm publish
   ```

3. **Team Installation**

   ```bash
   npm install -g @ni/sl-webapp-nipkg
   # OR in projects
   npm install --save-dev @ni/sl-webapp-nipkg
   ```

### Extending the Tool

1. **Add more output formats** (e.g., ZIP, MSI)
2. **Add configuration validation**
3. **Support multiple architectures**
4. **Add file templating**
5. **Pre/post build hooks**

## 💡 Best Practices

1. **For Node.js Projects**: Use config file for consistency across builds
2. **For Non-Node.js**: Use CLI flags for maximum flexibility
3. **Version Management**: Keep nipkg version in sync with app version
4. **Dependencies**: Specify SystemLink runtime dependencies when needed
5. **CI/CD**: Use `--build-suffix` for PR builds, clean names for production
6. **Testing**: Test packages in clean environment before distribution
7. **Documentation**: Document package contents and requirements

## 🎉 Success

You now have a **production-ready tool** that:

- ✅ Works with any web application framework (Node.js, Python, .NET, static HTML)
- ✅ Zero config required for simple use cases
- ✅ Flexible configuration for complex scenarios
- ✅ Integrates with existing workflows
- ✅ Supports team collaboration
- ✅ Can be automated in CI/CD
- ✅ Provides excellent developer experience

Your tool is **flexible and modern** because it:

- Works across the entire web application ecosystem
- Requires no mandatory config files or package.json
- Supports CLI overrides for all options
- Works across different environments
- Can be easily shared and updated
- Provides better error handling and UX
