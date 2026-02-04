# 🚀 Quick Start Guide: SystemLink WebApp NIPKG Builder

## What You've Built

You now have a **professional Node.js tool** that integrates seamlessly with any Node.js project to package them as `.nipkg` files for National Instruments SystemLink.

## ✅ What's Working

✅ **CLI Tool**: `sl-nipkg` command available globally  
✅ **Framework Agnostic**: Works with React, Angular, Vue, Next.js, or any Node.js app  
✅ **Configuration**: Easy JSON-based configuration  
✅ **Build Integration**: Can run any build command automatically  
✅ **Package Structure**: Creates proper `.nipkg` structure  
✅ **Error Handling**: Comprehensive error messages  
✅ **TypeScript Support**: Full type definitions included  

## 🎯 How to Use in Real Projects

### 1. Add to Existing Node.js Project

```bash
# Navigate to your project
cd my-webapp-project

# Install as dev dependency
npm install --save-dev @ni/sl-webapp-nipkg

# Or install globally
npm install -g @ni/sl-webapp-nipkg
```

### 2. Initialize Configuration

```bash
sl-nipkg init
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

**Note:** The `name`, `version`, and `description` are automatically detected from your `package.json` if not specified in the config.

### 3. Add NPM Scripts to package.json

```json
{
  "scripts": {
    "build": "vite build",
    "build:nipkg": "sl-nipkg build --build",
    "package:nipkg": "sl-nipkg build"
  }
}
```

### 4. Build and Package

```bash
# Option 1: Build app and package in one command
npm run build:nipkg

# Option 2: Use existing build output
npm run build
npm run package:nipkg

# Option 3: Direct command with options
sl-nipkg build --build --verbose
```

## 🔧 Framework-Specific Examples

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

```bash
# Build with verbose output
sl-nipkg build --build --verbose

# Skip cleanup of existing packages
sl-nipkg build --skip-cleanup

# Use custom config file
sl-nipkg build --config custom-nipkg.config.json
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

## 📁 Project Structure After Packaging

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

## 🔍 Troubleshooting

### Common Issues & Solutions

**"Build directory not found"**
```bash
# Solution: Build first or use --build flag
npm run build
sl-nipkg build
# OR
sl-nipkg build --build
```

**"This is not a Node.js project"**

```bash
# Solution: Run in Node.js project directory with package.json
cd path/to/your/project
sl-nipkg build
```

**"buildDir is required"**

```bash
# Solution: Add buildDir to nipkg.config.json
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

1. **Version Management**: Keep nipkg version in sync with app version
2. **Dependencies**: Always specify SystemLink runtime dependencies
3. **Testing**: Test packages in clean environment before distribution
4. **Documentation**: Document package contents and requirements
5. **CI/CD**: Automate packaging in your build pipeline

## 🎉 Success!

You now have a **production-ready tool** that:
- ✅ Works with any Node.js framework
- ✅ Integrates with existing workflows
- ✅ Supports team collaboration
- ✅ Can be automated in CI/CD
- ✅ Provides excellent developer experience

Your tool is **flexible and modern** because it:
- Works across the entire Node.js ecosystem
- Requires no external dependencies
- Works across different environments
- Can be easily shared and updated
- Provides better error handling and UX