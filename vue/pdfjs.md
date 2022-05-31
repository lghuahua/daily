## 安装使用pdfjs

pdfjs-dist版本2.14.305
```bash
yarn add pdfjs-dist
```
在vue中导入pdfjs
```vue
import * as PdfjsLib from 'pdfjs-dist/webpack'
import { PDFViewer, EventBus } from 'pdfjs-dist/web/pdf_viewer.js'
```
直接使用我们会遇到一些问题
1、Failed to resolve loader: worker-loader
在webpack.js文件里我们可以看到pdfjs使用了[web worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers)
```
const PdfjsWorker = require("worker-loader?esModule=false&filename=[name].[contenthash].js!./build/pdf.worker.js")
```
因为使用webpack打包，所以就需要安装[worker-loader](https://www.webpackjs.com/loaders/worker-loader)
```
yarn add -D worker-loader
```
继续运行我们会遇到第二个错误
2、Private class features
报错中我们看到 static #docId = 0; ，在js类中定义了以'#'开头的静态字段
```
Module parse failed: Unexpected character '#' (1387:9)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
|
| class PDFDocumentLoadingTask {
>   static #docId = 0;
```
顺便学习一下 [Private class features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)

看这报错信息是要我们配置loader， 我们使用babel进行转译。babel插件有[@babel/plugin-proposal-private-methods](https://babeljs.io/docs/en/babel-plugin-proposal-private-methods)
我们使用的 "@vue/cli-plugin-babel": "~4.5.0"，不需要单独安装这个插件
配置babel
```js
// babel.config.js
module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-private-methods',
    '@babel/plugin-proposal-private-property-in-object'
  ]
}
```
配置无效，还是报同样的错误，因为默认情况下 babel-loader 会忽略所有 node_modules 中的文件，所以需要显式转译一下。
在vue cli配置中配置 transpileDependencies
```js
// vue.config.js
  transpileDependencies: [
    /[\\/]node_modules[\\/]_?pdfjs-dist(.*)/
  ]
```
解决问题

最终使用
```html
<template>
  <div class="relative">
    <div id="pageContainer" class="absolute w-full">
      <div></div>
    </div>
  </div>
</template>
<script>
import * as PdfjsLib from 'pdfjs-dist/webpack'
import { PDFViewer, EventBus } from 'pdfjs-dist/web/pdf_viewer.js'
export default {
  name: 'PdfViewer',
  props: {
    pdfPath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
    }
  },
  created() {
    if (this.pdfPath) {
      this.load(this.pdfPath)
    }
  },
  methods: {
    async load(path) {
      let loadingTask = PdfjsLib.getDocument(path)
      let pdf = await loadingTask.promise
      let container = document.getElementById('pageContainer')

      let pdfViewer = new PDFViewer({
        container: container,
        eventBus: new EventBus()
      })
      pdfViewer.setDocument(pdf)
    }
  }
}
</script>
<style lang='less'>
#pageContainer{
  .page{
    margin: auto;
  }
}
</style>

```