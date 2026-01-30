# 🚀 Quick Start Guide: Angular NIPKG Builder

## What You've Built

You now have a **professional Node.js tool** that integrates seamlessly with Angular projects to package them as `.nipkg` files for National Instruments Package Manager.

## ✅ What's Working

✅ **CLI Tool**: `ng-nipkg` command available globally  
✅ **Auto-detection**: Automatically detects Angular projects  
✅ **Configuration**: Easy JSON-based configuration  
✅ **Build Integration**: Can run `ng build` automatically  
✅ **Package Structure**: Creates proper `.nipkg` structure  
✅ **Error Handling**: Comprehensive error messages  
✅ **TypeScript Support**: Full type definitions included  

## 🎯 How to Use in Real Angular Projects

### 1. Add to Existing Angular Project

```bash
# Navigate to your Angular project
cd my-angular-project

# Install as dev dependency
npm install --save-dev file:../path/to/angular-nipkg-builder

# Or install globally (already done)
# npm install -g angular-nipkg-builder
```

### 2. Initialize Configuration

```bash
ng-nipkg init
```

This creates `nipkg.config.json`:
```json
{
  "name": "my-app",
  "version": "1.0.1",
  "description": "My Angular application",
  "maintainer": "John Doe <john@company.com>",
  "architecture": "all",
  "displayName": "My App",
  "userVisible": true
}
```

### 3. Add NPM Scripts to package.json

```json
{
  "scripts": {
    "build:prod": "ng build --configuration production",
    "build:nipkg": "ng-nipkg build --build --configuration production",
    "package:nipkg": "ng-nipkg build"
  }
}
```

### 4. Build and Package

```bash
# Option 1: Build Angular app and package in one command
npm run build:nipkg

# Option 2: Use existing build output
ng build --configuration production
npm run package:nipkg

# Option 3: Direct command with options
ng-nipkg build --build --configuration production --verbose
```

## 🔧 Advanced Configuration

### Full Configuration Options

```json
{
  "name": "my-enterprise-app",
  "version": "2.1.3",
  "description": "Enterprise Angular application for National Instruments",
  "maintainer": "Enterprise Team <team@company.com>",
  "architecture": "all",
  "displayName": "My Enterprise App",
  "projectName": "my-enterprise-app",
  "buildDir": "dist/my-enterprise-app/browser",
  "outputDir": "packages",
  "userVisible": true,
  "depends": [
    "ni-labview-runtime-2023-q1",
    "ni-visa-runtime >= 23.0"
  ]
}
```

### Command Line Options

```bash
# Build with specific configuration
ng-nipkg build --build --configuration production

# Verbose output for debugging
ng-nipkg build --verbose

# Skip cleanup of existing packages
ng-nipkg build --skip-cleanup

# Use custom config file
ng-nipkg build --config custom-nipkg.config.json
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
your-angular-project/
├── dist/
│   ├── your-app/                    # Angular build output
│   │   └── browser/
│   └── nipkg/                       # NIPKG packaging
│       ├── your-app_1.0.0.nipkg  # Final package
│       └── file-package/
│           ├── debian-binary
│           ├── control/
│           │   └── control
│           └── data/
│               └── ApplicationFiles_64/  # Your Angular app files
│                   ├── index.html
│                   ├── main.js
│                   └── assets/
├── nipkg.config.json                # Package configuration
└── package.json                     # NPM scripts added
```

## 🔍 Troubleshooting

### Common Issues & Solutions

**"Angular build directory not found"**
```bash
# Solution: Build first or use --build flag
ng build --configuration production
ng-nipkg build
# OR
ng-nipkg build --build
```

**"This is not an Angular workspace"**

```bash
# Solution: Run in Angular project directory with angular.json
cd path/to/angular/project
ng-nipkg build
```

## 🚀 Next Steps

### Publishing Your Tool

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/angular-nipkg-builder.git
   git push -u origin main
   ```

2. **Publish to NPM**
   ```bash
   npm login
   npm publish
   ```

3. **Team Installation**
   ```bash
   npm install -g angular-nipkg-builder
   # OR in projects
   npm install --save-dev angular-nipkg-builder
   ```

### Extending the Tool

1. **Add more output formats** (e.g., ZIP, MSI)
2. **Create Angular Builder** for deeper integration
3. **Add configuration validation**
4. **Support multiple architectures**
5. **Add file templating**

## 💡 Best Practices

1. **Version Management**: Keep nipkg version in sync with Angular app version
2. **Dependencies**: Always specify NI runtime dependencies
3. **Testing**: Test packages in clean environment before distribution
4. **Documentation**: Document package contents and requirements
5. **CI/CD**: Automate packaging in your build pipeline

## 🎉 Success!

You now have a **production-ready tool** that:
- ✅ Works with any Angular project
- ✅ Integrates with existing workflows
- ✅ Supports team collaboration
- ✅ Can be automated in CI/CD
- ✅ Provides excellent developer experience

Your tool is **much better** than the original Python version because it:
- Lives in the Angular ecosystem naturally
- Requires no external Python dependencies
- Works across different environments
- Can be easily shared and updated
- Provides better error handling and UX