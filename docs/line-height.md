<a name="LineHeight"></a>

## LineHeight
**Kind**: global class  

* [LineHeight](#LineHeight)
    * [`new LineHeight()`](#new_LineHeight_new)
    * [`.calcLineHeight(size, xht, xht)`](#LineHeight.calcLineHeight) ⇒ <code>Number</code>
    * [`.calcFontSize(lh, xht, xht)`](#LineHeight.calcFontSize) ⇒ <code>Number</code>

<a name="new_LineHeight_new"></a>

### `new LineHeight()`
A class for optimal line height calculation.

<a name="LineHeight.calcLineHeight"></a>

### `LineHeight.calcLineHeight(size, xht, xht)` ⇒ <code>Number</code>
Calc optimal line height from a given font size.

**Kind**: static method of <code>[LineHeight](#LineHeight)</code>  
**Returns**: <code>Number</code> - The optimal line height.  

| Param | Type | Description |
| --- | --- | --- |
| size | <code>Number</code> | The font size. |
| xht | <code>Number</code> | The font x-height. |
| xht | <code>Number</code> | The font ascend-height. |

<a name="LineHeight.calcFontSize"></a>

### `LineHeight.calcFontSize(lh, xht, xht)` ⇒ <code>Number</code>
Calc optimal font size from a given line height.

**Kind**: static method of <code>[LineHeight](#LineHeight)</code>  
**Returns**: <code>Number</code> - The optimal font size.  

| Param | Type | Description |
| --- | --- | --- |
| lh | <code>Number</code> | The font line height. |
| xht | <code>Number</code> | The font x-height. |
| xht | <code>Number</code> | The font ascend-height. |

