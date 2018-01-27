import { merge } from '@chialab/proteins';
import { CharAnalyzer } from './char-analyzer.js';
import {
    TextPatch,
    SentenceTextPatch,
    SpeakingTextPatch,
    WordTextPatch,
    LetterTextPatch,
} from './chunk-patches.js';
import { Counter } from './utils/counter.js';

/**
 * Check if a node is the last of a block ancestor.
 * @private
 *
 * @param {Node} node The node to check.
 * @param {Object} options Chunk options.
 * @return {Boolean}
 */
function isLastBlockNode(node, options = {}) {
    if (node.hasOwnProperty('__isLast')) {
        return node.__isLast;
    }
    node.__isLast = (function() {
        if (!node.nextToken) {
            return true;
        }
        let scope = node;
        let iterateNode = node;
        let isLast = true;
        while (iterateNode) {
            if (isLast &&
                iterateNode.nextSibling &&
                iterateNode.nextSibling.matches &&
                (iterateNode.nextSibling.matches(options.newLineSelector) ||
                iterateNode.nextSibling.matches(options.excludeSelector))) {
                return true;
            }
            if (iterateNode.nodeType === Node.ELEMENT_NODE &&
                iterateNode.matches(options.blockSelector)) {
                if (iterateNode.contains(scope.nextToken)) {
                    return false;
                }
                return true;
            }
            isLast = isLast && !iterateNode.nextSibling;
            iterateNode = iterateNode.parentNode;
        }
        return false;
    }());
    return node.__isLast;
}

/**
 * Check if a node contains whitespaces only.
 * @private
 *
 * @param {Node} node The node to check.
 * @return {Boolean}
 */
function isWhiteSpace(node) {
    if (node.hasOwnProperty('__isWhiteSpace')) {
        return node.__isWhiteSpace;
    }
    node.__isWhiteSpace = CharAnalyzer.isWhiteSpace(node.textContent);
    return node.__isWhiteSpace;
}

/**
 * Check if a node contains newline chars only.
 * @private
 *
 * @param {Node} node The node to check.
 * @return {Boolean}
 */
function isNewLine(node) {
    if (node.hasOwnProperty('__isNewLine')) {
        return node.__isNewLine;
    }
    node.__isNewLine = !node.textContent.match(/[^\n]/) && CharAnalyzer.isNewLine(node.textContent);
    return node.__isNewLine;
}

/**
 * Check if a node contains punctuation chars only.
 * @private
 *
 * @param {Node} node The node to check.
 * @return {Boolean}
 */
function isPunctuation(node) {
    if (node.hasOwnProperty('__isPunctuation')) {
        return node.__isPunctuation;
    }
    node.__isPunctuation = CharAnalyzer.isPunctuation(node.textContent);
    return node.__isPunctuation;
}

/**
 * Check if a node contains stop punctuation only.
 * @private
 *
 * @param {Node} node The node to check.
 * @return {Boolean}
 */
function isStopPunctuation(node) {
    if (node.hasOwnProperty('__isStopPunctuation')) {
        return node.__isStopPunctuation;
    }
    node.__isStopPunctuation = CharAnalyzer.isStopPunctuation(node.textContent);
    return node.__isStopPunctuation;
}

/**
 * Check if a node contains start punctuation only.
 * @private
 *
 * @param {Node} node The node to check.
 * @return {Boolean}
 */
function isStartPunctuation(node) {
    if (node.hasOwnProperty('__isStartPunctuation')) {
        return node.__isStartPunctuation;
    }
    node.__isStartPunctuation = CharAnalyzer.isStartPunctuation(node.textContent);
    return node.__isStartPunctuation;
}

/**
 * Check if a node contains valid letter only.
 * @private
 *
 * @param {Node} node The text node to check.
 * @return {boolean}
 */
function isLetter(node) {
    if (node.hasOwnProperty('__isLetter')) {
        return node.__isLetter;
    }
    node.__isLetter = !isWhiteSpace(node) &&
        !isPunctuation(node);
    return node.__isLetter;
}

