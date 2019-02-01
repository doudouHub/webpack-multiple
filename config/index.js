// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path');
var packageConfig = require('../package.json')

// 当前需要编译的项目名
const buildProjectName = require('./projects');

module.exports = {
    build: {
        env: require('./prod.env'),
        index: path.resolve(__dirname, `../dist/${buildProjectName}/main.html`),
        assetsRoot: path.resolve(__dirname, `../dist/${buildProjectName}`),
        assetsSubDirectory: 'static',
        assetsPublicPath: './',
        productionSourceMap: false,
        productionGzip: false,
        productionGzipExtensions: ['js', 'css'],
        bundleAnalyzerReport: process.env.npm_config_report
    },
    dev: {
        env: require('./dev.env'),
        port: 8084,
        autoOpenBrowser: false,
        assetsSubDirectory: 'static',
        assetsPublicPath: '/',
        proxyTable: {
            '/api': {
                target: 'http://jsonplaceholder.typicode.com',
                changeOrigin: true,
                pathRewrite: {
                    '/api': ''
                }
            }
        },
        cssSourceMap: true
    }
}
