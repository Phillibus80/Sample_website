import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default [
    {ignores: ['dist']},
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2021,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: {jsx: true},
                sourceType: 'module',
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'unused-imports': unusedImports,
            import: importPlugin
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'error',
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^[A-Z_]',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
            'no-unused-vars': 'off',
            'no-console': ['error', {allow: ['warn', 'error']}],
            'quotes': ['error', 'single', {'avoidEscape': true, 'allowTemplateLiterals': true}],
            'jsx-quotes': ['error', 'prefer-single'],
            'semi': ['error', 'always'],
            'react-refresh/only-export-components': [
                'warn',
                {allowConstantExport: true},
            ],
            'import/order': ['error', {
                groups: [
                    'builtin',       // Node.js core
                    'external',      // npm packages
                    'internal',      // your aliases, e.g., @/hooks
                    ['parent', 'sibling', 'index'],
                    'object',
                    'type',
                ],
                pathGroups: [
                    {pattern: 'react', group: 'external', position: 'before'},
                    {pattern: 'next/**', group: 'external', position: 'before'},
                    {pattern: '@/components/**', group: 'internal', position: 'after'},
                ],
                pathGroupsExcludedImportTypes: ['react'],
                'newlines-between': 'always',
                alphabetize: {order: 'asc', caseInsensitive: true},
            }]
        },
    },
];
