/* eslint-env mocha */
import { FontAnalyzer } from '../../src/font-analyzer.js';
import { FONTS } from './fonts-info.js';

describe('Unit: FontAnalyzer', () => {
    describe('Unit: xHeight', () => {
        for (let name in FONTS) {
            if (FONTS.hasOwnProperty(name)) {
                it(`check ${name}`, () => {
                    assert.equal(FontAnalyzer.getXHeight(name), FONTS[name].xHeight);
                });
            }
        }
    });
    describe('Unit: ascHeight', () => {
        for (let name in FONTS) {
            if (FONTS.hasOwnProperty(name)) {
                it(`check ${name}`, () => {
                    assert.equal(FontAnalyzer.getAscHeight(name), FONTS[name].ascHeight);
                });
            }
        }
    });
});
