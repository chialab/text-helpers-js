import { CharAnalyzer } from './src/char-analyzer.js';
import { FontAnalyzer } from './src/font-analyzer.js';
import { TextTagger } from './src/text-tagger.js';
import { LineHeight } from './src/line-height.js';

export default class TextHelpers {
    static get CharAnalyzer() {
        return CharAnalyzer;
    }
    static get FontAnalyzer() {
        return FontAnalyzer;
    }
    static get TextTagger() {
        return TextTagger;
    }
    static get LineHeight() {
        return LineHeight;
    }
}
