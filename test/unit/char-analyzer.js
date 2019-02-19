/* eslint-env mocha */
import './polyfills.js';
import { CharAnalyzer } from '../../src/char-analyzer.js';

describe('Unit: CharAnalyzer', () => {
    describe('Unit: isWhiteSpace', () => {
        it('check real white space', () => {
            assert.isTrue(CharAnalyzer.isWhiteSpace(' '));
            assert.isTrue(CharAnalyzer.isWhiteSpace('\n'));
            assert.isFalse(CharAnalyzer.isWhiteSpace(''));
        });
        it('check fake white space', () => {
            assert.isFalse(CharAnalyzer.isWhiteSpace('a'));
            assert.isFalse(CharAnalyzer.isWhiteSpace('!'));
            assert.isFalse(CharAnalyzer.isWhiteSpace('ă'));
        });
    });
    describe('Unit: isPuntuaction', () => {
        it('check real puntuaction', () => {
            assert.isTrue(CharAnalyzer.isPunctuation('.'));
        });
        it('check fake puntuaction', () => {
            assert.isFalse(CharAnalyzer.isPunctuation('a'));
            assert.isFalse(CharAnalyzer.isPunctuation(' '));
        });
    });
    describe('Unit: isStopPunctuation', () => {
        it('check real puntuaction', () => {
            assert.isTrue(CharAnalyzer.isPunctuation('!'));
            assert.isTrue(CharAnalyzer.isStopPunctuation('!'));
        });
        it('check fake puntuaction', () => {
            assert.isTrue(CharAnalyzer.isPunctuation(','));
            assert.isFalse(CharAnalyzer.isStopPunctuation(','));
            assert.isFalse(CharAnalyzer.isStopPunctuation(' '));
            assert.isFalse(CharAnalyzer.isStopPunctuation('a'));
        });
    });
    describe('Unit: isDiacritic', () => {
        it('check real diacritic', () => {
            assert.isTrue(CharAnalyzer.isDiacritic('ă'));
            assert.isTrue(CharAnalyzer.isDiacritic('ă'[1]));
        });
        it('check fake diacritic', () => {
            assert.isFalse(CharAnalyzer.isDiacritic('a'));
            assert.isFalse(CharAnalyzer.isDiacritic(','));
            assert.isFalse(CharAnalyzer.isDiacritic(' '));
        });
    });
});
