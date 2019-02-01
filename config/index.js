// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path');
var packageConfig = require('../package.json')

// 当前需要编译的项目名
const buildProjectName = require('./projects');

module.exports = {
    build: {
        env: require('./prod.env'),
        index: path.resolve(__dirname, `../dist/${buildProjectName}/index.html`),
        assetsRoot: path.resolve(__dirname, `../dist/${buildProjectName}`),
        assetsSubDirectory: 'static',
        assetsPublicPath: './',
        productionSourceMap: false,
        productionGzip: true,
        productionGzipExtensions: ['js', 'css'],
        bundleAnalyzerReport: process.env.npm_config_report
    },
    dev: {
        env: require('./dev.env'),
        port: 8084,
        autoOpenBrowser: true,
        assetsSubDirectory: 'static',
        assetsPublicPath: '/',
        proxyTable: {
            '/api': {
                // target: 'http://bk_service.iclass30.com:801',
                target: 'http://test.iclass30.com:801',
                changeOrigin: true,
                pathRewrite: {
                    '/api': ''
                }
            }
        },
        cssSourceMap: true
    }
}
