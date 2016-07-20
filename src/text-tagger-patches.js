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
            let before = parents.getLower(parent);
            if (before) {
                children.push(before);
            } else {
                children.push(node);
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
            return false;
        }
        if (!start1) {
            return true;
        }
        if (start1.indexToken > start2.indexToken) {
            return true;
        } else if (start1.type > start2.type) {
            return true;
        }
        return false;
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
                charClass += ` ${options.tokenSentence}`;
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
        return 1;
    }
    exec(options) {
        if (this.start && this.end) {
            let charClass = options.tokenClass;
            if (options.tokenWord) {
                charClass += ` ${options.tokenWord}`;
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
                charClass += ` ${options.tokenLetter}`;
            }
            if (isPunctuation && options.puntuactionClass) {
                charClass += ` ${options.puntuactionClass}`;
            }
            if (isPunctuation &&
                options.sentenceStopClass && CharAnalyzer.isStopPunctuation(char)) {
                charClass += ` ${options.sentenceStopClass}`;
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
