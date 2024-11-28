import { describe, expect, test } from 'vitest';
import { getApplicableRules, readRules } from './main';
import { readFileSync } from 'fs';

describe('readRules', () => {
  test('should read and return rules from the file', () => {

    const rules = `
    global: 
      - "No console.logs allowed."

    extensions:
      - file_extensions: [".ts", ".js"]
        rules:
          - "Always use export default"
      - file_extensions: [".exs", ".ex"]
        rules:
          - "If adding foreign keys, ensure appropriate indexes are added"
          - "Verify index type is appropriate for the use case"
          - "Consider if unique index is needed"
          - "Ensure table names are pluralized"
          - "For data migrations, include testing strategy"
          - "New tables must use UUID as primary key"
          - "Include timestamps (inserted_at, updated_at)"
          - "Column removals must have all usages removed in previous PR"
      - file_extensions: [".tsx"]
        rules:
          - "Always use arrow functions"

    directories: 
      - paths: ["*Consumer.ex"]
        rules:
          - "Update catalog-info.yaml"
          - "Add schema to events schemas"
      - paths: ["*Publisher.ex"]
        rules:
          - "Update catalog-info.yaml"
          - "Add schema to events schemas"
      - paths: ["**/context/**"]
        rules:
          - "Include comprehensive tests"
      - paths: ["**/resolvers/**"]
        rules:
          - "Use GraphQL fragments for leaf components"
      - paths: ["**/scripts/**"]
        rules:
          - "Include tests for complex scripts"
          - "Use transactions appropriately"
      - paths: ["**/schemas/**"]
        rules:
          - "Handle constraints in changesets"
          - "Validate all required fields"
          - "Consider custom validation types"
          - "Evaluate Postgres Enum usage where appropriate"
      - paths: ["**/system_prompt/**"]
        rules:
          - "Create new version when modified"
          - "Verify all variables are provided for rendering"
          - "Update DB table with new prompt"
      - paths: ["**/lib/**"]
        rules:
          - "Use pattern matching effectively"
          - "Break complex functions into smaller ones"
          - "Follow Elixir naming conventions"
          - "Simplify with/case statements using pattern matching"
          - "Maintain immutability principles"
          - "Use Enum and Stream appropriately"
          - "Choose appropriate data structures"
          - "Consider recursive function performance"
          - "Handle long-running processes with Task/GenServer"
          - "Use destructuring where beneficial"
      - paths: ["**/e2e/**"]
        rules:
          - "New user flows must have e2e test coverage"

    ignore:
      - ".git"
      - "node_modules"
      - "dist"
      - "build" 
      - "_build" 
      - "csv" 
      - "json"
      `

    const result = readRules(rules);

    expect(result).toEqual({
      directories: [
        {
          paths: ['*Consumer.ex'],
          rules: [
            'Update catalog-info.yaml',
            'Add schema to events schemas'
          ]
        },
        {
          paths: ['*Publisher.ex'],
          rules: [
            'Update catalog-info.yaml',
            'Add schema to events schemas'
          ]
        },
        {
          paths: ['**/context/**'],
          rules: [
            'Include comprehensive tests'
          ]
        },
        {
          paths: ['**/resolvers/**'],
          rules: [
            'Use GraphQL fragments for leaf components'
          ]
        },
        {
          paths: ['**/scripts/**'],
          rules: [
            'Include tests for complex scripts',
            'Use transactions appropriately'
          ]
        },
        {
          paths: ['**/schemas/**'],
          rules: [
            'Handle constraints in changesets',
            'Validate all required fields',
            'Consider custom validation types',
            'Evaluate Postgres Enum usage where appropriate'
          ]
        },
        {
          paths: ['**/system_prompt/**'],
          rules: [
            'Create new version when modified',
            'Verify all variables are provided for rendering',
            'Update DB table with new prompt'
          ]
        },
        {
          paths: ['**/lib/**'],
          rules: [
            'Use pattern matching effectively',
            'Break complex functions into smaller ones',
            'Follow Elixir naming conventions',
            'Simplify with/case statements using pattern matching',
            'Maintain immutability principles',
            'Use Enum and Stream appropriately',
            'Choose appropriate data structures',
            'Consider recursive function performance',
            'Handle long-running processes with Task/GenServer',
            'Use destructuring where beneficial'
          ]
        },
        {
          paths: ['**/e2e/**'],
          rules: [
            'New user flows must have e2e test coverage'
          ]
        }
      ],
      extensions: [
        {
          file_extensions: ['.ts', '.js'],
          rules: ['Always use export default']
        },
        {
          file_extensions: ['.exs', '.ex'],
          rules: [
            'If adding foreign keys, ensure appropriate indexes are added',
            'Verify index type is appropriate for the use case',
            'Consider if unique index is needed',
            'Ensure table names are pluralized',
            'For data migrations, include testing strategy',
            'New tables must use UUID as primary key',
            'Include timestamps (inserted_at, updated_at)',
            'Column removals must have all usages removed in previous PR'
          ]
        },
        {
          file_extensions: ['.tsx'],
          rules: ['Always use arrow functions']
        }
      ],
      global: ['No console.logs allowed.'],
      ignore: [
        '.git',
        'node_modules',
        'dist',
        'build',
        '_build',
        'csv',
        'json'
      ]
    });
  });
});

