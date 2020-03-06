import AbstractLayout from './AbstractLayout'
import PitchLayout from './PitchLayout'
import DurationLayout from './DurationLayout'

export default class NoteLayout extends AbstractLayout {
  constructor(note, style) {
    super()
    this.note = note
    this.style = style
    this.pitchLayout = new PitchLayout(note.pitch, style)
    this.durationLayout = new DurationLayout(note.duration, style)
    this.setSize()
  }

  setSize() {
    const { type, dots } = this.note.duration
    if (type < 4) {
      this.setTypeLt4Size()
    } else if (type === 4) {
      this.setType4Size(dots)
    } else {
      this.setTypeGt4Size(dots)
    }
  }

  setTypeLt4Size() {
    const { pitchLayout, durationLayout } = this
    const { pitchLineSep } = this.style.note
    this.width = pitchLayout.width + pitchLineSep + durationLayout.width
    this.height = pitchLayout.height
  }

  setType4Size(dots) {
    const { pitchDotSep } = this.style.note
    const { pitchLayout, durationLayout } = this
    this.width = pitchLayout.width +
                (dots ? durationLayout.width + pitchDotSep : 0)
    this.height = pitchLayout.height
  }

  setTypeGt4Size(dots) {
    const { pitchBeamSep } = this.style.note
    const { stepFont } = this.style
    const { pitchLayout, durationLayout } = this
    this.width = pitchLayout.width + (dots ?
                 durationLayout.width - stepFont.width : 0)
    this.height = pitchLayout.height + pitchBeamSep +
                  durationLayout.beamsLayout.height
  }

  set position(pos) {
    super.position = pos
    const { octave } = this.note.pitch
    const { type, dots } = this.note.duration
    const { dotLift } = this.style.durationGE4
    const { x, y, x2, y2 } = this
    const { stepLayout, octavesLayout } = this.pitchLayout
    this.pitchLayout.position = { x, y }

    // Tweak for dots height
    if (type > 4 && dots && octave < 0) {
      this.durationLayout.beamsLayout.height += octavesLayout.height +
                                                this.style.pitch.stepOctaveSep
      this.durationLayout.setSize()
    }

    this.durationLayout.position =
        type === 4 ? { x2, y2: stepLayout.y2 - dotLift } :
        type  >  4 ? { x: stepLayout.x, y2 } :
     /* type  <  4 */{ x2, cy: stepLayout.cy }

    // const { tie, beginSlurs, endSlurs } = this
    // if (tie || beginSlurs || endSlurs) {
    //   const { cx: x, y } = this.pitch.stepPosition
    //   if (tie) tie.position = { x, y }
    //   if (beginSlurs) beginSlurs.forEach(slur => { slur.position = { x, y } })
    //   if (endSlurs) endSlurs.forEach(slur => { slur.position = { x, y } })
    // }
  }

  toJSON() {
    const { pitchLayout, durationLayout } = this
    return { ...super.toJSON(), pitchLayout, durationLayout }
  }
}
