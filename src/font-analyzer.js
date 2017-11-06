import measureText from './utils/measurer.js';

/**
 * Measure the size of a text.
 * @private
 *
 * @param {String} name The font name.
 * @param {String} text The text to measure.
 * @param {Number} size The font size.
 * @return {Object} An object with `width` and `height` values.
 */
function measure(name, text, size) {
    measure.cache = measure.cache || {};
    let cacheKey = `${name}_${text}_${size}`;
    if (!measure.cache[cacheKey]) {
        measure.cache[cacheKey] = measureText({
            text,
            fontSize: `${size}`,
            fontWeight: 'normal',
            fontFamily: name,
        });
    }
    return measure.cache[cacheKey];
}

/**
 * A class for font analysis.
 * @class FontAnalyzer
 */
export class FontAnalyzer {
    /**
     * Get the x-height of the font.
     *
     * @param {String} name The font name.
     * @return {Number} The x-height of the font.
     */
    static getXHeight(name) {
        const TEXT = 'x';
        const SIZE = '1000px';
        let size = measure(name, TEXT, SIZE);
        return size.height;
    }
    /**
     * Get the ascend-height of the font.
     *
     * @param {String} name The font name.
     * @return {Number} The ascend-height of the font.
     */
    static getAscHeight(name) {
        const TEXT = 'l';
        const SIZE = '1000px';
        let size = measure(name, TEXT, SIZE);
        return size.height - FontAnalyzer.getXHeight(name);
    }
}
