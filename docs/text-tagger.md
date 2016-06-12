<a name="TextTagger"></a>

## TextTagger
**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| options.setId | <code>Boolean</code> | Should set the data token id attribute to the token element. |
| options.useClasses | <code>Boolean</code> | Should set the token class to the token element. |
| options.mode | <code>String</code> | The tag method ("letter" or "word"). |
| options.tokenTag | <code>String</code> | The tag for the token element. |
| options.tokenClass | <code>String</code> | The class for the token element. |
| options.puntuactionClass | <code>String</code> | The class for the punctuation token element. |
| options.sentenceStopClass | <code>String</code> | The class for the stop punctuation token element. |
| options.whiteSpaceClass | <code>String</code> | The class for the white space token element. |
| options.excludeClasses | <code>String</code> | The class to ignore on tagging. |


* [TextTagger](#TextTagger)
    * [`new TextTagger(options)`](#new_TextTagger_new)
    * [`.tag(text, options)`](#TextTagger+tag) ⇒ <code>String</code>

<a name="new_TextTagger_new"></a>

### `new TextTagger(options)`
A class for letter or words tagging in texts.


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | A set of options. |

<a name="TextTagger+tag"></a>

### `textTagger.tag(text, options)` ⇒ <code>String</code>
Tag the text.

**Kind**: instance method of <code>[TextTagger](#TextTagger)</code>  
**Returns**: <code>String</code> - The tagged text.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>String</code> | The text to tag. |
| options | <code>Object</code> | Optional extra options. |

