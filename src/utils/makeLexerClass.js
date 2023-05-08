import { repeat } from './helpers'

class Lines {
  constructor(str) {
    this.data = str.split('\n')
    this.ln = -1
    this.nextLine()
  }

  get eof() { return this.ln === this.data.length - 1 && this.line.eol }

  nextLine() {
    this.ln++
    this.line = new Line(this.data[this.ln])
  }
}

class Line {
  constructor(str) {
    this.str = str
    this.rest = str
    this.col = 0
  }

  get eol() { return this.rest.length === 0 }

  advance(num) {
    this.col += num
    this.rest = this.rest.substr(num)
  }
}

const defaultPatterns = {
  S: ' ',
  SS: ' +'
}

const getPatterns = patterns => {
  patterns = { ...defaultPatterns, ...patterns }
  const result = [{}, {}]
  for (let key in patterns) {
    result[0][key] = new RegExp(patterns[key])
    result[1][key] = new RegExp('^' + patterns[key])
  }
  return result
}

export default function makeLexerClass(patterns) {
  return class Lexer {
    constructor(src) {
      this.name = 'lexer'
      this.src = src.replace(/\r\n/g, '\n')
      this.lines = new Lines(this.src)
      const ptrns = getPatterns(patterns)
      this.withoutPatterns = ptrns[0]
      this.patterns = ptrns[1]
    }

    get line() { return this.lines.line }
    get ln() { return this.lines.ln }
    get col() { return this.line.col }
    get eol() { return this.line.eol }
    get eof() { return this.lines.eof }

    nextLine() { this.lines.nextLine() }

    getPattern(token) {
      if (token in this.patterns) return this.patterns[token]
      this.error(`Undefined token [${token}]`)
    }

    getWithoutPattern(token) {
      if (token in this.withoutPatterns) return this.withoutPatterns[token]
      this.error(`Undefined token [${token}]`)
    }

    eat(token) {
      const matched = this.line.rest.match(this.getPattern(token))
      if (!matched) this.error(`token [${token}]`)
      this.lexeme = matched[0]
      this.line.advance(this.lexeme.length)
    }

    is(token) {
      return this.getPattern(token).test(this.line.rest)
    }

    token(tkn, act) {
      this.eat(tkn)
      if (act) act(this.lexeme)
    }

    optional(token, act) {
      this.lexeme = ''
      if (this.is(token)) this.eat(token)
      if (act) act(this.lexeme)
    }

    without(token, act) {
      const matched = this.line.rest.match(this.getWithoutPattern(token))
      this.lexeme = matched ? this.line.rest.substr(0, matched.index) :
                              this.line.rest
      this.line.advance(this.lexeme.length)
      if (act) act(this.lexeme)
    }

    mlwithout(token, act) {
      const pattern = this.getWithoutPattern(token)
      const strs = []
      let matched = this.line.rest.match(pattern)

      while (!matched) {
        strs.push(this.line.rest)
        this.line.advance(this.line.rest.length)
        if (this.eof) break
        this.nextLine()
        matched = this.line.rest.match(pattern)
      }
      if (matched) {
        let without = this.line.rest.substr(0, matched.index)
        strs.push(without)
        this.line.advance(without.length)
      }
      this.lexeme = strs.join('\n')
      if (act) act(this.lexeme)
    }

    error(message) {
      throw new Error(`错误信息：${message}；在第${this.ln + 1}行 第${this.col + 1}列
${this.line.str}`)
    }

    skipSS() { this.optional('SS') }

    skipWhite() {
      while ((this.is('S') || this.eol) && !this.eof) {
        if (this.eol) {
          this.nextLine()
        } else {
          this.token('SS')
        }
      }
    }
  }
}
