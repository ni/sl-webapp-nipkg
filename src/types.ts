export interface NipkgConfig {
  /** Package name */
  name: string;
  /** Package version */
  version: string;
  /** Package description */
  description: string;
  /** Maintainer information */
  maintainer: string;
  /** Package architecture (default: windows_x64) */
  architecture?: string;
  /** Display name for the package */
  displayName?: string;
  /** Angular project name (auto-detected if not provided) */
  projectName?: string;
  /** Angular build output directory (e.g., 'dist/my-app/browser' or 'dist/my-app') - REQUIRED for Angular 19+ */
  buildDir: string;
  /** Custom output directory for nipkg files (default: dist/nipkg) */
  outputDir?: string;
  /** Path to nipkg executable (auto-detected if not provided) */
  nipkgPath?: string;
  /** Additional dependencies */
  depends?: string[];
  /** Whether the package is user visible */
  userVisible?: boolean;
}

export interface BuildOptions {
  /** Run ng build before packaging */
  build?: boolean;
  /** Build configuration (e.g., 'production') */
  configuration?: string;
  /** Verbose output */
  verbose?: boolean;
  /** Skip cleanup of existing packages */
  skipCleanup?: boolean;
}