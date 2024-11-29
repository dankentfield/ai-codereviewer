# Code Nerd

Code Nerd is a GitHub Action that leverages OpenAI's GPT API to provide intelligent feedback and suggestions on
your pull requests. This powerful tool helps improve code quality and saves developers time by automating the code
review process. You can provide your own guidelines for Code Nerd to check on every commit thats pushed.

## Features

- Reviews pull requests using OpenAI's GPT-4o API.
- Provides intelligent comments and suggestions for improving your code.
- Uses your rules to filter
- Ignores files that match specified glob patterns.
- Easy to set up and integrate into your GitHub workflow.

## How to use this action

1. Create a `.github/workflows/ai_code_review.yaml` file in your repository and add the following content:

```yaml
name: CodeNerd

on:
  pull_request:
    types:
      - opened
      - synchronize
permissions: write-all
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v3

      - name: AI Code Reviewer
        uses: multiverse/code_nerd@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # The GITHUB_TOKEN is there by default so you just need to keep it like it is and not necessarily need to add it as secret as it will throw an error. [More Details](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#about-the-github_token-secret)
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_API_MODEL: "gpt-4o" # Optional: defaults to "gpt-4o"
```

4. Create a `.github/config/ai_rules.yaml` file in your repository and customise the rules you would like:

```yaml
# .github/config/ai_rules.yaml

# Global rules that apply to all files/directories unless overridden
global:
  - "Always be concise",
  - "Always consider security vulnerabilities"

# Rules for specific file extensions - keys are glob patterns
extensions:
  - file_extensions: [".ts", ".js"]
    rules:
      - "Always use export default"

# Rules for specific directories - keys are glob patterns
directories:
  - paths: ["*Consumer.ex"]
    rules:
      - "Update catalog-info.yaml"
      - "Add schema to events schemas"

# Paths to ignore completely
ignore:
  - ".git"
  - "node_modules"
  - "dist"
  - "build"
  - "_build"
  - "csv"
  - "json"
```

5. Commit the changes to your repository, and AI Code Reviewer will start working on your future pull request. It will run on each commit push.

## How It Works

The AI Code Reviewer GitHub Action retrieves the pull request diff, filters out excluded files, filters the coding style rules from ai_rules.yaml to only include those relevant to the file, and sends code chunks to
the OpenAI API. It then generates review comments based on the AI's response and adds them to the pull request.

## Contributing

Contributions are welcome!

## Releasing

- Create a new branch from main.
- Make your changes.
- IMPORTANT: increment the semver version in package.json (this will tag the build and release).
- Open a pull request to merge into main.
- Once merged the release.yaml workflow will be run, building and packaging the latest release.
- Now any consumers of this action version will automatically fetch it.

## Versioning

We use semver.

Github actions don't support pinning to the latest major version, so make sure you only increment the major version if you make backwards incompatible changes. Please contact teams that consume this action and let them know they may need to update their rules.yaml file and github actions workflow file.

## Future releases

- Function call for other files to check tests exist
- Allow replies to comments on the PR
