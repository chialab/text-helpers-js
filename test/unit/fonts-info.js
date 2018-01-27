import './polyfills.js';

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
    let script = document.createElement('script');
    script.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
    script.addEventListener('load', () => {
        window.WebFont.load({
            google: {
                families: Object.keys(FONTS),
            },
            active: callback,
        });
    });
    document.head.appendChild(script);
}

export { FONTS };

export function almostEqual(value, to, sensibility = 1) {
    if (value >= to - sensibility && value <= to + sensibility) {
        return true;
    }
    throw new Error(`aspected ${to} to be equal to ${value}`);
}
