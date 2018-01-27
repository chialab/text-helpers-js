/* eslint-env mocha */
import './polyfills.js';
import { FontAnalyzer } from '../../src/font-analyzer.js';
import { FONTS, almostEqual, loadFonts } from './fonts-info.js';

describe('Unit: FontAnalyzer', () => {
    before((done) => {
        loadFonts(done);
    });

    describe('Unit: xHeight', () => {
        for (let name in FONTS) {
            if (FONTS.hasOwnProperty(name)) {
                it(`check ${name}`, () => {
                    assert(almostEqual(FontAnalyzer.getXHeight(name), FONTS[name].xHeight, 2));
                });
            }
        }
    });
    describe('Unit: ascHeight', () => {
        for (let name in FONTS) {
            if (FONTS.hasOwnProperty(name)) {
                it(`check ${name}`, () => {
                    assert(almostEqual(FontAnalyzer.getAscHeight(name), FONTS[name].ascHeight, 2));
                });
            }
        }
    });
});
