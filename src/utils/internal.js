const MAP = (typeof self.WeakMap !== 'undefined') ? new WeakMap() : false;
const PROP = '__private__';

export function internal(object) {
    if (MAP) {
        if (!MAP.has(object)) {
            MAP.set(object, {});
        }
        return MAP.get(object);
    }
    if (!this.hasOwnProperty(PROP)) {
        this[PROP] = {};
    }
    return this[PROP];
}

internal.destroy = function(object) {
    if (MAP) {
        if (MAP.has(object)) {
            MAP.delete(object);
        }
    } else {
        delete this[PROP];
    }
};
