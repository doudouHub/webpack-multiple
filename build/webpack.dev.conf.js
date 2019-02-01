const utils = require('./utils')
const path = require('path');
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');

// 当前需要编译的项目名
const buildProjectName = require('../config/projects');

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
    baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

module.exports = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({sourceMap: config.dev.cssSourceMap})
    },
    devtool: '#cheap-module-eval-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': config.dev.env
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new HtmlWebpackPlugin({
            filename: `index.html`,
            template: `src/projects/${buildProjectName}/index.html`,
            inject: true
        }),
        new CopyWebpackPlugin([
            {
                from: path.resolve(`src/projects/${buildProjectName}/assets`),
                to: 'assets'
            },
            {
                from: path.resolve(`src/projects/${buildProjectName}/extraContent/activity_detail`),
                to: 'activity_detail'
            }
        ]),
        new FriendlyErrorsPlugin()
    ]
})
