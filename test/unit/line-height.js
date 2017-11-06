/* eslint-env mocha */
import { FontAnalyzer } from '../../src/font-analyzer.js';
import { LineHeight } from '../../src/line-height.js';
import { FONTS } from './fonts-info.js';

describe('Unit: LineHeight', () => {
    describe('Unit: calcLineHeight', () => {
        for (let name in FONTS) {
            if (FONTS.hasOwnProperty(name)) {
                it(`check ${name}`, () => {
                    assert.equal(
                        LineHeight.calcLineHeight(
                            14,
                            FontAnalyzer.getXHeight(name),
                            FontAnalyzer.getAscHeight(name)
                        ),
                        FONTS[name].optimalLineHeight
                    );
                });
            }
        }
    });
    describe('Unit: calcFontSize', () => {
        for (let name in FONTS) {
            if (FONTS.hasOwnProperty(name)) {
                it(`check ${name}`, () => {
                    assert.equal(
                        LineHeight.calcFontSize(
                            19,
                            FontAnalyzer.getXHeight(name),
                            FontAnalyzer.getAscHeight(name)
                        ),
                        FONTS[name].optimalFontSize
                    );
                });
            }
        }
    });
});
