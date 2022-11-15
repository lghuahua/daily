class DomToImg {
  constructor(dom) {
    this.dom = dom
    this.canvas = document.createElement('canvas')
    this.cloneDom = dom.cloneNode(true)   // for a <canvas> element, the painted image is not copied.
    this._canvasToImg()
    this.htmlSvg = this._createSvg()
  }

  // 将原始dom中的canvas转换成img
  _canvasToImg() {
    let canvas = this.dom.querySelectorAll('canvas')
    if (canvas.length < 1) return
    let newCanvas = this.cloneDom.querySelectorAll('canvas')

    newCanvas.forEach((c, i) => {
      let img = new Image()
      img.style.cssText = c.style.cssText
      img.src = canvas[i].toDataURL()

      c.parentNode.replaceChild(img, c)
    })
  }

  _createSvg() {
    const styles = this._getStyles()

    return `data:image/svg+xml;charset=utf-8,
      <svg xmlns="http://www.w3.org/2000/svg" width="${this.dom.offsetWidth}" height="${this.dom.offsetHeight}">
        <foreignObject x="0" y="0" width="100%" height="100%">
          <style>${styles}</style>
          ${new XMLSerializer().serializeToString(this.cloneDom)}
        </foreignObject>
      </svg>
    `.replace(/\n/g, '').replace(/\t/g, '').replace(/#/g, '%23')
  }

  // 获取全部style
  // 会复制多余样式，背景图会丢失
  _getStyles() {
    let styles = ''
    let styleSheets = document.styleSheets
    let length =  document.styleSheets.length
    for (let i=0; i < length; i++){
      let rules = styleSheets[i].rules
      for (let j=0; j < rules.length; j++){
        styles += rules[j].cssText
      }
    }
    return styles
  }

  _draw(img) {
    this.canvas.width = img.width
    this.canvas.height = img.height
    const context = this.canvas.getContext('2d')
    context.fill = '#fff'

    context.clearRect(0, 0, img.width, img.height)
    context.drawImage(img, 0, 0)
  }

  saveImg(fileName) {
    let img = new Image()
    img.onload = () => {
      this._draw(img)

      let link = document.createElement('a')
      link.href = this.canvas.toDataURL()

      link.download = fileName
      document.body.appendChild(link)
      link.click()
    }

    img.src = this.htmlSvg
  }

  preview() {
    let img = new Image()
    img.src = this.htmlSvg
    img.setAttribute('style', 'scale: 0.8')
    let mask = document.createElement('div')
    mask.setAttribute('style', 'overflow: scroll;text-align: center;padding: 20px;position: absolute;top: 0;bottom: 0;width: 100%;z-index: 10000;background: #00000080;')
    mask.appendChild(img)
    mask.addEventListener("click", () => { document.body.removeChild(mask) })
    document.body.appendChild(mask)
  }
}
