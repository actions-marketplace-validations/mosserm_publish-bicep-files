const core = require('@actions/core'); 
const { exec } = require("child_process");

try{
    const stringOfFiles = core.getInput('changedfiles');
    const registry = core.getInput('registry');
    const tag = core.getInput('tag');
    files = stringOfFiles.split(' ');
    files.forEach(file => {
        if (file.includes('.bicep')){
            fileLowercase = file.toLowerCase();
            exec('az bicep publish --file ' + file + ' --target br:' + registry + '.azurecr.io/' + fileLowercase +':' + tag, (error, stdout, stderr) =>{
                if (error) {
                    console.log(`error: ${error.message}`);
                    core.setFailed(error.message);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log('Published File: ' + file);
            })
        }
    })
        
} catch (error){
    core.setFailed(error.message)
}
