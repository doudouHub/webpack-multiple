// 当前需要编译的项目名
const path = require('path')
const fs = require('fs')
const buildProjectName = process.env.npm_config_proj;

// 当前项目集合
let allProjects = getAllDirs('projects');

// 获取文件下所有一代子集目录
function getAllDirs (mypath = '.') {
    const items = fs.readdirSync(mypath);
    let result = [];

    // 遍历当前目录中所有的文件和文件夹
    items.map(item => {
        let temp = path.join(mypath, item);
        // 若当前的为文件夹
        if (fs.statSync(temp).isDirectory()) {
            result.push(item); // 存储当前文件夹的名字
            // 进入下一级文件夹访问
            // result = result.concat(getAllDirs(temp));
        }
    });
    return result;
}

// 如果运行为传递任何参数
module.exports = buildProjectName || (process.env.NODE_ENV === 'development' ? allProjects[0] : buildProjectName);


