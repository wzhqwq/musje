import Lexer from './Lexer'
import { repeat, range, swapObject, makeToJSON } from '../utils/helpers'
import { Q } from './constants'

const STR_TO_TYPE = {
  '---': 1, '-': 2, '': 4, '_': 8, '=': 16, '=_': 32, '==': 64,
  '==_': 128, '===': 256, '===_': 512, '====': 1024
}
const TYPE_TO_STR = swapObject(STR_TO_TYPE)
const DOTS_MULTIPLIERS = [1, 1.5, 1.75]

export default class Duration {
  constructor(duration) {
    this.name = 'duration'
    if (duration.name === 'lexer') {
      this.parse(duration)
    } else if (typeof duration === 'string') {
      this.parse(new Lexer(duration))
    } else {
      this.type = duration.type || 4
      this.dots = duration.dots || 0
    }
    if (this.type > 4) this.initBeams()
  }

  initBeams() {
    this.numBeams = Math.log2(this.type) - 2
    this.beams = range(this.numBeams).map(() => ({ type: 'single' }))
  }

  parse(lexer) {
    lexer.optional('type', lexeme => { this.type = STR_TO_TYPE[lexeme] })
    lexer.optional('dots', lexeme => { this.dots = lexeme.length })
  }

  get quartersQ() {
    const mod = this.modification
    return Q * 4 / this.type * DOTS_MULTIPLIERS[this.dots] *
           (mod ? mod.normal / mod.actual : 1)
  }

  get quarters() { return this.quartersQ / Q }

  get onplay() { return this._onplay || (() => {}) }
  set onplay(newf) {
    const oldf = this.onplay
    this._onplay = () => { oldf(); newf() }
  }
  get onstop() { return this._onstop || (() => {}) }
  set onstop(newf) {
    const oldf = this.onstop
    this._onstop = () => { oldf(); newf() }
  }

  toString() { return `${TYPE_TO_STR[this.type]}${repeat('.', this.dots)}` }
  toJSON = makeToJSON('type', 'dots')
}
