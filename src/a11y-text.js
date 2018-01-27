import { merge, Symbolic } from '@chialab/proteins';
import { FontAnalyzer } from './font-analyzer.js';
import { LineHeight } from './line-height.js';
import chunk from './chunk.js';

let ids = 1;

const PRIVATE_SYM = Symbolic('private');

function isSameLine(pos1, pos2) {
    return (pos1.top + pos1.height * 0.5) <= pos2.bottom &&
        (pos2.top + pos2.height * 0.5) <= pos1.bottom;
}

export class A11yText {
    get defaultOptions() {
        return {
            autoLineHeight: true,
            defaultFontSize: 14,
            tagger: {
                modes: ['sentence', 'speaking'],
                useClasses: true,
            },
            focusMode: false,
            highlightWord: true,
            highlightNextWord: true,
            highlightSentence: false,
            highlightLine: true,
            highlightNextSentence: false,
            blockClass: 'a11y-block',
            activeFocusMode: 'a11y-text--active',
            activeWord: 'a11y-text-active-word',
            nextActiveWord: 'a11y-text-next-active-word',
            nextActiveSentence: 'a11y-text-next-active-sentence',
            activeLine: 'a11y-text-active-line',
            activeSentence: 'a11y-text-active-sentence',
            activeBlock: 'a11y-text-active-block',
        };
    }

    constructor(element, options = {}) {
        this[PRIVATE_SYM] = {};
        this.id = `a11y-text-${ids++}`;
        this.options = merge(this.defaultOptions, options);
        this.element = element;
        this.element.setAttribute('data-a11y-id', this.id);
        this.style = document.createElement('style');
        this.style.type = 'text/css';
        this.element.appendChild(this.style);
        if (this.options.autoLineHeight) {
            this.lineHeight = this.calcLineHeight();
            this.paragraphSpacing = this.lineHeightToParagraphSpacing(this.lineHeight);
        }
        if (this.options.tagger) {
            chunk(this.element, this.options.tagger);
            this.tokens = Array.prototype.slice.call(this.element.querySelectorAll(
                `.${this.tagger.options.tokenSpeaking}, .${this.tagger.options.punctuationClass}`
            ), 0);
            this.speakingTokens = Array.prototype.slice.call(this.element.querySelectorAll(
                `.${this.tagger.options.tokenSpeaking}`
            ), 0);
            this.sentences = Array.prototype.slice.call(this.element.querySelectorAll(
                `.${this.tagger.options.tokenSentence}`
            ), 0);
            let blocks = Array.prototype.slice.call(this.element.querySelectorAll(
                this.tagger.options.blockSelector
            ), 0);
            if (blocks) {
                let blockClass = this.options.blockClass;
                blocks.forEach((block) => {
                    block.classList.add(blockClass);
                });
            }
            if (this.options.focusMode) {
                this.enableFocusMode();
            }
        }
    }

    updateStyle() {
        this.style.textContent = `
            [data-a11y-id="${this.id}"] .${this.options.blockClass} {
                line-height: ${this.lineHeight}em;
                margin-bottom: ${this.paragraphSpacing}em;
            }
        `;
    }

    disableFocusMode() {
        this.element.classList.remove(this.options.activeFocusMode);
        this.activeWord = null;
        this.activeSentence = null;
        this.activeBlock = null;
        if (this[PRIVATE_SYM].gestureFn) {
            this.element.removeEventListener('mousemove', this[PRIVATE_SYM].gestureFn);
            this.element.removeEventListener('touchmove', this[PRIVATE_SYM].gestureFn);
            delete this[PRIVATE_SYM].gestureFn;
        }
    }

    enableFocusMode() {
        this.element.classList.add(this.options.activeFocusMode);
        this[PRIVATE_SYM].gestureFn = (ev) => {
            let isTouch = !!ev.changedTouches;
            if (!ev.cancelable || (isTouch && ev.changedTouches.length > 1)) {
                return true;
            }
            let tokenSpeaking = this.tagger.options.tokenSpeaking;
            let x = (isTouch ? ev.changedTouches[0].clientX : ev.clientX);
            let y = (isTouch ? ev.changedTouches[0].clientY : ev.clientY);
            if (isTouch) {
                y -= 40 + this.lineHeight * 0.66;
            } else {
                x += 16;
                y -= this.lineHeight;
            }
            let element = document.elementFromPoint(x, y);
            this.activeWord = element.matches(`.${tokenSpeaking}`) ?
                element :
                element.closest(`.${tokenSpeaking}`);
            if (!this.activeWord) {
                let tokenSentence = this.tagger.options.tokenSentence;
                this.activeSentence = element.matches(`.${tokenSentence}`) ?
                    element :
                    element.closest(`.${tokenSentence}`);
            }
            if (this.activeWord || this.activeSentence) {
                ev.preventDefault();
            }
            return true;
        };
        this.element.addEventListener('mousemove', this[PRIVATE_SYM].gestureFn);
        this.element.addEventListener('touchmove', this[PRIVATE_SYM].gestureFn);
    }

