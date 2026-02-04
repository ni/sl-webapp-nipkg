export interface NipkgConfig {
    /** Package name (auto-detected from package.json if not provided) */
    name?: string;
    /** Package version (auto-detected from package.json if not provided) */
    version?: string;
    /** Package description (auto-detected from package.json if not provided) */
    description?: string;
    /** Maintainer information */
    maintainer: string;
    /** Package architecture (default: all) */
    architecture?: string;
    /** Display name for the package */
    displayName?: string;
    /** Build output directory (e.g., 'dist' or 'build') - REQUIRED */
    buildDir?: string;
    /** Custom build command (default: 'npm run build') */
    buildCommand?: string;
    /** Custom output directory for nipkg files (default: dist/nipkg) */
    outputDir?: string;
    /** Additional dependencies */
    depends?: string[];
    /** Whether the package is user visible */
    userVisible?: boolean;
}

export interface BuildOptions {
    /** Run build command before packaging */
    build?: boolean;
    /** Build configuration (e.g., 'production') */
    configuration?: string;
    /** Verbose output */
    verbose?: boolean;
    /** Skip cleanup of existing packages */
    skipCleanup?: boolean;
}