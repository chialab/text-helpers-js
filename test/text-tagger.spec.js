import { TextTagger } from '../src/text-tagger.js';

const SIMPLE = 'The quick brown fox jumps over the lazy dog';
const XML = 'The <strong>quick</strong> brown <em>fox jumps</em> over the lazy dog';

/* globals describe, before, beforeEach, it, assert */
describe('Unit: TextTagger', () => {
    let box = document.createElement('div');
    describe('Unit: tag', () => {
        it('a simple text in letter mode', () => {
            let tagger = new TextTagger();
            let text = tagger.tag(SIMPLE);
            box.innerHTML = text;
            assert.equal(
                box.querySelectorAll('[data-token-id]').length,
                SIMPLE.length
            );
        });

        it('a simple text in word mode', () => {
            let tagger = new TextTagger({ mode: 'word' });
            let text = tagger.tag(SIMPLE);
            box.innerHTML = text;
            assert.equal(
                box.querySelectorAll('[data-token-id]').length,
                SIMPLE.split(' ').length * 2 - 1
            );
        });

        it('a xml text in letter mode', () => {
            let tagger = new TextTagger();
            let text = tagger.tag(XML);
            box.innerHTML = text;
            assert.equal(
                box.querySelectorAll('[data-token-id]').length,
                XML.replace(/<(?:.|\n)*?>/gm, '').length
            );
        });

        it('a xml text in word mode', () => {
            let tagger = new TextTagger({ mode: 'word' });
            let text = tagger.tag(XML);
            box.innerHTML = text;
            assert.equal(
                box.querySelectorAll('[data-token-id]').length,
                XML.replace(/<(?:.|\n)*?>/gm, '').split(' ').length * 2 - 1
            );
        });
    });
});
