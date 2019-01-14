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

const MODES = {
    letter: 'letter',
    space: 'space',
    punctuation: 'punctuation',
    word: 'word',
    speaking: 'speaking',
    sentence: 'sentence',
};

const SYMBOLS = {
    isLast: '__isLast',
    isWhiteSpace: '__isWhiteSpace',
    isNewLine: '__isNewLine',
    isPunctuation: '__isPunctuation',
    isStopPunctuation: '__isStopPunctuation',
    isStartPunctuation: '__isStartPunctuation',
    isLetter: '__isLetter',
    isApostrophe: '__isApostrophe',
};

/**
 * Check if a mode is enabled.
 *
 * @param {Array<string>} list A list of active modes.
 * @param {...string} modes Modes to check.
 * @return {boolean}
 */
function useModes(list, ...modes) {
    for (let i = 0; i < modes.length; i++) {
        if (list.indexOf(modes[i]) !== -1) {
            return true;
        }
    }
    return false;
}

/**
 * Check if a node is the last of a block ancestor.
 * @private
 *
 * @param {Node} node The node to check.
 * @param {Object} options Chunk options.
 * @return {Boolean}
 */
function isLastBlockNode(node, options = {}) {
    if (SYMBOLS.isLast in node) {
        return node[SYMBOLS.isLast];
    }
    node[SYMBOLS.isLast] = (function() {
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
    return node[SYMBOLS.isLast];
}

/**
 * Check if a node contains whitespaces only.
 * @private
 *
 * @param {Node} node The node to check.
 * @return {Boolean}
 */
function isWhiteSpace(node) {
    if (SYMBOLS.isWhiteSpace in node) {
        return node[SYMBOLS.isWhiteSpace];
    }
    node[SYMBOLS.isWhiteSpace] = CharAnalyzer.isWhiteSpace(node.textContent);
    return node[SYMBOLS.isWhiteSpace];
}

/**
 * Check if a node contains newline chars only.
 * @private
 *
 * @param {Node} node The node to check.
 * @return {Boolean}
 */
function isNewLine(node) {
    if (SYMBOLS.isNewLine in node) {
        return node[SYMBOLS.isNewLine];
    }
    node[SYMBOLS.isNewLine] = !node.textContent.match(/[^\n]/) && CharAnalyzer.isNewLine(node.textContent);
    return node[SYMBOLS.isNewLine];
}

/**
 * Check if a node contains punctuation chars only.
 * @private
 *
 * @param {Node} node The node to check.
 * @return {Boolean}
 */
function isPunctuation(node) {
    if (SYMBOLS.isPunctuation in node) {
        return node[SYMBOLS.isPunctuation];
    }
    node[SYMBOLS.isPunctuation] = CharAnalyzer.isPunctuation(node.textContent);
    return node[SYMBOLS.isPunctuation];
}

/**
 * Check if a node contains stop punctuation only.
 * @private
 *
 * @param {Node} node The node to check.
 * @return {Boolean}
 */
function isStopPunctuation(node) {
    if (SYMBOLS.isStopPunctuation in node) {
        return node[SYMBOLS.isStopPunctuation];
    }
    node[SYMBOLS.isStopPunctuation] = CharAnalyzer.isStopPunctuation(node.textContent);
    return node[SYMBOLS.isStopPunctuation];
}

/**
 * Check if a node contains start punctuation only.
 * @private
 *
 * @param {Node} node The node to check.
 * @return {Boolean}
 */
function isStartPunctuation(node) {
    if (SYMBOLS.isStartPunctuation in node) {
        return node[SYMBOLS.isStartPunctuation];
    }
    node[SYMBOLS.isStartPunctuation] = CharAnalyzer.isStartPunctuation(node.textContent);
    return node[SYMBOLS.isStartPunctuation];
}

/**
 * Check if a node contains valid letter only.
 * @private
 *
 * @param {Node} node The text node to check.
 * @return {boolean}
 */
function isLetter(node) {
    if (SYMBOLS.isLetter in node) {
        return node[SYMBOLS.isLetter];
    }
    node[SYMBOLS.isLetter] = !isWhiteSpace(node) &&
        !isPunctuation(node);
    return node[SYMBOLS.isLetter];
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
    if (SYMBOLS.isApostrophe in node) {
        return node[SYMBOLS.isApostrophe];
    }
    node[SYMBOLS.isApostrophe] = node.textContent.match(APOSTROPHE_REGEX);
    return node[SYMBOLS.isApostrophe];
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
 * Split a text node in single token chunks.
 * @private
 *
 * @param {Text} node The text node to split.
 * @param {Object} options Chunk options.
 * @return {Array} A list of chunks.
 */
function splitTextNode(node, options) {
    let modes = options.modes;
    let text = node.textContent;
    let nodes = [];
    let token = '';
    for (let z = 0, len = text.length; z < len; z++) {
        let char = text[z];
        let nextChar = text[z + 1];
        if (nextChar && CharAnalyzer.isDiacritic(nextChar)) {
            char += nextChar;
            z++;
            nextChar = text[z + 1];
        }
        token += char;
        let split;
        if (z === len - 1) {
            split = true;
        } else if (useModes(modes, MODES.letter)) {
            split = true;
        } else if (
            (CharAnalyzer.isWhiteSpace(char) || CharAnalyzer.isWhiteSpace(nextChar)) &&
            useModes(modes, MODES.space, MODES.word, MODES.speaking)
        ) {
            split = true;
        } else if (
            (CharAnalyzer.isPunctuation(char) || CharAnalyzer.isPunctuation(nextChar)) &&
            useModes(modes, MODES.speaking, MODES.word, MODES.punctuation)
        ) {
            split = true;
        } else if (
            CharAnalyzer.isStopPunctuation(char) &&
            useModes(modes, MODES.sentence)
        ) {
            split = true;
        }
        if (split) {
            if (!node.previousSibling && !nodes.length) {
                token = token.replace(/^\s*/, '');
                if (!token) {
                    continue;
                }
            }
            if (!node.nextSibling && z === len - 1) {
                token = token.replace(/\s*$/, '');
                if (!token) {
                    continue;
                }
            }
            let textNode = document.createTextNode(token);
            nodes.push(textNode);
            token = '';
        }
    }
    return nodes;
}

/**
 * Replace a text node with its single character chunks.
 * @private
 *
 * @param {Text} node The text node to replace.
 * @param {Object} options Chunk options.
 * @return {Array} A list of chunks.
 */
function replaceTextNode(node, options) {
    let nodes = splitTextNode(node, options);
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
            let children = replaceTextNode(child, options);
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
    if (useModes(modes, MODES.sentence)) {
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
    if (useModes(modes, MODES.speaking)) {
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
                    isNotWrappable(desc.start, next) ||
                    (desc.start.parentNode !== next.parentNode && next.parentNode.childNodes.length !== 1)
                )
            ) {
                desc.setEnd(child);
                patches.push(desc);
                desc = new SpeakingTextPatch(node);
            }
        });
    }
    if (useModes(modes, MODES.word)) {
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
    if (useModes(modes, MODES.letter)) {
        textNodes.forEach((child) => {
            patches.push(new LetterTextPatch(node, child));
        });
    } else {
        if (useModes(modes, MODES.space)) {
            textNodes.forEach((child) => {
                if (isWhiteSpace(child)) {
                    patches.push(new LetterTextPatch(node, child));
                }
            });
        }
        if (useModes(modes, MODES.punctuation)) {
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
    modes: [MODES.letter],
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
