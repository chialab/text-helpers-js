import { CharAnalyzer } from './char-analyzer.js';
import {
    TextPatch,
    SentenceTextPatch,
    WordTextPatch,
    LetterTextPatch,
} from './text-tagger-patches.js';
import { Counter } from './utils/counter.js';
import { merge } from './utils/merge.js';

/**
 * Convert HTML text to HTMLElement.
 * @private
 *
 * @param {string} text An HTML string.
 * @return {HTMLElement} The HTMLElement.
 */
function textToNode(text) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(text, 'text/html');
    return doc.querySelector('html');
}

/**
 * Get a recursive list of text nodes in a Node.
 * @private
 *
 * @param {HTMLElement} node The parent to parse.
 * @return {Array} A recursive list of text nodes.
 */
function findAllTextNodes(node, options = {}) {
    let textNodes = [];
    let clone = Array.prototype.slice.call(node.childNodes, 0);
    clone.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
            textNodes.push(child);
        } else if (child.nodeType === Node.ELEMENT_NODE &&
            !child.matches(options.excludeSelector)) {
            textNodes.push(...findAllTextNodes(child, options));
        }
    });
    return textNodes;
}

/**
 * Split a text node in single character chunks.
 * @private
 *
 * @param {Text} node The text node to split.
 * @return {Array} A list of chunks.
 */
function splitTextNode(node) {
    let text = node.textContent;
    let nodes = [];
    for (let z = 0; z < text.length; z++) {
        let char = text[z];
        let nextChar = text[z + 1];
        if (nextChar && CharAnalyzer.isDiacritic(nextChar)) {
            char += nextChar;
            z++;
        }
        let textNode = document.createTextNode(char);
        nodes.push(textNode);
    }
    return nodes;
}

/**
 * Replace a text node with its single character chunks.
 * @private
 *
 * @param {Text} node The text node to replace.
 * @return {Array} A list of chunks.
 */
function replaceTextNode(node) {
    let nodes = splitTextNode(node);
    let parent = node.parentNode;
    let ref;
    nodes.forEach((child, index) => {
        if (index === 0) {
            parent.replaceChild(child, node);
            ref = child.nextSibling;
        } else {
            if (ref) {
                parent.insertBefore(child, ref);
            } else {
                parent.appendChild(child);
            }
        }
    });
    return nodes;
}

/**
 * Check if a text node is a valid letter.
 * @private
 *
 * @param {Text} textNode The text node to check.
 * @return {boolean}
 */
function isLetter(textNode) {
    let text = textNode.textContent;
    return !CharAnalyzer.isWhiteSpace(text) &&
        !CharAnalyzer.isPunctuation(text);
}

