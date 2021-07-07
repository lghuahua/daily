## vite插件学习

[Vite](https://cn.vitejs.dev/guide/)是一种新型前端构建工具，能够显著提升前端开发体验。
在开发时我们需要mock一些接口数据。在使用webpack时，我们可以在devServer中配置before或after来提供自定义中间件，在服务器内部所有中间件执行前后执行。
例：
```javascript
// webpack.config.js
module.exports = {
  //...
  devServer: {
    before: function (app, server, compiler) {
      app.get('/some/path', function (req, res) {
        res.json({ custom: 'response' });
      });
    },
    after: function (app, server, compiler) {
      // do fancy stuff
    },
  },
};

```

Vite 插件扩展了设计出色的 Rollup 接口,
Vite 插件也可以提供钩子来服务于特定的 Vite 目标。这些钩子会被 Rollup 忽略。

config: 在被解析之前修改 Vite 配置

configResolved: 在解析 Vite 配置后调用

configureServer： 用于配置开发服务器的钩子，configureServer 钩子将在内部中间件被安装前调用，所以自定义的中间件将会默认会比内部中间件早运行。如果你想注入一个在内部中间件 之后 运行的中间件，你可以从 configureServer 返回一个函数，将会在内部中间件安装后被调用

transformIndexHtml： 转换 index.html 的专用钩子

handleHotUpdate：执行自定义 HMR 更新处理

```javascript
export default myPlugin = () => {
  let config

  return {
    name: 'my-plugin',
    // 指定插件场景，默认在部署和构建模式中都会调用
    apply: 'serve',
    // 指定插件顺序，pre： 在vite核心插件之前，post： 构建用插件之后
    enforce: 'post',

    config(userConfig) {
      console.log('config', userConfig)
    },

    configResolved(resolvedConfig) {
      // 存储最终解析的配置
      config = resolvedConfig

      console.log('configResolved', config)
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 自定义请求处理...
        console.log('configureServer', req.url)
        next()
      })
    },

    transformIndexHtml(html) {
      console.log('transformIndexHtml', html)
    },

    handleHotUpdate({ server }) {
      console.log('handleHotUpdate')
    }
  }
}
```