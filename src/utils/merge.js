/**
 * Merge two object using the first as matrix.
 * @private
 *
 * @param {Object} defaults The starter object.
 * @param {Object} obj The object to merge.
 * @return {Object} A new object with merged values.
 */
export function merge(defaults, obj) {
    let res = {};
    for (let k in defaults) {
        if (typeof obj[k] === 'undefined') {
            res[k] = defaults[k];
        } else {
            res[k] = obj[k];
        }
    }
    return res;
}
