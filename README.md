# Musje 2.0.2-beta

![alt musje 123](https://github.com/malcomwu/musje/blob/master/dist/assets/musje123-64x64.jpg)
<br>
A numbered musical notation in sheet music.

## Background

Musje is sparrow in Dutch. The first numbered musical notation was
presented by Jean-Jacques Rousseau to the French Academy of
Sciences in 1742. It has been evolved and become popular in some
areas of Asia. It is called jianpu, literally simple music score, in Chinese.
The musje 123 is a music processor based on this notation.

## Getting started

https://github.com/malcomwu/musje/blob/master/demo.html

## Install

For npm module system:

```shell
npm install musje --save
```

## Usage

```html
<script src="path/to/musje.js"></script>
<script>
  var score = musje.parse(MusjeSrc)
  // The rest are same as below.
</script>
```

Or in ES6 module:

```js
import { parse } from 'musje'
const score = parse(MusjeSrc)
score.addStyle(sty1, sty2)
     .addStyle(sty3)
document.body.appendChild(score.render())
score.play()
score.stop()
```

## Notion of jianpu

In comparison of the western sheet music, jianpu is closely related.
The design of musje is made for the greatest interception for this.
The major difference is that the western one is graphical in pitch
(vertical positioning) while the jianpu is symbolic.
This is perhaps why many Chineses may like it because the ancient pitch scales
were written in symbols, the five 宮 商 角 徵 羽 pure intonation,
and the twelve-tone 黃鐘 姑洗 .. equal temparament, and later on the 宮尺.
One may think of to convert the 1, 2, .. 7 to C, D, .. B,
or else for your interest.
Due to the symbolic pitching, no clef is necessory.

It is the same that there is not a natural place to draw the key signature.
The rest are the same, so that we may see a lot of accidentals in most measures.
This is taken as a good consquence because it is aim for the beginners.
However, one can less easily recognize the key of this music.
Therefore, some place an A, Dm, .. symbol or so to be shown as a key signature,
but it does not alter anything.
However, it is sometimes confused with the idea of transpose.
This is normal for a transpose instrument and important for the solfège.
The idea is that C `1 2 3 4 5 6 7` and G `1 2 3 4 5 6 7` is a transpose,
in which the latter is the same as C `5 6 7 1' 2' 3' #4'`.
Some places a G transpose to be a direction above the `1`, i.e., `/G 1 2`..
The G means a transpose or `fifth: +1` in key signature?
In general, the users of jianpu take this as a key signature,
while the current iteration of musje still consider this as a transposition.
It will be considered in the later version of musje.

For the first class for a jianpu lesson, it start with the:
```
 1  2  3  4  5   6  7  1'
dol re mi fa sol la si dol
```
This is the most intuitive of jianpu over the western sheet music.
To advance in playing instruments, we learn:
```
1   #1  2  #2  3  4 #4  5  #5  6 #6  7  1'
dol di re  ri mi fa fi sol si la li ti dol
```
to sing. Why a jianpu user take the G in `/G 12` as a key rather than
a transpose can be imagined.

For the rest, it is still considered to be very much the same for musje
between jianpu and the western sheet music.

## Language description

- The grammar of musje 2.0. (https://github.com/malcomwu/musje/blob/master/grammar.md)
- The musje stylesheet. (https://github.com/malcomwu/musje/blob/master/stylesheet.md)

## Development
This project was initiated about year 2015; however, several attempts
has been missed or discontinued.
This version is musje 2 (codename: gezondheid).

```sh
npm run serve
```

and http://localhost:9000/.

## Technical notes
- Th language is derived from LilyPond, abc, pmx and the MusicTeX family.
- The data structure is adapted from the MusicXML 3.0.
- The idea of parsing is based on "Let's Build a Compiler - Jack Crenshaw".
- The flow of layout start from the ideas of the css box model and stylesheets.
- The rendering uses an `el.js` by-product, affected by
  "Eloquent JavaScript - Marijn Haverbeke".
  However, it can be easily reproduced by some other libraries or using canvas.
- It uses the musical font of Cadence, LilyPond, and takes some from MuseScore.
