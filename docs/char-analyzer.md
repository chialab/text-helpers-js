<a name="CharAnalyzer"></a>

## CharAnalyzer
**Kind**: global class  

* [CharAnalyzer](#CharAnalyzer)
    * [`new CharAnalyzer()`](#new_CharAnalyzer_new)
    * [`.WHITE_SPACES_REGEX`](#CharAnalyzer.WHITE_SPACES_REGEX) : <code>RegExp</code>
    * [`.PUNCTUATION_REGEX`](#CharAnalyzer.PUNCTUATION_REGEX) : <code>RegExp</code>
    * [`.STOP_PUNCTUATION_REGEX`](#CharAnalyzer.STOP_PUNCTUATION_REGEX) : <code>RegExp</code>
    * [`.DIACRITICS_REGEX`](#CharAnalyzer.DIACRITICS_REGEX) : <code>RegExp</code>
    * [`.FULL_DIACRITICS_REGEX`](#CharAnalyzer.FULL_DIACRITICS_REGEX) : <code>RegExp</code>
    * [`.isWhiteSpace(ch)`](#CharAnalyzer.isWhiteSpace) ⇒ <code>Boolean</code>
    * [`.isPunctuation(ch)`](#CharAnalyzer.isPunctuation) ⇒ <code>Boolean</code>
    * [`.isStopPunctuation(ch)`](#CharAnalyzer.isStopPunctuation) ⇒ <code>Boolean</code>
    * [`.isDiacritic(ch)`](#CharAnalyzer.isDiacritic) ⇒ <code>Boolean</code>

<a name="new_CharAnalyzer_new"></a>

### `new CharAnalyzer()`
A class for single char analysis.

<a name="CharAnalyzer.WHITE_SPACES_REGEX"></a>

### `CharAnalyzer.WHITE_SPACES_REGEX` : <code>RegExp</code>
A regexp for white spaces reconition.

**Kind**: static property of <code>[CharAnalyzer](#CharAnalyzer)</code>  
<a name="CharAnalyzer.PUNCTUATION_REGEX"></a>

### `CharAnalyzer.PUNCTUATION_REGEX` : <code>RegExp</code>
A regexp for punctuation reconition.

**Kind**: static property of <code>[CharAnalyzer](#CharAnalyzer)</code>  
<a name="CharAnalyzer.STOP_PUNCTUATION_REGEX"></a>

### `CharAnalyzer.STOP_PUNCTUATION_REGEX` : <code>RegExp</code>
A regexp for stop punctuation reconition.

**Kind**: static property of <code>[CharAnalyzer](#CharAnalyzer)</code>  
<a name="CharAnalyzer.DIACRITICS_REGEX"></a>

### `CharAnalyzer.DIACRITICS_REGEX` : <code>RegExp</code>
A regexp for diacritics reconition.

**Kind**: static property of <code>[CharAnalyzer](#CharAnalyzer)</code>  
<a name="CharAnalyzer.FULL_DIACRITICS_REGEX"></a>

### `CharAnalyzer.FULL_DIACRITICS_REGEX` : <code>RegExp</code>
A regexp for a char followed by diacritic reconition.

**Kind**: static property of <code>[CharAnalyzer](#CharAnalyzer)</code>  
<a name="CharAnalyzer.isWhiteSpace"></a>

### `CharAnalyzer.isWhiteSpace(ch)` ⇒ <code>Boolean</code>
Check if char is a white space.

**Kind**: static method of <code>[CharAnalyzer](#CharAnalyzer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| ch | <code>String</code> | The char to analyze. |

<a name="CharAnalyzer.isPunctuation"></a>

### `CharAnalyzer.isPunctuation(ch)` ⇒ <code>Boolean</code>
Check if char is a punctuation char.

**Kind**: static method of <code>[CharAnalyzer](#CharAnalyzer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| ch | <code>String</code> | The char to analyze. |

<a name="CharAnalyzer.isStopPunctuation"></a>

### `CharAnalyzer.isStopPunctuation(ch)` ⇒ <code>Boolean</code>
Check if char is a sentence stop punctuation char.

**Kind**: static method of <code>[CharAnalyzer](#CharAnalyzer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| ch | <code>String</code> | The char to analyze. |

<a name="CharAnalyzer.isDiacritic"></a>

### `CharAnalyzer.isDiacritic(ch)` ⇒ <code>Boolean</code>
Check if char is a diacritic char.

**Kind**: static method of <code>[CharAnalyzer](#CharAnalyzer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| ch | <code>String</code> | The char to analyze. |

