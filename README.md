# Github Action for Deploying Multiple Bicep Files to Azure

A github action to deploy multiple bicep files. Given a list of file paths to bicep files, this action publishes each file to a specified registry.

## Inputs

* `tag`: tag to publish the modules with
* `registry`: name of the registry to publish the modules to
* `changedFiles`: changed files that need to be uploaded 

## Usage

```yml
-uses: upload-bicep@v1  
 with:
   tag: <YourTag>
   registry: <YourRegistry>
   changedFiles: <FilesYouChanged>
```

## Example Workflow

This workflow assumes all the bicep files that need to be reuploaded are under the modules folder. This workflow then collects the changed files to upload by executing a git diff on the modules folder to get all the files that were added, copied, modified, renamed, and/or had their type changed. It then passes those files to index.js as input and uploads them after authenticating with Azure.

```yml
on: [push]
name: Publish Bicep Modules

jobs:
  changedFiles:
    runs-on: [self-hosted]
    outputs: 
      all: ${{ steps.changes.outputs.all}}
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v2
        with: 
          fetch-depth: 3
      - name: Get Changed Files
        id: changes
        run: |
          echo "::set-output name=all::$(git diff --name-only --diff-filter=ACMRT ${{ github.event.pull_request.head.sha }} ${{ github.event.pull_request.base.sha }} -- modules/ | grep .bicep$ | xargs)"

  publish:
    name: publish bicep files
    runs-on: [self-hosted]
    needs: changedFiles
    if: ${{needs.changedfiles.outputs.all}} && github.event.push
    steps:
      - uses: actions/checkout@v2
      - name: Get current date
        id: date
        run: echo "::set-output name=date::$(date +'%Y-%m-%d')"
      - name: login
        run: |
          az login --service-principal --username ${{secrets.ACR_USERNAME}} --tenant ${{secrets.AZURE_TENANT_ID}}  --password ${{secrets.ACR_PASSWORD }}
          az acr login --name ${{secrets.REGISTRYNAME}}
      - uses: upload-bicep@v1
        with: 
          tag: ${{ steps.date.outputs.date }}
          registry: ${{secrets.REGISTRYNAME}}
          changedfiles: ${{needs.changedfiles.outputs.all}}
```