const APOSTROPHE_REGEX = /[’|']/;

/**
 * Check if a node contains apostrophe only.
 * @private
 *
 * @param {Node} node The text node to check.
 * @return {boolean}
 */
function isApostrophe(node) {
    if (node.hasOwnProperty('__isApostrophe')) {
        return node.__isApostrophe;
    }
    node.__isApostrophe = node.textContent.match(APOSTROPHE_REGEX);
    return node.__isApostrophe;
}

/**
 * Convert HTML text to DocumentFragment.
 * @private
 *
 * @param {string} text An HTML string.
 * @return {DocumentFragment} A DocumentFragment wrapper.
 */
function textToFragment(text) {
    let body = document.createElement('div');
    body.innerHTML = text;
    let fragment = document.createDocumentFragment();
    while (body.childNodes.length) {
        fragment.appendChild(body.childNodes[0]);
    }
    return fragment;
}

/**
 * Get a recursive list of text nodes in a Node.
 * @private
 *
 * @param {HTMLElement|DocumentFragment} root The root of the query.
 * @param {Node} node The current node to parse.
 * @param {Object} options Chunk options.
 * @return {Array} A recursive list of text nodes.
 */
function findAllTextNodes(root, node, options = {}) {
    let textNodes = [];
    for (let i = 0, len = node.childNodes.length; i < len; i++) {
        let child = node.childNodes[i];
        if (child.nodeType === Node.TEXT_NODE) {
            if (!isNewLine(child)) {
                textNodes.push(child);
            }
        } else if (child.nodeType === Node.ELEMENT_NODE &&
            !child.matches(options.excludeSelector)) {
            textNodes.push(...findAllTextNodes(root, child, options));
        }
    }
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
 * Get a list of ancestors for a node.
 * @private
 *
 * @param {Node} node The node.
 * @return {Array<Node>}
 */
function getAncestors(node) {
    let res = [];
    while (node) {
        res.push(node);
        node = node.parentNode;
    }
    return res;
}

/**
 * Check if a chunk is wrappable.
 * @private
 *
 * @param {Node} first The first node of a chunk.
 * @param {Node} last The last node of a chunk.
 * @return {Boolean}
 */
function isNotWrappable(first, last) {
    let parents1 = getAncestors(first);
    let parents2 = getAncestors(last);
    while (parents2.length < parents1.length) {
        let el = parents1.shift();
        if (el.previousSibling) {
            return true;
        }
    }
    return false;
}

/**
 * Get a list of patches for the given node.
 * @private
 *
 * @param {HTMLElement|DocumentFragment} root The root of the query.
 * @param {Node} node The text node to analyze.
 * @param {Object} options Chunk options.
 * @return {Array} A list of TextPatch-es.
 */
function getPatches(root, node, options = {}) {
    let modes = options.modes;
    let textNodes = [];
    findAllTextNodes(root, node, options)
        .forEach((child) => {
            let children = replaceTextNode(child);
            textNodes.push(...children);
        });
    let last;
    textNodes.forEach((n, index) => {
        if (last) {
            last.nextToken = n;
            n.prevToken = last;
        }
        n.indexToken = index;
        last = n;
    });
    let patches = [];
    if (modes.indexOf('sentence') !== -1) {
        let desc = new SentenceTextPatch(node);
        for (let index = 0, len = textNodes.length; index < len; index++) {
            let child = textNodes[index];
            let nextIndex = index + 1;
            let next = textNodes[nextIndex];
            if (!desc.start && !isNewLine(child)) {
                desc.setStart(child);
            }
            if (desc.start &&
                (
                    !next ||
                    isStartPunctuation(next) ||
                    isLastBlockNode(child, options) ||
                    (isStopPunctuation(child) && !isPunctuation(next) && !isLetter(next)) ||
                    isNotWrappable(desc.start, next)
                )
            ) {
                if (!isLastBlockNode(child, options)) {
                    while (next && isStopPunctuation(next)) {
                        nextIndex++;
                        child = next;
                        next = textNodes[nextIndex];
                    }
                }
                index = nextIndex - 1;
                desc.setEnd(child);
                patches.push(desc);
                desc = new SentenceTextPatch(node);
            }
        }
    }
    if (modes.indexOf('speaking') !== -1) {
        let desc = new SpeakingTextPatch(node);
        textNodes.forEach((child, index) => {
            let next = textNodes[index + 1];
            if (!desc.start) {
                if (isLetter(child) || isStartPunctuation(child)) {
                    desc.setStart(child);
                } else if (isPunctuation(child)) {
                    patches.push(new LetterTextPatch(node, child));
                }
            }
            if (desc.start &&
                (
                    !next ||
                    isWhiteSpace(next) ||
                    isLastBlockNode(child, options) ||
                    isNotWrappable(desc.start, next)
                )
            ) {
                desc.setEnd(child);
                patches.push(desc);
                desc = new SpeakingTextPatch(node);
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
                (isApostrophe(child) ||
                    !next ||
                    (!isLetter(next) && !isApostrophe(next)) ||
                    isLastBlockNode(child, options)) ||
                    isNotWrappable(desc.start, next)) {
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
                if (isWhiteSpace(child)) {
                    patches.push(new LetterTextPatch(node, child));
                }
            });
        }
        if (modes.indexOf('punctuation') !== -1) {
            textNodes.forEach((child) => {
                if (isPunctuation(child)) {
                    patches.push(new LetterTextPatch(node, child));
                }
            });
        }
    }
    (options.extraPatches || []).forEach((patch) => {
        let res = patch(node, textNodes, options);
        if (Array.isArray(res)) {
            patches = patches.concat(res);
        }
    });
    return patches;
}

/**
 * Tag a XML node content.
 * @private
 *
 * @param {HTMLElement|DocumentFragment} root The root of the query.
 * @param {Node} node The node to tag.
 * @param {Object} options Chunk options.
 * @param {Counter} counter The chunks counter.
 * @return {string} The tagged XML content.
 */
function chunkNode(root, node, options = {}, counter = new Counter()) {
    let patches = getPatches(root, node, options).filter((patch) => patch.exec(options));
    if (options.setId) {
        patches.sort(TextPatch.sort).forEach((patch) => {
            let token = patch.wrapper;
            let id = options.id(patch, counter);
            if (id) {
                token.setAttribute(options.tokenIdAttr, id);
            }
            counter.increase();
        });
    }
    return node;
}

/**
 * Default chunk options.
 * @type {Object}
 * @private
 */
const DEFAULTS = {
    setId: true,
    useClasses: false,
    modes: ['letter'],
    tokenIdAttr: 'data-token-id',
    tokenTag: 't:span',
    tokenClass: 'tagger--token',
    tokenLetter: 'tagger--letter',
    tokenWord: 'tagger--word',
    tokenSpeaking: 'tagger--speaking',
    tokenSentence: 'tagger--sentence',
    punctuationClass: 'tagger--token-punctuation',
    sentenceStopClass: 'tagger--token-sentence-stop',
    whiteSpaceClass: 'tagger--token-whitespace',
    excludeSelector: [
        'head',
        'title',
        'meta',
        'script',
        'style',
        'img',
        'audio',
        'video',
        'object',
        'iframe',
        'svg',
        '.tagger--disable',
    ].join(', '),
    blockSelector: [
        'p',
        'li',
        'ul',
        'div',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'td',
        'th',
        'tr',
        'table',
        'img',
        'header',
        'article',
    ].join(', '),
    newLineSelector: 'br',
    id: (patch, index) => index,
    extraPatches: [],
};

/**
 * chunk the text.
 *
 * @param {Element|String} element The element to chunk or HTML content.
 * @param {Object} options A set of options.
 * @property {Boolean} options.setId Should set the data token id attribute to the token element.
 * @property {Boolean} options.useClasses Should set the token class to the token element.
 * @property {String} options.mode The chunk method ("letter" or "word").
 * @property {String} options.tokenTag The chunk for the token element.
 * @property {String} options.tokenClass The class for the token element.
 * @property {String} options.puntuactionClass The class for the punctuation token element.
 * @property {String} options.sentenceStopClass The class for the stop punctuation token element.
 * @property {String} options.whiteSpaceClass The class for the white space token element.
 * @property {String} options.excludeSelector A selector to ignore on chunking.
 * @return {HTMLElement|DocumentFragment} The chunked document.
 */
export default function chunk(element, options = {}) {
    if (typeof element === 'string') {
        element = textToFragment(element);
    }
    options = merge(DEFAULTS, options);
    return chunkNode(element, element, options);
}
