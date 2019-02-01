const utils = require('../build/utils');
const shell = require('shelljs');
// 当前项目集合
let allProjects = utils.getAllDirs('projects');

// 当前需要编译的项目名
const buildProjectName = require('./projects');

// 开始正式发布
if (buildProjectName) {
    for (let item of allProjects) {
        if (item === buildProjectName) {
            shell.exec(`npm run publish --proj=${item}`);
            return;
        }
    }
    console.log(`--- 未找到项目 ${buildProjectName},请检查项目名称 ---`)
} else {
    // 打包全部项目
    for (let item of allProjects) {
        shell.exec(`npm run publish --proj=${item}`);
    }
}
