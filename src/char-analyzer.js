import XRegExp from './vendors/xregexp.js';

/**
 * A class for single char analysis.
 * @class CharAnalyzer
 */
export class CharAnalyzer {
    /**
     * A regexp for white spaces reconition.
     * @type RegExp
     */
    static get WHITE_SPACES_REGEX() {
        return new RegExp('[\\s|\\n|\\r]');
    }
    /**
     * A regexp for punctuation reconition.
     * @type RegExp
     */
    static get PUNCTUATION_REGEX() {
        return new XRegExp('[^\\p{L}|\\s]');
    }
    /**
     * A regexp for stop punctuation reconition.
     * @type RegExp
     */
    static get STOP_PUNCTUATION_REGEX() {
        return new RegExp('[.|!|?|;|·]');
    }
    /**
     * A regexp for diacritics reconition.
     * @type RegExp
     */
    static get DIACRITICS_REGEX() {
        return new XRegExp('\\p{M}');
    }
    /**
     * A regexp for a char followed by diacritic reconition.
     * @type RegExp
     */
    static get FULL_DIACRITICS_REGEX() {
        return new XRegExp('.\\p{M}');
    }
    /**
     * Check if char is a white space.
     * @param {String} ch The char to analyze.
     * @return {Boolean}
     */
    static isWhiteSpace(ch) {
        return this.WHITE_SPACES_REGEX.test(ch);
    }
    /**
     * Check if char is a punctuation char.
     * @param {String} ch The char to analyze.
     * @return {Boolean}
     */
    static isPunctuation(ch) {
        return this.PUNCTUATION_REGEX.test(ch);
    }
    /**
     * Check if char is a sentence stop punctuation char.
     * @param {String} ch The char to analyze.
     * @return {Boolean}
     */
    static isStopPunctuation(ch) {
        return this.STOP_PUNCTUATION_REGEX.test(ch);
    }
    /**
     * Check if char is a diacritic char.
     * @param {String} ch The char to analyze.
     * @return {Boolean}
     */
    static isDiacritic(ch) {
        if (ch.length === 2) {
            return this.FULL_DIACRITICS_REGEX.test(ch);
        }
        return this.DIACRITICS_REGEX.test(ch);
    }
}
