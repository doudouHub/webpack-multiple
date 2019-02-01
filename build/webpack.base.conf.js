const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
// 当前需要编译的项目名
const buildProjectName = require('../config/projects');

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    entry: {
        app: ['babel-polyfill', 'project/main.js'],
        'vender-base': 'project/vendors/vendors.base.js',
        'vender-exten': 'project/vendors/vendors.exten.js'
    },
    output: {
        path: config.build.assetsRoot,
        filename: '[name].js',
        publicPath: process.env.NODE_ENV === 'production'
            ? config.build.assetsPublicPath
            : config.dev.assetsPublicPath
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.common.js',
            'static': resolve('static'),
            'src': resolve('src'),
            'project': resolve(`src/projects/${buildProjectName}`),
            'assets': resolve('project/assets'),
            'components': resolve('src/components')
        },
        modules: [
            resolve('src'),
            resolve('node_modules')
        ]
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: vueLoaderConfig
            },
               {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src'), resolve('project'), resolve('test')]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 1000,
                    name: utils.assetsPath('img/[name].[hash:7].[ext]'),
                    // publicPath:'assets'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.scss$/,
                loaders: ["style", "css", "sass"]
            }
        ]
    },
    plugins: [
        // new webpack.DllReferencePlugin({
        //   context: path.resolve(__dirname, '..'),
        //   manifest: require('./vendor-manifest.json')
        // })
    ]
}
