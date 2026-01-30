# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