    get focusMode() {
        return !!this[PRIVATE_SYM].gestureFn;
    }

    get activeWord() {
        return this[PRIVATE_SYM].activeWord;
    }

    set activeWord(elem) {
        let old = this.activeWord;
        if (old) {
            old.classList.remove(this.options.activeWord);
        }
        this[PRIVATE_SYM].activeWord = elem;
        if (elem) {
            if (this.options.highlightWord) {
                elem.classList.add(this.options.activeWord);
            }
            let tokenSentence = this.tagger.options.tokenSentence;
            let sentence = elem.closest(`.${tokenSentence}`);
            if (sentence) {
                this.activeSentence = sentence;
            }
            if (this.options.highlightLine) {
                this.setActiveLine();
            }
        }
    }

    setActiveLine() {
        let elem = this.activeWord;
        if (elem) {
            let line = [];
            let elemPos = elem.getBoundingClientRect();
            let io = this.tokens.indexOf(elem);
            if (io > 0) {
                let prevIo = io;
                let prev = this.tokens[prevIo - 1];
                let prevPos = prev && prev.getBoundingClientRect();
                while (prevIo >= 0 && prevPos && isSameLine(elemPos, prevPos)) {
                    prevIo--;
                    line.push(prev);
                    prev = this.tokens[prevIo - 1];
                    prevPos = prev && prev.getBoundingClientRect();
                }
            }
            line.reverse();
            line.push(elem);
            let tokensLength = this.tokens.length;
            if (io < tokensLength) {
                let nextIo = io;
                let next = this.tokens[io + 1];
                let nextPos = next && next.getBoundingClientRect();
                while (nextIo < tokensLength && nextPos && isSameLine(elemPos, nextPos)) {
                    nextIo++;
                    line.push(next);
                    next = this.tokens[nextIo + 1];
                    nextPos = next && next.getBoundingClientRect();
                }
            }
            this.activeLine = line;
        } else {
            this.activeLine = null;
        }
    }

    get nextActiveWord() {
        return this[PRIVATE_SYM].nextActiveWord;
    }

    set nextActiveWord(elem) {
        let old = this.nextActiveWord;
        if (old) {
            old.classList.remove(this.options.nextActiveWord);
        }
        this[PRIVATE_SYM].nextActiveWord = elem;
        if (elem) {
            if (this.options.highlightNextWord) {
                elem.classList.add(this.options.nextActiveWord);
            }
        }
    }

    get activeLine() {
        return this[PRIVATE_SYM].activeLine;
    }

    set activeLine(elems) {
        let olds = this.activeLine;
        let cl = this.options.activeLine;
        if (olds) {
            olds.forEach((old) => {
                old.classList.remove(cl);
            });
        }
        this[PRIVATE_SYM].activeLine = elems;
        if (elems) {
            elems.forEach((elem) => {
                elem.classList.add(cl);
            });
        }
    }

    get activeSentence() {
        return this[PRIVATE_SYM].activeSentence;
    }

    set activeSentence(elem) {
        let old = this.activeSentence;
        if (old) {
            old.classList.remove(this.options.activeSentence);
        }
        this[PRIVATE_SYM].activeSentence = elem;
        if (elem) {
            if (this.options.highlightSentence) {
                elem.classList.add(this.options.activeSentence);
                let blockSelector = `.${this.options.blockClass}`;
                let block = elem.closest(blockSelector);
                if (block) {
                    this.activeBlock = block;
                }
            }
            this.setNextSentence();
        }
    }

    setNextSentence() {
        let elem = this.activeWord;
        let line = this.activeLine;
        if (elem && line) {
            let lineIo = line.indexOf(elem);
            if ((line.length - lineIo) < 4) {
                let speakingClass = this.tagger.options.tokenSpeaking;
                let siblingsLine = line.filter((sibling) =>
                    sibling.classList.contains(speakingClass)
                );
                let io = this.speakingTokens.indexOf(siblingsLine.pop());
                let nextWord = this.speakingTokens[io + 1];
                if (nextWord) {
                    this.nextActiveWord = nextWord;
                    this.nextActiveSentence = nextWord.closest(
                        `.${this.tagger.options.tokenSentence}`
                    );
                    return true;
                }
            }
        }
        this.nextActiveWord = null;
        this.nextActiveSentence = null;
        return false;
    }

