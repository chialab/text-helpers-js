import XRegExp from './vendors/xregexp.js';

/**
 * A class for single char analysis.
 * @class CharAnalyzer
 */
export class CharAnalyzer {
    /**
     * Check if char is a white space.
     * @param {String} ch The char to analyze.
     * @return {Boolean}
     */
    static isWhiteSpace(ch) {
        return this.WHITE_SPACES_REGEX.test(ch);
    }
    /**
     * Check if char is a new line.
     * @param {String} ch The char to analyze.
     * @return {Boolean}
     */
    static isNewLine(ch) {
        return this.NEW_LINE_REGEX.test(ch);
    }
    /**
     * Check if char is a punctuation char.
     * @param {String} ch The char to analyze.
     * @return {Boolean}
     */
    static isPunctuation(ch) {
        return this.NOT_ALPHABET_REGEX.test(ch) &&
            this.PUNCTUATION_REGEX.test(ch);
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
     * Check if char is a sentence start punctuation char.
     * @param {String} ch The char to analyze.
     * @return {Boolean}
     */
    static isStartPunctuation(ch) {
        return this.START_PUNCTUATION_REGEX.test(ch);
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
        return this.NOT_ALPHABET_REGEX.test(ch) &&
            this.DIACRITICS_REGEX.test(ch);
    }
}

/**
 * A regexp for white spaces reconition.
 * @type RegExp
 */
CharAnalyzer.WHITE_SPACES_REGEX = new RegExp('[\\s|\\n|\\r]');
/**
 * A regexp for new lines reconition.
 * @type RegExp
 */
CharAnalyzer.NEW_LINE_REGEX = new RegExp('[\\n|\\r]');
/**
 * A regexp for punctuation reconition.
 * @type RegExp
 */
CharAnalyzer.PUNCTUATION_REGEX = new XRegExp('[^\\p{L}|\\s|^\\d]');
/**
 * A regexp for stop punctuation reconition.
 * @type RegExp
 */
CharAnalyzer.STOP_PUNCTUATION_REGEX = new RegExp('[.|!|?|;|·|»]');
/**
 * A regexp for start punctuation reconition.
 * @type RegExp
 */
CharAnalyzer.START_PUNCTUATION_REGEX = new RegExp('[«]');
/**
 * A regexp for diacritics reconition.
 * @type RegExp
 */
CharAnalyzer.DIACRITICS_REGEX = new XRegExp('\\p{M}');
/**
 * A regexp for a char followed by diacritic reconition.
 * @type RegExp
 */
CharAnalyzer.FULL_DIACRITICS_REGEX = new XRegExp('.\\p{M}');
/**
 * A regexp for not alphabet chars.
 * @type RegExp
 */
CharAnalyzer.NOT_ALPHABET_REGEX = /[^a-zA-Z]/;
