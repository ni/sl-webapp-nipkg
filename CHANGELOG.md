# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2026-02-06

### Changed

- **BREAKING**: All configuration files are now completely optional (no `nipkg.config.json` or `package.json` required)
- **BREAKING**: `maintainer` field is now optional with default value `'Unknown <unknown@example.com>'`
- **BREAKING**: Removed requirement for Node.js project detection (no longer requires `package.json`)
- CLI options now override config file values, which override `package.json` values, which override defaults
- Package name now defaults to current directory name if not found in config or `package.json`
- Tool now works with any web application framework (Node.js, Python Pyodide, .NET Blazor, static HTML, etc.)

### Added

- New CLI option: `--build-dir <path>` - Specify build output directory directly from command line
- New CLI option: `--name <name>` - Override package name
- New CLI option: `--version <version>` - Override package version
- New CLI option: `--description <description>` - Override package description
- New CLI option: `--maintainer <maintainer>` - Override maintainer information
- New CLI option: `--output-dir <path>` - Override output directory for nipkg files
- Smart defaults for all metadata fields enabling zero-config usage
- Support for non-Node.js web applications (Python, .NET Blazor, static sites)
- CLI-first workflow - can now package any web app without any config files
- Support for deboa's `targetFileName` option to set output filename directly

### Fixed

- Package file is now created with the correct `.nipkg` extension directly instead of requiring rename from `.deb`

### Removed

- **BREAKING**: Removed blocking check for Node.js projects (`isNodeProject()` validation)
- Config file is no longer auto-generated when missing (optional workflow)

## [3.0.0] - 2026-02-04

### Changed

- **BREAKING**: Converted from Angular-specific tool to generic Node.js application packager
- **BREAKING**: Renamed `AngularNipkgBuilder` to `SystemLinkNipkgBuilder`
- **BREAKING**: Project detection now checks for `package.json` instead of `angular.json`
- **BREAKING**: Removed `projectName` field from config (auto-detected from `package.json`)
- **BREAKING**: CLI command defaults changed from `ng build` to `npm run build`
- Package name, version, and description now auto-detected from `package.json` when not specified in config
- `buildCommand` field added to config for custom build commands (default: `npm run build`)
- Updated all documentation to reflect generic Node.js usage with framework examples (Angular, React, Vue, Next.js)

### Added

- Auto-detection of package name from `package.json`
- Auto-detection of package description from `package.json` (defaults to empty string if not found)
- Support for any Node.js framework (React, Vue, Next.js, Express, etc.)
- Configurable build commands via `buildCommand` in config
- Generic framework examples in documentation

### Removed

- **BREAKING**: Angular Schematics integration
- **BREAKING**: Angular CLI-specific configuration and validation
- Dependency on `tar-fs` (now using deboa's built-in packaging)
- Angular-specific terminology and examples from documentation

## [2.1.0] - 2026-01-30

### Added

- Auto-detection of package version from project's `package.json`
- Version field in `nipkg.config.json` is now optional
- CLI now dynamically reads version from `package.json` instead of hardcoding

### Changed

- `NipkgConfig.version` is now optional and falls back to project's `package.json` version
- Improved version resolution priority: nipkg.config.json > package.json > default (1.0.0)

## [2.0.0] - 2026-01-30

### Changed

- **BREAKING**: Removed dependency on NI Package Manager (nipkg.exe)
- Package creation now uses pure Node.js implementation
- No external dependencies required for creating .nipkg packages

### Added

- Self-contained packaging solution
- Cross-platform compatibility improvements

## [1.0.1] - 2026-01-30

### Fixed

- Jest configuration compatibility with ES modules
- Markdown linting issues in README

## [1.0.0] - 2026-01-30

### Added

- Initial release
- Angular application packaging to .nipkg format
- CLI interface with build and init commands
- TypeScript support with full type definitions
- Comprehensive test suite
- CI/CD integration examples
