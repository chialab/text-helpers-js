import './polyfills.js';
import WebFont from 'webfontloader';

const FONTS = {
    Roboto: {
        xHeight: 530,
        ascHeight: 221,
        optimalLineHeight: 19.6,
        optimalFontSize: 13.6,
    },
    Merriweather: {
        xHeight: 557,
        ascHeight: 264,
        optimalLineHeight: 20.8,
        optimalFontSize: 12.8,
    },
};

export function loadFonts(callback) {
    WebFont.load({
        google: {
            families: Object.keys(FONTS),
        },
        active: callback,
    });
}

export { FONTS };

export function almostEqual(value, to, sensibility = 1) {
    if (value >= to - sensibility && value <= to + sensibility) {
        return true;
    }
    throw new Error(`aspected ${to} to be equal to ${value}`);
}
