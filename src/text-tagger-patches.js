import { CharAnalyzer } from './char-analyzer.js';
import { NodeParents } from './utils/node-parents.js';
import { merge } from './utils/merge.js';

/**
 * Create tagger span wrapper.
 * @private
 *
 * @param {object} options A set of tagger options.
 * @return {HTMLElement} The tagger span wrapper.
 */
function createWrapper(options) {
    let el = document.createElement(options.tokenTag);
    if (options.useClasses) {
        el.setAttribute('class', options.tokenClass);
    }
    return el;
}

function wrapElement(node, wrapper) {
    let parent = node.parentNode;
    parent.insertBefore(wrapper, node);
    wrapper.appendChild(node);
}

function wrapElements(root, node1, node2, wrapper) {
    let parents1 = new NodeParents(root, node1);
    let parents2 = new NodeParents(root, node2);
    let parent = parents1.findCommon(parents2);
    if (parent) {
        let children = [];
        let node = node1;
        while (node) {
            let parents = new NodeParents(root, node);
            let before = parents.getLower(parent) || node;
            if (children.indexOf(before) === -1) {
                children.push(before);
            }
            if (node !== node2) {
                node = node.nextToken;
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

function isFunction(fn) {
    return typeof fn === 'function';
}

export class TextPatch {
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
}

export class SentenceTextPatch extends TextPatch {
    get type() {
        return 0;
    }
    exec(options) {
        if (this.start && this.end) {
            let charClass = options.tokenClass;
            if (options.tokenSentence) {
                if (isFunction(options.tokenSentence)) {
                    charClass += ` ${options.tokenSentence(this)}`;
                } else {
                    charClass += ` ${options.tokenSentence}`;
                }
            }
            let wrapper = createWrapper(
                merge(options, {
                    tokenClass: charClass,
                })
            );
            if (this.start !== this.end) {
                wrapElements(this.root, this.start, this.end, wrapper);
            } else {
                wrapElement(this.start, wrapper);
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
    exec(options) {
        if (this.start && this.end) {
            let charClass = options.tokenClass;
            if (options.tokenSpeaking) {
                if (isFunction(options.tokenSpeaking)) {
                    charClass += ` ${options.tokenSpeaking(this)}`;
                } else {
                    charClass += ` ${options.tokenSpeaking}`;
                }
            }
            let wrapper = createWrapper(
                merge(options, {
                    tokenClass: charClass,
                })
            );
            if (this.start !== this.end) {
                wrapElements(this.root, this.start, this.end, wrapper);
            } else {
                wrapElement(this.start, wrapper);
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
    exec(options) {
        if (this.start && this.end) {
            let charClass = options.tokenClass;
            if (options.tokenWord) {
                if (isFunction(options.tokenWord)) {
                    charClass += ` ${options.tokenWord(this)}`;
                } else {
                    charClass += ` ${options.tokenWord}`;
                }
            }
            let wrapper = createWrapper(
                merge(options, {
                    tokenClass: charClass,
                })
            );
            if (this.start !== this.end) {
                wrapElements(this.root, this.start, this.end, wrapper);
            } else {
                wrapElement(this.start, wrapper);
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
    exec(options) {
        if (this.start) {
            let char = this.start.textContent;
            let isPunctuation = CharAnalyzer.isPunctuation(char);
            let charClass = options.tokenClass;
            if (options.tokenLetter) {
                if (isFunction(options.tokenLetter)) {
                    charClass += ` ${options.tokenLetter(this)}`;
                } else {
                    charClass += ` ${options.tokenLetter}`;
                }
            }
            if (isPunctuation && options.punctuationClass) {
                if (isFunction(options.punctuationClass)) {
                    charClass += ` ${options.punctuationClass(this)}`;
                } else {
                    charClass += ` ${options.punctuationClass}`;
                }
            }
            if (isPunctuation &&
                options.sentenceStopClass && CharAnalyzer.isStopPunctuation(char)) {
                if (isFunction(options.sentenceStopClass)) {
                    charClass += ` ${options.sentenceStopClass(this)}`;
                } else {
                    charClass += ` ${options.sentenceStopClass}`;
                }
            }
            let wrapper = createWrapper(
                merge(options, {
                    tokenClass: charClass,
                })
            );
            this.wrapper = wrapper;
            wrapElement(this.start, wrapper);
            return true;
        }
        return false;
    }
}
