/* eslint-env mocha */
import './polyfills.js';
import { FontAnalyzer } from '../../src/font-analyzer.js';
import { FONTS, loadFonts } from './fonts-info.js';

describe('Unit: FontAnalyzer', function() {
    this.timeout(4 * 60 * 1000);

    before((done) => {
        loadFonts(done);
    });

    describe('Unit: xHeight', () => {
        for (let name in FONTS) {
            if (FONTS.hasOwnProperty(name)) {
                it(`check ${name}`, () => {
                    expect(FontAnalyzer.getXHeight(name)).to.be.within(FONTS[name].xHeight - 5, FONTS[name].xHeight + 5);
                });
            }
        }
    });
    describe('Unit: ascHeight', () => {
        for (let name in FONTS) {
            if (FONTS.hasOwnProperty(name)) {
                it(`check ${name}`, () => {
                    expect(FontAnalyzer.getAscHeight(name)).to.be.within(FONTS[name].ascHeight - 5, FONTS[name].xHeight + 5);
                });
            }
        }
    });
});
