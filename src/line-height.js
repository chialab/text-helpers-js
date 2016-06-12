import { DecimalAdjust } from './utils/decimal-adjust.js';

/**
 * A class for optimal line height calculation.
 * @class LineHeight
 */
export class LineHeight {
    /**
     * Calc optimal line height from a given font size.
     *
     * @param {Number} size The font size.
     * @param {Number} xht The font x-height.
     * @param {Number} xht The font ascend-height.
     * @return {Number} The optimal line height.
     */
    static calcLineHeight(size, xht, ascend) {
        let _ascXht = ascend / xht * 100;
        let _xhtLineht = (_ascXht - 37) * (35.8 - 38.1) / (80.2 - 37) + 38.1;
        let lineht = size / 10 * xht / _xhtLineht;
        return DecimalAdjust.round10(lineht, -1);
    }
    /**
     * Calc optimal font size from a given line height.
     *
     * @param {Number} lh The font line height.
     * @param {Number} xht The font x-height.
     * @param {Number} xht The font ascend-height.
     * @return {Number} The optimal font size.
     */
    static calcFontSize(lh, xht, ascend) {
        let _ascXht = ascend / xht * 100;
        let _xhtLineht = (_ascXht - 37) * (35.8 - 38.1) / (80.2 - 37) + 38.1;
        let fontsz = (((lh / 2.83 * _xhtLineht) / xht) * 1000) * 2.83;
        return DecimalAdjust.round10(fontsz / 100, -1);
    }
}