    get nextActiveSentence() {
        return this[PRIVATE_SYM].nextActiveSentence;
    }

    set nextActiveSentence(elem) {
        let old = this.nextActiveSentence;
        let cl = this.options.nextActiveSentence;
        if (old) {
            old.classList.remove(cl);
        }
        this[PRIVATE_SYM].nextActiveSentence = elem;
        if (elem) {
            if (this.options.highlightNextSentence) {
                elem.classList.add(cl);
            }
        }
    }

    get activeBlock() {
        return this[PRIVATE_SYM].activeBlock;
    }

    set activeBlock(elem) {
        let old = this.activeBlock;
        if (old) {
            old.classList.remove(this.options.activeBlock);
        }
        if (elem) {
            this[PRIVATE_SYM].activeBlock = elem;
            elem.classList.add(this.options.activeBlock);
        }
    }

    setProperty(prop, val) {
        this.element.style.setProperty(prop, val);
    }

    setPropertyWithUnit(prop, val, unit = 'em') {
        this.setProperty(prop, `${val}${unit}`);
    }

    get computedStyle() {
        return window.getComputedStyle(this.element);
    }

    get fontFamily() {
        return this[PRIVATE_SYM].fontFamily ||
            this.computedStyle
                .getPropertyValue('font-family');
    }

    set fontFamily(val) {
        this[PRIVATE_SYM].fontFamily = val;
        this.setProperty('font-family', val, '');
        if (this.options.autoLineHeight) {
            this.lineHeight = this.calcLineHeight();
        }
    }

    get fontSize() {
        return this[PRIVATE_SYM].fontSize || parseFloat(
            this.computedStyle
                .getPropertyValue('font-size')
                .replace('px', '')
        );
    }

    set fontSize(val) {
        this[PRIVATE_SYM].fontSize = val;
        if (this.options.autoLineHeight) {
            this.lineHeight = this.calcLineHeight(val);
            this.paragraphSpacing = this.lineHeightToParagraphSpacing(this.lineHeight);
        }
        this.setPropertyWithUnit('font-size', val, 'px');
    }

    get defaultLineHeight() {
        return this.calcLineHeight(this.defaultFontSize);
    }

    get lineHeight() {
        return this[PRIVATE_SYM].lineHeight || parseFloat(
            this.computedStyle.getPropertyValue('line-height')
        );
    }

    set lineHeight(val) {
        this[PRIVATE_SYM].lineHeight = val;
        this.updateStyle();
    }

    get paragraphSpacing() {
        return this[PRIVATE_SYM].paragraphSpacing ||
            this.lineHeightToParagraphSpacing(this.lineHeight);
    }

    set paragraphSpacing(val) {
        this[PRIVATE_SYM].paragraphSpacing = val;
        this.updateStyle();
    }

    get wordSpacing() {
        return this[PRIVATE_SYM].wordSpacing || parseFloat(
            this.computedStyle
                .getPropertyValue('word-spacing')
                .replace('px', '')
        );
    }

    set wordSpacing(val) {
        this[PRIVATE_SYM].wordSpacing = val;
        this.setPropertyWithUnit('word-spacing', val);
    }

    get letterSpacing() {
        return this[PRIVATE_SYM].letterSpacing || parseFloat(
            this.computedStyle
                .getPropertyValue('letter-spacing')
                .replace('normal', 0)
                .replace('px', '')
        );
    }

    set letterSpacing(val) {
        this[PRIVATE_SYM].letterSpacing = val;
        this.setPropertyWithUnit('letter-spacing', val);
    }

    calcLineHeight(size, name) {
        size = size || this.fontSize;
        name = name || this.fontFamily;
        return LineHeight.calcLineHeight(
            size,
            FontAnalyzer.getXHeight(name),
            FontAnalyzer.getAscHeight(name)
        ) / size;
    }

    decreaseLineHeight(val = 0.1) {
        this.lineHeight = this.lineHeight - val;
    }

    increaseLineHeight(val = 0.1) {
        this.lineHeight = this.lineHeight + val;
    }

    decreaseWordSpacing(val = 0.1) {
        this.wordSpacing = this.wordSpacing - val;
    }

    increaseWordSpacing(val = 0.1) {
        this.wordSpacing = this.wordSpacing + val;
    }

    decreaseLetterSpacing(val = 0.1) {
        this.letterSpacing = this.letterSpacing - val;
    }

    increaseLetterSpacing(val = 0.1) {
        this.letterSpacing = this.letterSpacing + val;
    }

    lineHeightToParagraphSpacing(val) {
        return (val - 1) * 1.66;
    }

    paragraphSpacingToLineHeight(val) {
        return val * 0.6 + 1;
    }
}