function isParent(node, parent) {
    while (node) {
        if (node === parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

function isLastBlockNode(node, options = {}) {
    let scope = node;
    if (!node.nextToken) {
        return true;
    }
    while (node) {
        if (node.nextSibling &&
            node.nextSibling.matches &&
            node.nextSibling.matches(options.newLineSelector)) {
            return true;
        }
        if (node.nodeType === Node.ELEMENT_NODE &&
            node.matches(options.blockSelector)) {
            if (isParent(scope.nextToken, node)) {
                return false;
            }
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

function isApostrophe(node) {
    return node.textContent.match(/[’|\']/);
}

/**
 * Get a list of patches for the given node.
 * @private
 *
 * @param {HTMLElement} node The text node to analyze.
 * @return {Array} A list of TextPatch-es.
 */
function getPatches(node, options = {}) {
    let modes = options.modes;
    let textNodes = [];
    findAllTextNodes(node, options)
        .forEach((child) => {
            let children = replaceTextNode(child);
            textNodes.push(...children);
        });
    let last;
    textNodes.forEach((n, index) => {
        if (last) {
            last.nextToken = n;
        }
        n.indexToken = index;
        last = n;
    });
    let patches = [];
    if (modes.indexOf('sentence') !== -1) {
        let desc = new SentenceTextPatch(node);
        textNodes.forEach((child) => {
            if (!desc.start && isLetter(child)) {
                desc.setStart(child);
            }
            if (desc.start &&
                (CharAnalyzer.isStopPunctuation(child.textContent) ||
                isLastBlockNode(child, options) ||
                !child.nextToken)) {
                desc.setEnd(child);
                patches.push(desc);
                desc = new SentenceTextPatch(node);
            }
        });
    }
    if (modes.indexOf('word') !== -1) {
        let desc = new WordTextPatch(node);
        textNodes.forEach((child, index) => {
            let isLet = isLetter(child);
            let next = textNodes[index + 1];
            if (!desc.start && isLet) {
                desc.setStart(child);
            }
            if (desc.start &&
                (isApostrophe(child) || !next || (!isLetter(next) && !isApostrophe(next)) || isLastBlockNode(child, options))) {
                desc.setEnd(child);
                patches.push(desc);
                desc = new WordTextPatch(node);
            }
        });
    }
    if (modes.indexOf('letter') !== -1) {
        textNodes.forEach((child) => {
            patches.push(new LetterTextPatch(node, child));
        });
    } else {
        if (modes.indexOf('space') !== -1) {
            textNodes.forEach((child) => {
                if (CharAnalyzer.isWhiteSpace(child.textContent)) {
                    patches.push(new LetterTextPatch(node, child));
                }
            });
        }
        if (modes.indexOf('puntuaction') !== -1) {
            textNodes.forEach((child) => {
                if (CharAnalyzer.isPunctuation(child.textContent)) {
                    patches.push(new LetterTextPatch(node, child));
                }
            });
        }
    }
    return patches;
}

/**
 * Tag a XML node content.
 * @private
 *
 * @param {HTMLElement} node The node to tag.
 * @return {string} The tagged XML content.
 */
function chunkNode(node, options = {}) {
    let counter = this.counter;
    let patches = getPatches(node, options).filter((patch) => patch.exec(options));
    if (options.setId) {
        patches.sort(TextPatch.sort).forEach((patch) => {
            let token = patch.wrapper;
            token.setAttribute(options.tokenIdAttr, options.id(counter));
            counter.increase();
        });
    }
    return node;
}

export class TextTagger {
    static get DEFAULTS() {
        return {
            setId: true,
            useClasses: false,
            modes: ['letter'],
            tokenIdAttr: 'data-token-id',
            tokenTag: 't:span',
            tokenClass: 'tagger--token',
            tokenLetter: 'tagger--letter',
            tokenWord: 'tagger--word',
            tokenSentence: 'tagger--sentence',
            puntuactionClass: 'tagger--token-puntuaction',
            sentenceStopClass: 'tagger--token-sentence-stop',
            whiteSpaceClass: 'tagger--token-whitespace',
            excludeSelector: 'head, title, meta, script, style, iframe, svg, .tagger--disable',
            blockSelector: 'p, li, ul, div, h1, h2, h3, h4, h5, h6, td, th, tr, table',
            newLineSelector: 'br',
            id: (index) => index,
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
     * @property {String} options.excludeSelector A selector to ignore on tagging.
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
    tag(text, options = {}, getBody) {
        getBody = typeof getBody !== 'undefined' ?
            getBody :
            text.match(/<body[^>]*>/);
        options = merge(this.options, options);
        let n = textToNode(text);
        n = chunkNode.call(this, n, options);
        let html = '';
        let body = n;
        if (getBody) {
            let h = n.querySelector('head');
            let b = n.querySelector('body');
            if (h) {
                html += h.innerHTML;
            }
            if (b) {
                body = b;
            }
            html += body.innerHTML;
        } else {
            html = body.outerHTML;
        }
        return html;
    }
}

if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            let matches = (this.document || this.ownerDocument).querySelectorAll(s);
            let i = matches.length;
            // eslint-disable-next-line
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
}
