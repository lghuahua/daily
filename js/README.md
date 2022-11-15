html转图片
----
一个简单的html转图片方法，仅用于开发环境

使用方式
```js
let dt = new DomToImg(document.getElementsByClassName('main')[0])
// 预览
dt.preview()
// 保存图片
dt.saveImg('test.png')
```

注意
> 生成图片时复制了所有样式，未处理背景图。输入框类型和图片也未处理，

