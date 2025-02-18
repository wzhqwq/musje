import Lexer from './Lexer'
import { makeToJSON } from '../utils/helpers'
import PlayStopHandleInterface from './PlayStopHandleInterface'

export default class Slur extends PlayStopHandleInterface {
  constructor(slur) {
    super()
    this.name = 'slur'
    if (slur.name === 'lexer') {
      this.parse(slur)
    } else if (typeof slur === 'string') {
      this.parse(new Lexer(slur))
    } else {
      this.value = slur.value
    }
  }

  parse(lexer) {
    lexer.token('paran', lexeme => { this.value = lexeme })
  }

  toString() { return this.value }

  toJSON = makeToJSON('value')
}
