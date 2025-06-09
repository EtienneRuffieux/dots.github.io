/**
 * Class returned by ImageParser#getGreyscale()
 */
class ImageParserArray {
	#width;
	#height;
	#pixelsArray;
	#pixelCount;
	#visiblePixelCount;

	constructor(width, height, pixelsArray, visiblePixelCount) {
		this.#width = width;
		this.#height = height;
		this.#pixelsArray = pixelsArray;
		this.#pixelCount = width * height;
		this.#visiblePixelCount = visiblePixelCount;
	}

	getWidth() {
		return this.#width;
	}

	getHeight() {
		return this.#height;
	}

	getPixelsArray() {
		return this.#pixelsArray;
	}

	getPixelCount() {
		return this.#pixelCount;
	}

	getVisiblePixelCount() {
		return this.#visiblePixelCount;
	}
}

/**
 * Handles all image operations.
 */
class ImageParser {

	// Threshold after what color is considered too clear to be rendered as point.
	// This is used to prevent artifacts in white zones that are never really white.
	#BRIGHT_THRESHOLD = 220

	/**
	 * Loads the image and extracts pixels.
	 *
	 * loadedCallback has no parameters.
	 *
	 * Use isLoaded() to check if the image has done loading.
	 */
	constructor(path, forceResizeMax, loadedCallback) {
		const canvas = document.createElement('canvas');
		const canvasContext = canvas.getContext("2d");
		const image = new Image();
		image.addEventListener(
			"load", () => {

				if (forceResizeMax > 0 && image.width > image.height) {
					canvas.width = forceResizeMax;
					canvas.height = forceResizeMax * image.height / image.width;
				} else if (forceResizeMax > 0){
					canvas.height = forceResizeMax;
					canvas.width = forceResizeMax * image.width / image.height;
				} else {
					canvas.width = image.width;
					canvas.height = image.height;
				}

				canvasContext.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

				this.imageData = canvasContext.getImageData(
						0, 0, canvas.width, canvas.height).data;
				this.imageWidth = canvas.width;
				this.imageHeight = canvas.height;
				this.loaded = true;
				console.info("Image properly loaded: ", this.imageData);

				loadedCallback();
			},
			false,
		);
		console.info("Loading image");
		image.crossOrigin = "anonymous";
		image.src = path;
	}

	isLoaded() {
		return this.loaded == true;
	}

	/**
	 * Returns an array containing the width, height and pixels array.
	 *
	 * Note: The image must be loaded before calling this method.
	 *
	 * The pixels array contains one entry per pixel, its greyscale value on a scale 0 to 100.
	 * Transparent pixels are represented by -1.
	 */ 
	getGreyscale() {
		if (!this.loaded) {
			throw new Error('Image is not loaded yet');
		}
		let greyscaleArray = [];
		let visibleCount = 0;
		// rgba
		for(let i = 0; i < this.imageData.length; i += 4) {
			if (this.imageData[i + 3] < 255) {
				// Pixel has transparency, don't render it
				greyscaleArray.push(-1);
			} else {
				let greyscaleValue = 
						(this.imageData[i] + this.imageData[i + 1] + this.imageData[i + 2]) / 3

				// Pixel is too clear, don't render it
				if (greyscaleValue > this.#BRIGHT_THRESHOLD) {
					greyscaleArray.push(-1);
				} else {
					greyscaleArray.push(greyscaleValue)
					visibleCount++;
				}
			}
		}
		return new ImageParserArray(
				this.imageWidth,
				this.imageHeight,
				greyscaleArray,
				visibleCount);
	}

	/**
	 * Scales the image stored in this class by a given percentage.
	 */
	scaleToPercent(percent) {

	}

	/**
	 * Scales the image stored in this class so that its width match param.
	 */
	scaleToWidth(width) {

	}

	/**
	 * Scales the image stored in this class so that its height match param.
	 */
	scaleToHeight(height) {

	}

	/**
	 * Scales the image stored in this class so that the pixel count isn't more than param.
	 */
	scaleToPixelCount(count) {

	}

}

export {ImageParser, ImageParserArray};