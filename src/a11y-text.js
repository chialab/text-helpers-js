import { merge } from './utils/merge.js';
import { FontAnalyzer } from './font-analyzer.js';
import { LineHeight } from './line-height.js';
import { TextTagger } from './text-tagger.js';

let ids = 1;

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
            blockClass: 'a11y-block',
            activeFocusMode: 'a11y-text--active',
            activeWord: 'a11y-text-active-word',
            activeSentence: 'a11y-text-active-sentence',
            activeBlock: 'a11y-text-active-block',
        };
    }

    constructor(element, options = {}) {
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
            this.tagger = new TextTagger(
                this.options.tagger
            );
            this.tagger.tag(
                this.element
            );
            let blocks = this.element.querySelectorAll(
                this.tagger.options.blockSelector
            );
            if (blocks) {
                let blockClass = this.options.blockClass;
                Array.prototype.forEach.call(blocks, (block) => {
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
        if (this._onGestures) {
            this.element.removeEventListener('mousemove', this._onGestures);
            delete this._onGestures;
        }
    }

    enableFocusMode() {
        this.element.classList.add(this.options.activeFocusMode);
        this._onGestures = (ev) => {
            let tokenSpeaking = this.tagger.options.tokenSpeaking;
            let x = ev.clientX;
            let y = ev.clientY;
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
        };
        this.element.addEventListener('mousemove', this._onGestures);
    }

    get focusMode() {
        return !!this._onGestures;
    }

    get activeWord() {
        return this.element.querySelector(`.${this.options.activeWord}`);
    }

    set activeWord(elem) {
        let old = this.activeWord;
        if (old) {
            old.classList.remove(this.options.activeWord);
        }
        if (elem) {
            let tokenSentence = this.tagger.options.tokenSentence;
            elem.classList.add(this.options.activeWord);
            let sentence = elem.closest(`.${tokenSentence}`);
            if (sentence) {
                this.activeSentence = sentence;
            }
        }
    }

    get activeSentence() {
        return this.element.querySelector(`.${this.options.activeSentence}`);
    }

    set activeSentence(elem) {
        let old = this.activeSentence;
        if (old) {
            old.classList.remove(this.options.activeSentence);
        }
        if (elem) {
            elem.classList.add(this.options.activeSentence);
            let blockSelector = `.${this.options.blockClass}`;
            let block = elem.closest(blockSelector);
            if (block) {
                this.activeBlock = block;
            }
        }
    }

    get activeBlock() {
        return this.element.querySelector(`.${this.options.activeBlock}`);
    }

    set activeBlock(elem) {
        let old = this.activeBlock;
        if (old) {
            old.classList.remove(this.options.activeBlock);
        }
        if (elem) {
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
        this.computedStyle
            .getPropertyValue('font-family');
    }

    set fontFamily(val) {
        this.setProperty('font-family', val, '');
        if (this.options.autoLineHeight) {
            this.lineHeight = this.calcLineHeight();
        }
    }

    get fontSize() {
        return parseFloat(
            this.computedStyle
                .getPropertyValue('font-size')
                .replace('px', '')
        );
    }

    set fontSize(val) {
        this.setPropertyWithUnit('font-size', val, 'px');
    }

    get defaultLineHeight() {
        return this.calcLineHeight(this.defaultFontSize);
    }

    get lineHeight() {
        return this.__lineHeight || parseFloat(
            this.computedStyle.getPropertyValue('line-height')
        );
    }

    set lineHeight(val) {
        this.__lineHeight = val;
        this.updateStyle();
    }

    get paragraphSpacing() {
        return this.__paragraphSpacing || this.lineHeightToParagraphSpacing(this.lineHeight);
    }

    set paragraphSpacing(val) {
        this.__paragraphSpacing = val;
        this.updateStyle();
    }

    get wordSpacing() {
        return parseFloat(
            this.computedStyle.getPropertyValue('word-spacing')
        );
    }

    set wordSpacing(val) {
        this.setPropertyWithUnit('word-spacing', val);
    }

    get letterSpacing() {
        return parseFloat(
            this.computedStyle.getPropertyValue('letter-spacing')
                .replace('normal', 0)
        );
    }

    set letterSpacing(val) {
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
