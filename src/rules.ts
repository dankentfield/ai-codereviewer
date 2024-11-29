import { readFileSync } from "fs";
import minimatch from "minimatch";
import { parse } from "yaml";
import { File } from "parse-diff";

const RULES_FILE_PATH = ".github/config/ai_rules.yaml";

function getApplicableRules(rules: RulesFile, file: File): string[] {
  const { extensions, directories, global } = rules;

  const extensionRules = extensions
    .filter((ext) =>
      ext.file_extensions.some((extension) =>
        file.to ? minimatch(file.to, extension) : false
      )
    )
    .flatMap((ext) => ext.rules);

  const directoryRules = directories
    .filter((dir) =>
      dir.paths.some((path) => (file.to ? minimatch(file.to, path) : false))
    )
    .flatMap((dir) => dir.rules);

  const finalRules = [...global, ...extensionRules, ...directoryRules];

  return finalRules;
}

export interface RulesFile {
  directories: Array<{
    paths: string[];
    rules: string[];
  }>;
  extensions: Array<{
    file_extensions: string[];
    rules: string[];
  }>;
  global: string[];
  ignore: string[];
}

function readRules(): RulesFile {
  const rulesFile = readFileSync(RULES_FILE_PATH ?? "", "utf8");
  const rules = parse(rulesFile);
  return rules;
}

export { getApplicableRules, readRules };
