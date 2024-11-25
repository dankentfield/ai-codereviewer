import { describe, expect, test } from 'vitest';
import { getApplicableRules, readRules } from './main';

describe('readRules', () => {
  test('should read and return rules from the file', () => {
    const result = readRules('rules.yaml');
    expect(result).toEqual({
      directories: {
        "src/**": [],
      },
      extensions: {
        '.ts': ["Always use export default"],
        '.js': ["Always use export default"],
        'tsx': [ 'Always use arrow functions' ],
      },
      global: [],
      ignore: [
        ".git",
        "node_modules",
        "dist",
        "build",
        "_build",
        "csv",
        "json",
      ]
    });
  });
});

describe('getApplicableRules', () => {
  test('Given a list of rules for .ts extension and a file with that extension, it should return the rules that apply to the file', () => {

    const rules ={
      directories: {
        src: [],
      },
      extensions: {
        '.ts': ["Always use export default"],
        '.js': ["Always use export default"],
        'tsx': [ 'Always use arrow functions' ],
      },
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
      to: "src/main.ts",
      chunks: [],
      deletions: 0,
      additions: 0
    });

    expect(result).toEqual([
      "Always be concise",
      "Always use export default",
    ]);

  });
  test('Given an ignore file, it should return only global rules', () => {

    const rules ={
      directories: {
        src: [],
      },
      extensions: {
        '.ts': ["Always use export default"],
        '.js': ["Always use export default"],
        'tsx': [ 'Always use arrow functions' ],
      },
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
      extensions: {
        '.ts': ["Always use export default"],
        '.js': ["Always use export default"],
        'tsx': [ 'Always use arrow functions' ],
      },
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