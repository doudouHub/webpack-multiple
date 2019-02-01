# webpack多项目打包管理 #

根据项目业务需要，处理多项目并存的打包的情况，共享一个开发环境，独立打包每一个项目。（支持element-ui的scss按需加载）

## 安装
npm依赖包安装，建议安装cnpm：https://npm.taobao.org/

```
   # web端环境安装
   cnpm i
```

## 调试

> **npm run dev** - 默认运行第一个项目 地址：localhost:8084

>  **npm run dev --proj=$projectName** - 单独运行$projectName(项目名)

## 编译打包

>  **npm run build** - 打包所有项目

>  **npm run build --proj=$projectName** - 单独打包$projectName(项目名)

> **npm run publish** 被动调用打包命令


## 项目质量分析
> **npm run analyz --proj=$projectName**

## 目录：

`dist` - 默认输出目录

`config/index` - 打包地址配置

`projects` - 项目目录

`src/element-theme-drop` - 废弃element-ui原有的样式打包，采用scss的方式

`projects/$projetName/debug__build` - 编译调试快捷方式

`projects/$projetName/extraContent` - 额外打包内容

```
## 图片路径
css里面的图片路径使用相对地址向上查询'../assets'
html里面的图片路径同一使用'assets'或者'static'

```
