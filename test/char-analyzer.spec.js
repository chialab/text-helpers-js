import { CharAnalyzer } from '../src/char-analyzer.js';

/* globals describe, before, beforeEach, it, assert */
describe('Unit: CharAnalyzer', () => {
    describe('Unit: isWhiteSpace', () => {
        it('check real white space', () => {
            assert(CharAnalyzer.isWhiteSpace(' '));
            assert(CharAnalyzer.isWhiteSpace("\n"));
            assert(CharAnalyzer.isWhiteSpace(`
`));
        });
        it('check fake white space', () => {
            assert(!CharAnalyzer.isWhiteSpace('a'));
            assert(!CharAnalyzer.isWhiteSpace('!'));
            assert(!CharAnalyzer.isWhiteSpace('ă'));
        });
    });
    describe('Unit: isPuntuaction', () => {
        it('check real puntuaction', () => {
            assert(CharAnalyzer.isPunctuation('.'));
        });
        it('check fake puntuaction', () => {
            assert(!CharAnalyzer.isPunctuation('a'));
            assert(!CharAnalyzer.isPunctuation(' '));
        });
    });
    describe('Unit: isStopPunctuation', () => {
        it('check real puntuaction', () => {
            assert(CharAnalyzer.isPunctuation('!'));
            assert(CharAnalyzer.isStopPunctuation('!'));
        });
        it('check fake puntuaction', () => {
            assert(CharAnalyzer.isPunctuation(','));
            assert(!CharAnalyzer.isStopPunctuation(','));
            assert(!CharAnalyzer.isStopPunctuation(' '));
            assert(!CharAnalyzer.isStopPunctuation('a'));
        });
    });
    describe('Unit: isDiacritic', () => {
        it('check real diacritic', () => {
            assert(CharAnalyzer.isDiacritic('ă'));
            assert(CharAnalyzer.isDiacritic('ă'[1]));
        });
        it('check fake diacritic', () => {
            assert(!CharAnalyzer.isDiacritic('a'));
            assert(!CharAnalyzer.isDiacritic(','));
            assert(!CharAnalyzer.isDiacritic(' '));
        });
    });
});
