import { defineConfig, globalIgnores } from 'eslint/config';
import { typescriptConfig } from '@ni/eslint-config-typescript';

export default defineConfig([
    globalIgnores(['**/packages/', 'dist/**', 'coverage/**', '*.cjs', '*.js', 'eslint.config.mjs']),
    ...typescriptConfig,
    {
        languageOptions: {
            parserOptions: {
                project: './tsconfig.eslint.json',
                tsconfigRootDir: import.meta.dirname,
            }
        }
    }
]);
