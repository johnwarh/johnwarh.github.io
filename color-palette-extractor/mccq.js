// image upload form elements
const form = document.getElementById('form'), 
	loadBtn = document.getElementById('btnLoad'),
	resetBtn = document.getElementById('btnReset'),
	colors = document.getElementById('colors'), // number of colors in palette from form
// canvases, spinners, etc. elements for image display
	sIcanvas = document.getElementById('sIcanvas'), // canvas for uploaded image
	ctx = sIcanvas.getContext('2d'),
	spinner = document.getElementById('spinner'), // show when busy
	qIcanvas = document.getElementById('qIcanvas'), // cnavas for quantized color image
	ctx1 = qIcanvas.getContext('2d'),
	spinner1 = document.getElementById('spinner1'),
	num_colors = document.getElementById('num_colors'), // for display
	fileName = document.getElementById('filename'),  // for display
// palettes containers
	paletteContainer = document.getElementById('palette'), // for palette color swatches
	compContainer = document.getElementById('complementary'); // for complementary palette color swatches

const main = () => { //called when load button clicked
	const imgFile = document.getElementById('imgfile'), // the uploaded image file
		image = new Image(), // the uploaded image
		file = imgFile.files[0],
		reader = new FileReader(),
		qIpixels = [];  // quantized color image data array
	clean_canvas_and_palette();
	fileName.innerHTML = file.name;
	n_colors = 2**colors.value;
	num_colors.innerHTML = n_colors;
	spinner.style.visibility = spinner1.style.visibility = 'visible';
	
	reader.onload = () => {
		image.onload = () => {
			// set canvas widths for image displays
			sIcanvas.width = qIcanvas.width = image.width;
			sIcanvas.height = qIcanvas.height = image.height;
			console.log('canvas w x h = ', sIcanvas.width, ' x ', sIcanvas.height)

			// draw uploaded image on sIcanvas and retrieve imageData array from canvas
			ctx.drawImage(image, 0, 0);
			const imageData = ctx.getImageData(0, 0, sIcanvas.width, sIcanvas.height);

			// create rgbArray of pixels, incl. pixel index, for processing
			const rgbArray = buildRgb(imageData.data);

			// quantize the colors in rgbArray; the global 'qIpixels' is ready to use after this
			quantColors = quantization(rgbArray, 0);

			// Assemble data and create HTML structure to display the color palettes
			buildPalette(quantColors);

			// setup qIcanvas for quantized color image
			const qImageData = ctx1.createImageData(qIcanvas.width, qIcanvas.height);

			// sort qIpixels array on the index 'i' to put pixels in correct sequential order
			qIpixels.sort((a, b) => { return a.i - b.i; });

			// load qIpixel data into qImageData
			let j = 0;
			for (let i = 0; i < qIpixels.length; i++) {
				qImageData.data[j + 0] = qIpixels[i].r;
				qImageData.data[j + 1] = qIpixels[i].g;
				qImageData.data[j + 2] = qIpixels[i].b;
				qImageData.data[j + 3] = 255;  // a, opacity
				j += 4;
			}
			console.log('qImageData.data.length = ' + qImageData.data.length);

			// write qImage data to canvas
			ctx1.putImageData(qImageData, 0, 0);

			// hide spinners when finished
			spinner.style.visibility = spinner1.style.visibility = 'hidden';

			// empty arrays before next use
			rgbArray.length = qIpixels.length = 0;
		};
		image.src = reader.result;
	};
	reader.readAsDataURL(file);

	/** Processes the list of palette colors and then builds the HTML
	 *  framework to display the palette swatches */
	const buildPalette = (colorsList) => { // colorsList = quantized colors from rgbArray
		let hslColors = '',
			hslColorsComp = '';
		paletteContainer.innerHTML = '';
		compContainer.innerHTML = '';

		hslColors = convertRGBtoHSL(colorsList);// Get colors in HSL from RGB

		orderByL(colorsList, hslColors);// Sort colorsList and hslColors by hsl lightness

		/* Get complementary colors in HSL from clone of hslColors*/
		hslColorsComp = structuredClone(hslColors);
		for (let i = 0; i < hslColorsComp.length; i++) { // modify hue by +/- 180 deg to get comp
			hslColorsComp[i].h = (hslColorsComp[i].h > 180)
				? hslColorsComp[i].h -= 180 : hslColorsComp[i].h += 180;
		}

		/* Calculate hex colors and write colors to document */
		for (let i = 0; i < colorsList.length; i++) {
			const hexColor = rgbToHex(colorsList[i]);
			const hexColorComp = hslToHex(hslColorsComp[i]);
			build_html(hslColors, hexColor , paletteContainer, i);
			build_html(hslColorsComp, hexColorComp, compContainer, i);
		}
	};

	/* create color palette div and text elements & add to the document */
	const build_html = (hslColors, hexColor, colorContainer, i) => {
		let colorElement = document.createElement('div');
		colorElement.classList.add('col');
		// color swatch
		let colorCanvas = document.createElement('div');
		let cCanvas = document.createElement('canvas');
		cCanvas.style.backgroundColor = hexColor;
		colorCanvas.appendChild(cCanvas);
		// color specs in hex and hsl
		let textElement = document.createElement('div');
		let para = document.createElement('p');
		para.classList.add('cap_color');
		let para1 = document.createElement('p');
		para1.classList.add('cap_color');
		textElement.appendChild(para);
		textElement.appendChild(para1);
		para.innerHTML = hexColor;
		para1.innerHTML = 'hsl(' + hslColors[i].h + ',' + hslColors[i].s
			+ ',' + hslColors[i].l + ')';
		// assemble color element into container and display
		colorElement.appendChild(colorCanvas);
		colorElement.appendChild(textElement);
		colorContainer.appendChild(colorElement); // add colorElement to page
	};

	/** Sort colors by lightness (l from hsl) */
	const orderByL = (colorsList, hslColors) => {
		let colorsListSort = [];
		// combine rgb and hsl values into array for sorting
		for (let i = 0; i < colorsList.length; i++) {
			colorsListSort.push({ 'rgb': colorsList[i], 'hsl': hslColors[i] });
		}
		//sort colorsListSort and hslColors by lightness
		const getL = (p) => { return p.hsl.l; }
		colorsListSort.sort((p1, p2) => { return getL(p2) - getL(p1); })
		// put sorted rgb and hsl values into colorsList and hslColors
		for (let i = 0; i < colorsListSort.length; i++) {
			colorsList[i] = colorsListSort[i].rgb;
			hslColors[i] = colorsListSort[i].hsl;
		}
		return colorsList, hslColors
	};

	/** Convert RGB values to HSL.  This formula can be found here:
	 *  https://www.rapidtables.com/convert/color/rgb-to-hsl.html */
	const convertRGBtoHSL = (rgbValues) => {
		return rgbValues.map((pixel) => {
			let hue, saturation, lightness = 0;
			let RPrime = pixel.r / 255;
			let GPrime = pixel.g / 255;
			let BPrime = pixel.b / 255;
			const Cmax = Math.max(RPrime, GPrime, BPrime);
			const Cmin = Math.min(RPrime, GPrime, BPrime);
			const delta = Cmax - Cmin;
			const range = Cmax + Cmin;
			lightness = range / 2.0;
			if (delta == 0) {
				return {
					h: 0,
					s: 0,
					l: Math.round(lightness * 100),
				}
			}
			else {
				saturation = (lightness <= 0.5) ? delta / range : delta / (2.0 - range);
				const maxColorValue = Math.max(pixel.r, pixel.g, pixel.b);
				if (maxColorValue === pixel.r) {
					hue = ((GPrime - BPrime) / delta) + (GPrime < BPrime ? 6 : 0);
				}
				else if (maxColorValue === pixel.g) { hue = 2.0 + (BPrime - RPrime) / delta; }
				else { hue = 4.0 + (RPrime - GPrime) / delta; }
				hue = hue * 60; // scale hue value to degrees 
				if (hue < 0) hue = hue + 360; //  0 <= hue <= 360
				else if (hue > 360) hue = hue - 360;
				return {
					h: Math.round(hue),
					s: Math.round(saturation * 100),
					l: Math.round(lightness * 100),
				};
			}
		});
	};

	/**  Convert each pixel value ( numbers ) to hexadecimal ( string ) */
	const rgbToHex = (pixel) => {
		const componentToHex = (c) => {
			const hex = c.toString(16);
			return hex.length == 1 ? '0' + hex : hex;
		};
		return ('#' + componentToHex(pixel.r) + componentToHex(pixel.g) +
			componentToHex(pixel.b)).toUpperCase();
	};

	/** Convert HSL to Hex. ref: 
	 *  https://stackoverflow.com/a/44134328/17150245 */
	const hslToHex = (hslColor) => {
		const hslColorCopy = { ...hslColor };
		hslColorCopy.l /= 100;
		const a = (hslColorCopy.s * Math.min(hslColorCopy.l, 1 - hslColorCopy.l)) / 100;
		const f = (n) => {
			const k = (n + hslColorCopy.h / 30) % 12;
			const color = hslColorCopy.l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0');
		};
		return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
	};

	/** Convert HSL to RGB */
	const hslToRGB = (hslColor) => {
		const hslColorCopy = { ...hslColor };
		hslColorCopy.l /= 100;
		const a = hslColorCopy.s * Math.min(hslColorCopy.l, 1 - hslColorCopy.l) / 100;
		const k = (n) => (n + hslColorCopy.h / 30) % 12;
		const f = (n) => hslColorCopy.l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
		return {
			r: Math.round(255 * f(0)),
			g: Math.round(255 * f(8)),
			b: Math.round(255 * f(4)),
		};
	};

	/** Returns color channel with the largest range of values */
	const findLargestColorRange = (rgbValues) => {
		let rMin = gMin = bMin = Number.MAX_VALUE;
		let rMax = gMax = bMax = Number.MIN_VALUE;
		rgbValues.forEach((pixel) => {
			rMin = Math.min(rMin, pixel.r);
			gMin = Math.min(gMin, pixel.g);
			bMin = Math.min(bMin, pixel.b);
			rMax = Math.max(rMax, pixel.r);
			gMax = Math.max(gMax, pixel.g);
			bMax = Math.max(bMax, pixel.b);
		});
		const rRange = rMax - rMin;
		const gRange = gMax - gMin;
		const bRange = bMax - bMin;
		/* find color with biggest range */
		const biggestRange = Math.max(rRange, gRange, bRange);
		if (biggestRange === rRange) { return 'r'; }
		else if (biggestRange === gRange) { return 'g'; }
		else { return 'b'; }
	};

	/** Median cut quantization is used to here to reduce the number of 
	 * colors in the image palette. Description of Median cut quantization 
	 * can be found here:  https://en.wikipedia.org/wiki/Median_cut  */
	const quantization = (rgbValues, depth) => {
		const MAX_DEPTH = Number(colors.value); // number of color values returned is 2^MAX_DEPTH
		if (depth === MAX_DEPTH || rgbValues.length === 0) { // depth is incremented in recursion below
			const pixelIndex = [];
			const color = rgbValues.reduce(
				(prev, curr) => {
					prev.r += curr.r;
					prev.g += curr.g;
					prev.b += curr.b;
					pixelIndex.push(curr.i);
					return prev;
				},
				{ r: 0, g: 0, b: 0, }
			);
			color.r = Math.round(color.r / rgbValues.length);
			color.g = Math.round(color.g / rgbValues.length);
			color.b = Math.round(color.b / rgbValues.length);
			console.log('qnt rgb =[' + color.r + ',' + color.g + ',' + color.b + ']', 'length = ' + rgbValues.length);

			// set pixel color for all pixels in the bucket to build quantized-color image
			for (let j = 0; j < pixelIndex.length; j++) {
				const pixel = {};
				pixel.r = color.r;
				pixel.g = color.g;
				pixel.b = color.b;
				pixel.i = pixelIndex[j];
				qIpixels.push(pixel);
			}
			return [color]; // an array element
		}
		/**  Find the color channel (r,g or b) with biggest range */
		const componentToSortBy = findLargestColorRange(rgbValues);

		/**  Sort rgb array values on this channel (from lowest to highest values) */
		rgbValues.sort((p1, p2) => { return p1[componentToSortBy] - p2[componentToSortBy]; });

		/**  Divide the sorted array at mid-point */
		const mid = rgbValues.length / 2;

		return [
			...quantization(rgbValues.slice(0, mid), depth + 1),
			...quantization(rgbValues.slice(mid), depth + 1),
		];
	};

	/** Sample imageData: 4 values at a time (r, g, b, and alpha) for each pixel 
	 * Alpha assumed to be 255, i.e. fully opaque, and is ignored. The sequential 
	 * index of each pixel is added for image reconstruction later */
	const buildRgb = (imageData) => {
		const rgbValues = [];
		let j = 0;
		for (let k = 0; k < imageData.length; k += 4) {
			const rgb = {
				r: imageData[k],
				g: imageData[k + 1],
				b: imageData[k + 2],
				i: j,
			};
			j++;
			rgbValues.push(rgb);
		}
		return rgbValues;
	};
};

/** resets upload form and clears the image canvases and palettes */
const reset = () => {
	form.reset();
	clean_canvas_and_palette();
}

/** resets image canvases and palettes */
const clean_canvas_and_palette = () => {
	paletteContainer.innerHTML = '';
	compContainer.innerHTML = '';
	sIcanvas.width = qIcanvas.width = 0;
	sIcanvas.height = qIcanvas.height = 0;
	ctx.clearRect(0, 0, sIcanvas.width, sIcanvas.height);
	ctx1.clearRect(0, 0, qIcanvas.width, qIcanvas.height);
	spinner.style.visibility = spinner1.style.visibility = 'hidden';
	fileName.innerHTML = '';
	num_colors.innerHTML = 'n';
};
resetBtn.addEventListener('click', reset);
loadBtn.addEventListener('click', main);
reset();
