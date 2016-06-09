import { CharAnalyzer } from './src/char-analyzer.js';
import { TextTagger } from './src/text-tagger.js';

export default class TextHelpers {
    static get CharAnalyzer() {
        return CharAnalyzer;
    }
    static get TextTagger() {
        return TextTagger;
    }
}
