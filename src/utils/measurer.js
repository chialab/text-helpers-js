function isTransparent(imageData, index) {
    return imageData.data[index + 3] === 0; // If there is zero alpha then it is transparent
}

function getComputedStyle(element, property) {
    return element ? window.getComputedStyle(element)[property] : null;
}

class Iterator {
    constructor(maxWidth, maxHeight) {
        this.x = 0;
        this.y = 0;
        this.index = 0;
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
    }

    moveRight() {
        if (this.arePixelsToTheRight()) {
            this.x++;
            this.index += 4;
        } else {
            this.moveDown();
        }
    }

    moveDown() {
        this.x = 0;
        this.y++;
        this.index = this.y * this.maxWidth * 4;
    }

    arePixelsToTheRight() {
        return this.x < this.maxWidth - 1;
    }

    noMorePixels() {
        return this.index >= (this.maxWidth * this.maxHeight * 4) - 4;
    }
}

function measureBoundingRect(text, font) {
    let temporaryContainer = document.createElement('div');
    temporaryContainer.style.position = 'fixed';
    temporaryContainer.style.top = '0px';
    temporaryContainer.style.left = '0px';
    temporaryContainer.style.width = '0px';
    temporaryContainer.style.height = '0px';
    temporaryContainer.style.overflow = 'hidden';

    let temporaryElement = document.createElement('span');
    temporaryElement.style.font = font;
    temporaryElement.innerText = text;
    document.body.appendChild(temporaryElement);
    let bBox = temporaryElement.getBoundingClientRect();
    document.body.removeChild(temporaryElement);
    return bBox;
}

function measure(parameters) {
    // Find the top and bottom of the text by finding which rows are entirely full of transparent pixels.
    // The difference between the top-most transparent row and the bottom-most transparent row is the text height.
    let iterator = new Iterator(parameters.width, parameters.height);
    let foundTopText = false;
    let foundBottomText = false;
    let topTextY = null;
    let bottomTextY = null;
    let allPixelsInThisRowAreWhite;
    while (!iterator.noMorePixels()) {
        if (!foundTopText) {
            // We have only encounted rows that are totally white so far, as soon as we
            // find a pixel that is not white we will count that as the top of the text
            if (isTransparent(parameters.imageData, iterator.index)) {
                iterator.moveRight();
            } else {
                topTextY = iterator.y;
                foundTopText = true;
                iterator.moveDown();
            }
        } else {
            // We are looping through the rows until we find a row which is all white,
            // in which case we have reached the bottom of the text
            if (!iterator.arePixelsToTheRight()) {
                if (allPixelsInThisRowAreWhite) {
                    bottomTextY = iterator.y;
                    foundBottomText = true;
                    break;
                }
                allPixelsInThisRowAreWhite = true;
                iterator.moveDown();
            }
            if (!isTransparent(parameters.imageData, iterator.index)) {
                allPixelsInThisRowAreWhite = false;
                iterator.moveDown();
            } else {
                iterator.moveRight();
            }
        }
    }

    return {
        foundTopText,
        foundBottomText,
        topTextY,
        bottomTextY,
    };
}


export default function(options) {
    let fontSize = options.fontSize || getComputedStyle(options.element, 'font-size') || '100px';
    let fontWeight = options.fontWeight || getComputedStyle(options.element, 'font-weight') || 'normal';
    let fontFamily = options.fontFamily || getComputedStyle(options.element, 'font-family') || 'Arial';
    let font = `${fontWeight} ${fontSize} ${fontFamily}`;

    let boundingRect = measureBoundingRect(options.text, font);

    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    canvas.width = boundingRect.width;
    canvas.height = boundingRect.height * 1.2; // Bounding rect height may not be enough as fillText() will render from the baseline
    context.font = font;
    context.fillText(options.text, 0, fontSize.replace('px', ''));

    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let result = measure({
        width: canvas.width,
        height: canvas.height,
        imageData,
        options,
    });

    if (!result.foundTopText) {
        return {
            width: boundingRect.width,
            height: 0,
            yOffset: 0,
        };
    }

    if (!result.foundBottomText) {
        return {
            width: boundingRect.width,
            height: canvas.height - result.topTextY,
            yOffset: -result.topTextY,
        };
    }

    return {
        width: boundingRect.width,
        height: result.bottomTextY - result.topTextY,
        yOffset: -result.topTextY,
    };
}
