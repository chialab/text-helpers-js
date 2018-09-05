import FontMetrics from 'fontmetrics';

/**
 * Measure the size of a text.
 * @private
 *
 * @param {String} name The font name.
 * @param {String} text The text to measure.
 * @param {Number} size The font size.
 * @return {Object} An object with `width` and `height` values.
 */
function measure(name) {
    measure.cache = measure.cache || {};
    if (!measure.cache[name]) {
        measure.cache[name] = FontMetrics({
            fontFamily: name,
        });
    }
    return measure.cache[name];
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
        return -measure(name).xHeight * 1000;
    }
    /**
     * Get the ascend-height of the font.
     *
     * @param {String} name The font name.
     * @return {Number} The ascend-height of the font.
     */
    static getAscHeight(name) {
        let xHeight = this.getXHeight(name);
        let ascent = -measure(name).ascent * 1000;
        return ascent - xHeight;
    }
}
