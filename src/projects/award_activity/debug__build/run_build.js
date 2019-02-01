const shell = require('shelljs');

// 当前目录名称 - 当前项目名
let projectName = __dirname.substring(__dirname.lastIndexOf('\\', __dirname.lastIndexOf('\\') - 1) + 1, __dirname.lastIndexOf('\\'));
shell.exec(`npm run publish --proj=${projectName}`);
