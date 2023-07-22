name: Repo Commands

on:
  issue_comment:        # Handle comment commands
    types: [created]
  pull_request:         # Handle renamed PRs
    types: [edited]

jobs:
  comment-trigger:
    runs-on: ubuntu-latest
    steps:
    - name: Check out repository
      uses: actions/checkout@v3
    - name: Run command handlers
      uses: PrismarineJS/prismarine-repo-actions@master
      with:
        # NOTE: You must specify a Personal Access Token (PAT) with repo access here. While you can use the default GITHUB_TOKEN, actions taken with it will not trigger other actions, so if you have a CI workflow, commits created by this action will not trigger it.
        token: ${{ secrets.PAT_PASSWORD }}
        # See `Options` section below for more info on these options
        install-command: npm install
        /fixlint.fix-command: npm run fix