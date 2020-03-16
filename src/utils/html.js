import { arrayToSet, makeToJSON, repeat, flatten } from './helpers'

const EVENT_TYPES = arrayToSet([
  /* mouse */ 'mousedown', 'mouseup', 'click', 'dblclick', 'mousemove',
              'mouseover', 'mousewheel', 'mouseout', 'contextmenu',
  /* touch */ 'touchstart', 'touchmove', 'touchend', 'touchcancel',
  /* keyboard */ 'keydown', 'keypress', 'keyup',
  /* form */ 'focus', 'blur', 'change', 'submit',
  /* window */ 'scroll', 'resize', 'hashchange', 'load', 'unload'
])
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const SVG_ELEMENT_NAMES = arrayToSet([
  'a', 'animate', 'animateMotion', 'animateTransform',
  'circle', 'clipPath', 'color-profile',
  'defs', 'desc', 'discard',
  'ellipse',
  'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight','feDropShadow', 'feFlood',
  'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
  'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology',
  'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight',
  'feTile', 'feTurbulence', 'filter', 'foreignObject',
  'g',
  'hatch', 'hatchpath',
  'image',
  'line', 'linearGradient',
  'marker', 'mask', 'mesh', 'meshgradient', 'meshpatch', 'meshrow',
  'metadata', 'mpath',
  'path', 'pattern', 'polygon', 'polyline',
  'radialGradient', 'rect',
  'script', 'set', 'solidcolor', 'stop', 'style', 'svg', 'switch', 'symbol',
  'text', 'textPath', 'title', 'tspan',
  'unknown', 'use',
  'view'
])

export class Element {
  constructor(element, level = 0, indent = 2) {
    this.name = 'element'
    this.level = level
    this.indent = indent

    this.elName = element.elName
    this.attrs = new Attrs(element.attrs)
    this.content = []
    element.content.forEach(child => {
      if (typeof child === 'undefined') {
        child = 'undefined'
      } else if (child === null) {
        child = 'null'
      } else if (child.name === 'element') {
        this.content.push(new Element(child, level + 1, indent))
      } else {
        this.content.push(child)
      }
    })
  }

  eachChild(cb) { this.content.forEach(cb) }
  eachAttr(cb) { this.attrs.each(cb) }

  create() {
    const { elName, content } = this
    const element = SVG_ELEMENT_NAMES[elName] ?
                    document.createElementNS(SVG_NAMESPACE, elName) :
                    document.createElement(elName)

    this.eachAttr((value, name) => {
      if (EVENT_TYPES[name]) {
        element.addEventListener(name, value)
      } else if (name === 'style') {
        if (/\n/.test(value)) {
          value = value.trim().replace(/ *\n */g, ';')
        }
        element.setAttribute(name, value)
      } else {
        element.setAttribute(name, value)
      }
    })

    this.eachChild(child => {
      if (child instanceof Element) {
        element.appendChild(child.create())
      } else if (typeof child === 'object') {
        element.appendChild(child)   // DOM Element
      } else if (typeof child === 'function') {
        child(element)
      } else {
        element.textContent = child
      }
    })
    return element
  }

  toString() {
    const { level, indent, elName, attrs, content } = this
    const strs = []
    if (level > 0) strs.push('\n' + repeat(' ', level * indent))
    strs.push(`<${elName}`)
    if (attrs.hasAttr) strs.push(' ' + attrs)
    if (content.length === 0) {
      strs.push('/>')
    } else if (content[0].name !== 'element') {
      strs.push(`>${content}</${elName}>`)
    } else {
      strs.push('>', content.join(''))
      strs.push('\n', repeat(' ', level * indent), `</${elName}>`)
    }
    return strs.join('')
  }

  toJSON = makeToJSON('elName', 'attrs', 'content')
}

export class Attrs {
  constructor(attrs = {}) {
    this.name = 'attrs'
    this.value = attrs
  }

  get hasAttr() { return Object.keys(this.value).length > 0 }

  each(cb) {
    const { value } = this
    Object.keys(value).forEach((name, i) => cb(value[name], name, i))
  }

  toString() {
    const strs = []
    for (let name in this.value) strs.push(`${name}="${this.value[name]}"`)
    return strs.join(' ')
  }

  toJSON = makeToJSON('value')
}

export const el = (elName, attrs = {}, content = []) => {
  if (!Array.isArray(content)) content = [content]
  if (typeof attrs !== 'object') attrs = [attrs]
  if (Array.isArray(attrs)) { content = attrs; attrs = {} }
  content = flatten(content)
  return { name: 'element', elName, attrs, content }
}

el.create = (elName, attrs, content) => {
  return new Element(el(elName, attrs, content)).create()
}

const cacheElements = []
let _id = 0
const getId = () => _id++
el.makeUpdate = (pel, selector) => {
  if (selector) pel = pel.querySelector(selector)
  const id = getId()
  return cel => {
    if (cacheElements[id]) pel.removeChild(cacheElements[id])
    cacheElements[id] = cel
    pel.appendChild(cel)
  }
}

class Data {
  constructor(data) {
    Object.assign(this, data)
    this.cacheElements = {}
    this.depGetters = {}
    this.makeConnectors()
  }

  makeConnectors() {
    Object.keys(this).forEach(name => {
      if (name === 'cacheElements' || name === 'depGetters') return
      if (this.hasOwnProperty(name)) {
        this.cacheElements[name] = []
        this[`$${name}`] = this.makeConnector(name)
        this.makeAccessor(name)
      }
    })
  }

  makeConnector(name) {
    const that = this
    return element => {
      that.cacheElements[name].push(element)
      that[name] = that[name]   // duplicate calls
    }
  }

  runSetter(name, value) {
    this.cacheElements[name].forEach(element => {
      element.textContent = value
    })
    if (this.depGetters[name]) {
      this.depGetters[name].forEach(depName => {
        this[depName] = this[depName]
      })
    }
  }

  makeAccessor(name) {
    const _name = `_${name}`
    const defaultVal = this[name]

    let { dep, get } = defaultVal
    if (dep && get) {
      if (!Array.isArray(dep)) dep = [dep]
      Object.defineProperty(this, name, {
        get, set() { this.runSetter(name, this[name]) }
      })
      dep.forEach(depName => {
        this.depGetters[depName] = this.depGetters[depName] || []
        this.depGetters[depName].push(name)
      })
      return
    }

    Object.defineProperty(this, name, {
      get() { return this[_name] },
      set(value) {
        this[_name] = value
        this.runSetter(name, value)
      }
    })
    this[name] = defaultVal
  }
}
el.setData = data => new Data(data)


let txt
const cache = {}
const prepareText = () => {
  if (txt) return
  txt = new Element(el('text', { x: 0, y: 50 }, '')).create()
  const svg = new Element(el('svg', { width: 0, height: 0 }, [txt])).create()
  document.body.appendChild(svg)
}
export const getSize = (font, content) => {
  const key = font + content
  if (cache[key]) return cache[key]
  prepareText()
  const style = `font-family: ${font.family}; font-size: ${font.size}`
  txt.setAttribute('style', style)
  txt.textContent = content
  const { width, height } = txt.getBBox()
  const result = { width, height }
  cache[key] = result
  return result
}

export const loadText = (url, onsuccess) => {
  const xhr = new XMLHttpRequest()
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) onsuccess(xhr.responseText)
    }
  }
  xhr.open('GET', url, true)
  xhr.send(null)
}
