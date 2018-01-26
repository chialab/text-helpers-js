import './polyfills.js';
import CSS from './fonts.css';

let style = document.createElement('style');
style.type = 'text/css';
style.textContent = CSS;
document.head.appendChild(style);

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

for (let k in FONTS) {
    let span = document.createElement('span');
    span.setAttribute('style', `font-family: ${k}`);
    document.body.appendChild(span);
}

export { FONTS };

export function almostEqual(value, to, sensibility = 1) {
    return (value >= to - sensibility && value <= to + sensibility);
}
