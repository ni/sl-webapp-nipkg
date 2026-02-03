// @ts-check

/**
 * @type {import('beachball').BeachballConfig}
 */
export default {
    // Branch settings
    branch: 'main',

    // Change file settings
    changehint: 'Run "beachball change" to generate a change file',

    // Changelog settings
    changelog: {
        customRenderers: {
            renderHeader: (version) => `## ${version}`,
            renderEntry: (entry) => {
                const { comment, author, commit } = entry;
                return `- ${comment} (${author})`;
            },
        },
    },

    // Git tags
    tag: 'latest',

    // Bump options
    bumpDeps: false,

    // Ignore patterns
    ignorePatterns: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        '*.test.ts',
        '*.spec.ts',
    ],

    // Scope for publishing (if needed)
    access: 'public',
};
