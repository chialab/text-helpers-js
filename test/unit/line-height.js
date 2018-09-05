/* eslint-env mocha */
import './polyfills.js';
import { FontAnalyzer } from '../../src/font-analyzer.js';
import { LineHeight } from '../../src/line-height.js';
import { FONTS, loadFonts } from './fonts-info.js';

describe('Unit: LineHeight', function() {
    this.timeout(4 * 60 * 1000);

    before((done) => {
        loadFonts(done);
    });

    describe('Unit: calcLineHeight', () => {
        for (let name in FONTS) {
            it(`check ${name}`, () => {
                expect(
                    LineHeight.calcLineHeight(
                        14,
                        FontAnalyzer.getXHeight(name),
                        FontAnalyzer.getAscHeight(name)
                    )
                ).to.be.within(
                    FONTS[name].optimalLineHeight - 0.2,
                    FONTS[name].optimalLineHeight + 0.2
                );
            });
        }
    });
    describe('Unit: calcFontSize', () => {
        for (let name in FONTS) {
            it(`check ${name}`, () => {
                expect(
                    LineHeight.calcFontSize(
                        19,
                        FontAnalyzer.getXHeight(name),
                        FontAnalyzer.getAscHeight(name)
                    )
                ).to.be.within(
                    FONTS[name].optimalFontSize - 0.2,
                    FONTS[name].optimalFontSize + 0.2
                );
            });
        }
    });
});
