# Github Action for Deploying Multiple Bicep Files to Azure

----------------------

A github action to deploy multiple bicep files. Capable of only uploading files that were changed to Azure.

## Inputs

----------------------

* 'tag': tag to publish the modules with
* 'registry': name of the registry to publish the modules to
* 'changedFiles': changed files that need to be uploaded 

## Usage

***

```yml
-uses: upload-bicep@v1  
 with:
   tag: <YourTag>
   registry: <YourRegistry>
   changedFiles: <FilesYouChanged>
```

## Example Workflow

***

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
          az login --service-principal --username ${{secrets.TEST_APPID}} --tenant ${{secrets.TENANT_ID}}  --password ${{secrets.TEST_APPSECRET}}
          az acr login --name ${{secrets.REGISTRYNAME}}
      - uses: ./.github/actions/publish
        with: 
          tag: ${{ steps.date.outputs.date }}
          registry: ${{secrets.REGISTRYNAME}}
          changedfiles: ${{needs.changedfiles.outputs.all}}
```