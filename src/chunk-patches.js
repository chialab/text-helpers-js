import { CharAnalyzer } from './char-analyzer.js';
import { NodeParents } from './utils/node-parents.js';

/**
 * Create tagger span wrapper.
 * @private
 *
 * @param {string} tag The wrapper tagName.
 * @param {string} [className] The optional className for the wrapper.
 * @return {HTMLElement} The tagger span wrapper.
 */
function createWrapper(tag, className) {
    let el = document.createElement(tag);
    if (className) {
        el.className = className;
    }
    return el;
}

function wrapElement(node, wrapper) {
    let parent = node.parentNode;
    parent.insertBefore(wrapper, node);
    wrapper.appendChild(node);
}

const includes = Array.prototype.includes || function(item) {
    return (this.indexOf(item) !== -1);
};

function wrapElements(root, node1, node2, wrapper) {
    let parents1 = new NodeParents(root, node1);
    let parents2 = new NodeParents(root, node2);
    let parent = parents1.findCommon(parents2);
    if (parent) {
        let children = [];
        let node = node1;
        let nextToken = node.nextToken;
        while (node) {
            let parents = new NodeParents(root, node);
            let before = parents.getLower(parent) || node;
            if (!includes.call(children, before)) {
                children.push(before);
            }
            if (node !== node2) {
                node = node.nextSibling || nextToken;
                if (node === nextToken) {
                    nextToken = node.nextToken;
                }
            } else {
                node = null;
            }
        }
        if (children[0]) {
            parent.insertBefore(wrapper, children[0]);
            children.forEach((child) => {
                wrapper.appendChild(child);
            });
        }
    }
}

export class TextPatch {
    static sort(patch1, patch2) {
        let start1 = patch1.start;
        let start2 = patch2.start;
        if (!start2) {
            return -1;
        }
        if (!start1) {
            return 1;
        }
        if (start1.indexToken > start2.indexToken) {
            return 1;
        } else if (start1.indexToken < start2.indexToken) {
            return -1;
        } else if (patch1.type > patch2.type) {
            return 1;
        } else if (patch1.type < patch2.type) {
            return -1;
        }
        return 0;
    }

    constructor(root, start, end) {
        this.root = root;
        this.setStart(start);
        this.setEnd(end);
    }

    setStart(start) {
        this.start = start;
    }

    setEnd(end) {
        this.end = end;
    }

    exec() {
        return false;
    }
}

export class SentenceTextPatch extends TextPatch {
    get type() {
        return 0;
    }

    exec({ tokenTag, tokenClass, tokenSentence, useClasses }) {
        if (this.start && this.end) {
            if (tokenSentence) {
                tokenClass += ` ${tokenSentence}`;
            }
            let wrapper = createWrapper(tokenTag, useClasses && tokenClass);
            if (this.start !== this.end) {
                wrapElements(this.root, this.start, this.end, wrapper);
            } else {
                wrapElement(this.start.__ancestor || this.start, wrapper);
            }
            this.wrapper = wrapper;
            return true;
        }
        return false;
    }
}

export class SpeakingTextPatch extends TextPatch {
    get type() {
        return 1;
    }

    exec({ tokenTag, tokenClass, tokenSpeaking, useClasses }) {
        if (this.start && this.end) {
            if (tokenSpeaking) {
                tokenClass += ` ${tokenSpeaking}`;
            }
            let wrapper = createWrapper(tokenTag, useClasses && tokenClass);
            if (this.start !== this.end) {
                wrapElements(this.root, this.start, this.end, wrapper);
            } else {
                wrapElement(this.start.__ancestor || this.start, wrapper);
            }
            this.wrapper = wrapper;
            return true;
        }
        return false;
    }
}

export class WordTextPatch extends TextPatch {
    get type() {
        return 2;
    }

    exec({ tokenTag, tokenClass, tokenWord, useClasses }) {
        if (this.start && this.end) {
            if (tokenWord) {
                tokenClass += ` ${tokenWord}`;
            }
            let wrapper = createWrapper(tokenTag, useClasses && tokenClass);
            if (this.start !== this.end) {
                wrapElements(this.root, this.start, this.end, wrapper);
            } else {
                wrapElement(this.start.__ancestor || this.start, wrapper);
            }
            this.wrapper = wrapper;
            return true;
        }
        return false;
    }
}

export class LetterTextPatch extends TextPatch {
    get type() {
        return 3;
    }

    exec({ tokenTag, tokenClass, punctuationClass, sentenceStopClass, tokenLetter, useClasses }) {
        if (this.start) {
            let char = this.start.textContent;
            let isPunctuation = CharAnalyzer.isPunctuation(char);
            if (tokenLetter) {
                tokenClass += ` ${tokenLetter}`;
            }
            if (isPunctuation && punctuationClass) {
                tokenClass += ` ${punctuationClass}`;
            }
            if (isPunctuation &&
                sentenceStopClass && CharAnalyzer.isStopPunctuation(char)) {
                tokenClass += ` ${sentenceStopClass}`;
            }
            let wrapper = createWrapper(tokenTag, useClasses && tokenClass);
            this.wrapper = wrapper;
            wrapElement(this.start.__ancestor || this.start, wrapper);
            return true;
        }
        return false;
    }
}
