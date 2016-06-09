import { CharAnalyzer } from './char-analyzer.js';

/**
 * Merge two object using the first as matrix.
 * @private
 *
 * @param {Object} defaults The starter object.
 * @param {Object} obj The object to merge.
 * @return {Object} A new object with merged values.
 */
function merge(defaults, obj) {
    let res = {};
    for (let k in defaults) {
        if (typeof obj[k] === 'undefined') {
            res[k] = defaults[k];
        } else {
            res[k] = obj[k];
        }
    }
    return res;
}
/**
 * Transform a token into a tagged element.
 * @private
 *
 * @param {Object} defaults The starter object.
 * @param {Object} obj The object to merge.
 * @return {Object} A new object with merged values.
 */
function transform(content, index, options) {
    // eslint-disable-next-line
    return `<${options.tokenTag}${options.setId ? ` data-token-id="${index}"` : ''}${options.useClasses ? ` class="${options.tokenClass}"` : ''}>${content}</${options.tokenTag}>`;
}
/**
 * Tag a XML node content.
 * @private
 *
 * @param {Node} node The node to tag.
 * @param {Object} options A set of TextTagger options.
 * @param {Object} counter The tag counter for token id generation.
 * @return {String} The tagged text.
 */
function chunkNode(node, options = {}, counter) {
    let html = '';
    let tokenClass = options.tokenClass;
    let puntuactionClass = options.puntuactionClass;
    let whiteSpaceClass = options.whiteSpaceClass;
    let chunks = node.textContent.split(/\s+/);
    let mode = options.mode;
    chunks.forEach((v, i) => {
        if (v === '' && i === 0) {
            return;
        }
        if (i !== 0) {
            html += transform(
                ' ',
                counter,
                merge(options, {
                    tokenClass: `${tokenClass} ${whiteSpaceClass}`,
                })
            );
            counter.increase();
        }
        let word = '';
        if (mode === 'letter') {
            for (let z = 0; z < v.length; z++) {
                let char = v[z];
                let nextChar = v[z + 1];
                let isPunctuation = CharAnalyzer.isPunctuation(char);
                let charClass = tokenClass;
                if (isPunctuation) {
                    charClass += ` ${puntuactionClass}`;
                    if (CharAnalyzer.isStopPuntuaction(char)) {
                        charClass += ` ${options.sentenceStopClass}`;
                    }
                }
                if (nextChar && CharAnalyzer.isDiacritic(nextChar)) {
                    char += nextChar;
                    z++;
                }
                word += transform(
                    char,
                    counter,
                    merge(options, { tokenClass: charClass })
                );
                counter.increase();
            }
        } else if (v) {
            word += transform(
                v,
                counter,
                options
            );
            counter.increase();
        }
        html += word;
    });
    return html;
}

class Counter {
    constructor(start = 0) {
        this.c = start;
    }
    increase() {
        this.c++;
    }
    toString() {
        return this.c;
    }
}

export class TextTagger {
    static get DEFAULTS() {
        return {
            setId: true,
            useClasses: false,
            mode: 'letter',
            tokenTag: 't:span',
            tokenClass: 'tagger--token',
            puntuactionClass: 'tagger--token-puntuaction',
            sentenceStopClass: 'tagger--token-sentence-stop',
            whiteSpaceClass: 'tagger--token-whitespace',
            excludeClasses: 'tagger--disable',
        };
    }
    /**
     * A class for letter or words tagging in texts.
     * @class TextTagger
     *
     * @param {Object} options A set of options.
     * @property {Boolean} options.setId
     * Should set the data token id attribute to the token element.
     * @property {Boolean} options.useClasses
     * Should set the token class to the token element.
     * @property {String} options.mode The tag method ("letter" or "word").
     * @property {String} options.tokenTag The tag for the token element.
     * @property {String} options.tokenClass The class for the token element.
     * @property {String} options.puntuactionClass The class for the punctuation token element.
     * @property {String} options.sentenceStopClass
     * The class for the stop punctuation token element.
     * @property {String} options.whiteSpaceClass The class for the white space token element.
     * @property {String} options.excludeClasses The class to ignore on tagging.
     */
    constructor(options = {}) {
        this.options = merge(TextTagger.DEFAULTS, options);
        this.counter = new Counter();
    }
    /**
     * Tag the text.
     *
     * @param {String} text The text to tag.
     * @param {Object} options Optional extra options.
     * @return {String} The tagged text.
     */
    tag(text, options = {}) {
        options = merge(this.options, options);
        let n = document.createElement('div');
        n.innerHTML = text;
        let html = '';
        let excludeClasses = options.excludeClasses;
        let startElementFound = false;
        let lastElementsFound = [];
        Array.prototype.forEach.call(n.childNodes, (node) => {
            switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                startElementFound = true;
                lastElementsFound.forEach((lastNode) => {
                    html += chunkNode(lastNode, options, this.counter);
                });
                if (node.classList && node.classList.contains(excludeClasses)) {
                    html += node.outerHTML;
                } else {
                    let clone = node.cloneNode(true);
                    clone.innerHTML = this.tag(node.innerHTML, options);
                    html += clone.outerHTML;
                }
                break;
            case Node.COMMENT_NODE:
                break;
            case Node.TEXT_NODE:
            default:
                let isEmpty = node.textContent.replace(/\s/g, '').length === 0;
                // if new line char, ignore it
                if ((!startElementFound && isEmpty) ||
                    (node.textContent.match(/(\r\n|\n|\r)/m) &&
                    node.textContent.length === 1)) {
                    break;
                }
                if (isEmpty) {
                    lastElementsFound.push(node);
                    return;
                }
                lastElementsFound.forEach((lastNode) => {
                    html += chunkNode(lastNode, options, this.counter);
                });
                html += chunkNode(node, options, this.counter);
                break;
            }
        });
        return html;
    }
}
