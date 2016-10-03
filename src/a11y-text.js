import { merge } from './utils/merge.js';
import { FontAnalyzer } from './font-analyzer.js';
import { LineHeight } from './line-height.js';
import { TextTagger } from './text-tagger.js';

export class A11yText {
    get defaultOptions() {
        return {
            autoLineHeight: true,
            defaultFontSize: 14,
            tagger: {
                modes: ['sentence', 'speaking'],
                useClasses: true,
            },
            gestures: true,
            activeGesture: 'a11y-text--active',
            activeWord: 'a11y-text-active-word',
            activeSentence: 'a11y-text-active-sentence',
            activeBlock: 'a11y-text-active-block',
        };
    }

    constructor(element, options = {}) {
        this.element = element;
        this.options = merge(this.defaultOptions, options);
        if (this.options.autoLineHeight) {
            this.lineHeight = this.calcLineHeight();
        }
        if (this.options.tagger) {
            this.tagger = new TextTagger(
                this.options.tagger
            );
            this.tagger.tag(
                this.element
            );
            if (this.options.gestures) {
                this.handleGestures();
            }
        }
    }

    handleGestures() {
        this.element.addEventListener('mousemove', (ev) => {
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
            if (this.activeWord || this.activeSentence) {
                this.over = true;
            } else {
                this.over = false;
            }
        });
    }

    get over() {
        return this.element.classList.contains(
            this.options.activeGesture
        );
    }

    set over(over) {
        let classList = this.element.classList;
        let overClass = this.options.activeGesture;
        if (over) {
            classList.add(overClass);
        } else {
            classList.remove(overClass);
        }
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
        } else {
            this.activeSentence = null;
            this.activeBlock = null;
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
            let blockSelector = this.tagger.options.blockSelector;
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
        return parseFloat(
            this.computedStyle.getPropertyValue('line-height')
        );
    }

    set lineHeight(val) {
        this.setPropertyWithUnit('line-height', val);
    }

    get relativeLineHeight() {
        return this.lineHeight / this.fontSize;
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
}
