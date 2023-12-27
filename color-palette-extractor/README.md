# Create a color palette from an image

![Header image](/headerPhoto.jpg)

Using median cut algorithm & color quantization to obtain a color palette with 
complementary colors in plain Javascript and html.  Runs in a browser.

Changes from master (@ https://github.com/zygisS22/color-palette-extraction): 

	Added a new controls to permit changing the number of colors in the palette 
	output and a reset button to reset the form and html content.
 
	Changed sorting of output colors to use the lightness from the hsl color 
	system instead of the CIE luminance equation.  
	
	Removed code that excluded black, white and gray colors and rejected colors 
	using a color distance criteria.

	Modified palette color swatch layout, moving the swatch hex code text 
	below the swatch and adding the hsl color space values. Modified palette 
	swatch dimensions to w=120px by h=80px.
	
	Added ui control for the palette background color and show / hide switch for the 
	palette text content.
	
	Added customized CSS file (based on Bootstrap 5.3.2).
	
	Added code to do reconstruction and display of image with calculated color palette. 11/29/23
	
	Modified CSS: added Bootstrap 5.3.2, with cdn delivery, with a small custom.css file. 11/29/23

	Modified palette swatch dimensions to w=100px by h=60px. 12/01/23

	Optimized code in buildPalette() function:  created one function to build palette HTML
	framework for both color and complimentary color palettes. 12/02/23

	Code cleanup Code cleanup. 12/06/23
		In mccq.js:
			Moved all the functions called inside main(), into main() to localize the qIpixels 
			array which needed to be global before this change.
			Renamed function bld_pal() to build_html().
			Changed all double quotes (") to single quote(').

		in bkgd_controls.js:
			Renamed hideCapps() to hideCaptions(). also 
			Renamed paletteReset() to paletteBkgdReset().
			Added a few ';' to const declarations missing them.
			Moved declarations for 'palette' and 'complementary' elements
		in setBkgdHex():
			Removed 'caption_colors' variable and moved element references
			into setTextColor() and hideCaptions() functions.
			Modified setBkgdHex(), removing all the unnecessary '>=' tests.
			Renamed setBkgdHex() to setPaletteColor().

		In custom.css
		Changed background color for range control thumbslider in custom.css to increase contrast with background.

		Updated headerPhoto.jpg



## How to run

Clone the repository and open the index.html file in a browser.

Internet access is required to download Bootstrap css and js files.