describe('getApplicableRules', () => {
  test('Given a list of rules, it should return the rules that apply to the file', () => {

    const rules = {
      directories: [
        {
          paths: ['*Consumer.ex'],
          rules: [
            'Update catalog-info.yaml',
            'Add schema to events schemas'
          ]
        },
        {
          paths: ['*Publisher.ex'],
          rules: [
            'Update catalog-info.yaml',
            'Add schema to events schemas'
          ]
        },
        {
          paths: ['**/context/**'],
          rules: [
            'Include comprehensive tests'
          ]
        },
        {
          paths: ['**/resolvers/**'],
          rules: [
            'Use GraphQL fragments for leaf components'
          ]
        },
        {
          paths: ['**/scripts/**'],
          rules: [
            'Include tests for complex scripts',
            'Use transactions appropriately'
          ]
        },
        {
          paths: ['**/schemas/**'],
          rules: [
            'Handle constraints in changesets',
            'Validate all required fields',
            'Consider custom validation types',
            'Evaluate Postgres Enum usage where appropriate'
          ]
        },
        {
          paths: ['**/system_prompt/**'],
          rules: [
            'Create new version when modified',
            'Verify all variables are provided for rendering',
            'Update DB table with new prompt'
          ]
        },
        {
          paths: ['**/lib/**'],
          rules: [
            'Use pattern matching effectively',
            'Break complex functions into smaller ones',
            'Follow Elixir naming conventions',
            'Simplify with/case statements using pattern matching',
            'Maintain immutability principles',
            'Use Enum and Stream appropriately',
            'Choose appropriate data structures',
            'Consider recursive function performance',
            'Handle long-running processes with Task/GenServer',
            'Use destructuring where beneficial'
          ]
        },
        {
          paths: ['**/e2e/**'],
          rules: [
            'New user flows must have e2e test coverage'
          ]
        }
      ],
      extensions: [
        {
          file_extensions: ['**/*.ts', '**/*.js'],
          rules: ['Always use export default']
        },
        {
          file_extensions: ['*.exs', '*.ex'],
          rules: [
            'If adding foreign keys, ensure appropriate indexes are added',
            'Verify index type is appropriate for the use case',
            'Consider if unique index is needed',
            'Ensure table names are pluralized',
            'For data migrations, include testing strategy',
            'New tables must use UUID as primary key',
            'Include timestamps (inserted_at, updated_at)',
            'Column removals must have all usages removed in previous PR'
          ]
        },
        {
          file_extensions: ['*.tsx'],
          rules: ['Always use arrow functions']
        }
      ],
      global: ['No console.logs allowed.', 'Always be concise'],
      ignore: [
        '.git',
        'node_modules',
        'dist',
        'build',
        '_build',
        'csv',
        'json'
      ]
    }
    
    const result = getApplicableRules(rules, {
      to: "src/main.ts",
      chunks: [],
      deletions: 0,
      additions: 0
    });

    expect(result).toEqual([
      'No console.logs allowed.',
      'Always be concise',
      'Always use export default'
    ]);

  });
  test('Given an ignore file, it should return only global rules', () => {

    const rules ={
      directories: {
        src: [],
      },
      extensions: [
        {
          file_extensions: ['.ts', '.js'],
          rules: ["Always use export default"]
        },
        {
          file_extensions: ['.tsx'],
          rules: ['Always use arrow functions']
        }
      ],
      global: ["Always be concise"],
      ignore: [
        ".git",
        "node_modules",
        "dist",
        "build",
        "_build",
        "csv",
        "json",
      ]
    };
    
    const result = getApplicableRules(rules, {
      to: "src/.git",
      chunks: [],
      deletions: 0,
      additions: 0
    });

    expect(result).toEqual([
      "Always be concise",
    ]);

  });
  test('Given a file with rules that apply to its extension and directory, it should return all the rules', () => {

    const rules ={
      directories: {
        "**/resolvers/**": ["Always write tests"],
      },
      extensions: [
        {
          file_extensions: ['.ts', '.js'],
          rules: ["Always use export default"]
        },
        {
          file_extensions: ['.tsx'],
          rules: ['Always use arrow functions']
        }
      ],
      global: ["Always be concise"],
      ignore: [
        ".git",
        "node_modules",
        "dist",
        "build",
        "_build",
        "csv",
        "json",
      ]
    };
    
    const result = getApplicableRules(rules, {
      to: "lib/web_app/resolvers/bots.ts",
      chunks: [],
      deletions: 0,
      additions: 0
    });

    expect(result).toEqual([
      "Always be concise",
      "Always use export default",
      "Always write tests",
    ]);

  });
});