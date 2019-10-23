// DOM FUNCTIONS
let proto, local = /localhost|127\.0\.0\.1/.test(window.location) ? "" : 'https://jleritte.github.io/roller/'

class DOM {
  constructor() {
    proto = Object.getPrototypeOf(this)
  }
  query(selector,context = document) {
    return copyProto({elements:context.querySelector(selector)})
  }
  // queryAll(selector,context = document) {
  //   return copyProto({elements:[...context.querySelectorAll(selector)]})
  // }
  add(content) {
    if(content){
      if(typeof content !== "object") {
        content = this.create(content)
      }
      this.elements.appendChild(content.elements)
      return this
    }
  }
  remove(content) {
    if(content) {
      this.elements.removeChild(content.elements)
      return this
    }
  }
  create(content) {
    let node = document.createElement('div')
    node.innerHTML = content
    return copyProto({elements: document.importNode(node.firstElementChild,true)})
  }
  css(url) {
    let link = document.createElement('link'),
      after = document.querySelector('title')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = local + url
    after.parentNode.insertBefore(link,after)
  }
  icon() {
    let link = document.createElement('link'),
      after = document.querySelector('title')
    link.rel = 'icon'
    link.type = 'image/x-icon'
    link.href = local + 'img/favicon.ico'
    after.parentNode.insertBefore(link,after)
  }
  set text(text) {
    this.elements.textContent = text
  }
  set click(handle) {
    this.elements.onclick = handle
  }
  set dblclick(handle) {
    this.elements.ondblclick = handle
  }
  set value(input) {
    this.elements.value = input
  }
  get value() {
    return this.elements.value
  }
  get focus() {
    this.elements.focus()
    return this
  }
}

function copyProto(newOb) {
  return Object.setPrototypeOf(newOb,proto)
}

let $$ = new DOM()
export default $$