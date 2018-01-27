/* eslint-env mocha */
import './polyfills.js';
import chunk from '../../src/chunk.js';

const SIMPLE = 'The quick brown fox jumps over the lazy dog. Really?';
const XML = 'The <strong>quick</strong> brown <em>fox jumps</em> over the lazy dog';

describe('Unit: chunk', () => {
    it('a simple text in letter mode', () => {
        let box = chunk(SIMPLE);
        assert.equal(
            box.querySelectorAll('[data-token-id]').length,
            SIMPLE.length
        );
    });

    it('a simple text in word mode', () => {
        let box = chunk(SIMPLE, { modes: ['word'] });
        assert.equal(
            box.querySelectorAll('[data-token-id]').length,
            SIMPLE.split(' ').length
        );
    });

    it('a simple text in word and spaces mode', () => {
        let box = chunk(SIMPLE, { modes: ['word', 'space'] });
        assert.equal(
            box.querySelectorAll('[data-token-id]').length,
            SIMPLE.split(' ').length * 2 - 1
        );
    });

    it('a simple text in sentences, word and spaces mode', () => {
        let box = chunk(SIMPLE, {
            modes: ['sentence', 'word', 'space'],
            useClasses: true,
        });
        assert.equal(
            box.querySelectorAll('[data-token-id]').length,
            SIMPLE.split(' ').length * 2 + 1
        );
    });

    it('a xml text in letter mode', () => {
        let box = chunk(XML);
        assert.equal(
            box.querySelectorAll('[data-token-id]').length,
            XML.replace(/<(?:.|\n)*?>/gm, '').length
        );
    });

    it('a xml text in word mode', () => {
        let box = chunk(XML, { modes: ['word'] });
        assert.equal(
            box.querySelectorAll('[data-token-id]').length,
            XML.replace(/<(?:.|\n)*?>/gm, '').split(' ').length
        );
    });

    it('a simple text in word and letter mode', () => {
        let box = chunk(SIMPLE, { useClasses: true, modes: ['word', 'letter'] });
        assert.equal(
            box.querySelectorAll('[data-token-id]').length,
            SIMPLE.split(' ').length +
            SIMPLE.length
        );
    });
});
