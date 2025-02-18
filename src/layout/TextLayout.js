import AbstractLayout from './AbstractLayout'
import { getSize } from '../utils/helpers'

export default class TextLayout extends AbstractLayout {
  constructor(text, fontStyle) {
    super()
    this.name = 'text-layout'
    this.text = text
    Object.assign(this, fontStyle)
    this.width = getSize(fontStyle, text).width
  }
}
