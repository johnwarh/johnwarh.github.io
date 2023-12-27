// palette background color control elements
const bkgd_color = document.getElementById("bkgd_color"), // the palette bkgd color range input
    reset_bkgd = document.getElementById('bkdg_color_reset'), // reset bkgd color input btn
    hide_palette_text = document.getElementById('hide_caps'); // show/hide palette text btn

// assemble bkgd color hex code and set text color
const setPaletteColor = (rgb) => {
    const palette = document.getElementById("palette") // where coloe swatches are displayed
        complementary = document.getElementById('complementary'), // where complementary color swatches are displayed
        p_bkgd = document.getElementById('p_bkgd'); // bkgd color hex code displayed here

    var hex = rgb.toString(16).toUpperCase();
    if (hex.length < 2) { hex = '0' + hex; } // zero pad as needed
    var hex_color = "#" + hex + hex + hex;  // hex 000000-ffffff
    palette.style.backgroundColor = hex_color;
    complementary.style.backgroundColor = hex_color
    p_bkgd.innerHTML = hex_color; // display palette bkgd color hex value in form
    //  set text color to maintain high contrast ratio 
    if      (rgb < 32) {  setTextColor('#aaa'); }
    else if (rgb < 64) {  setTextColor('#bbb'); }
    else if (rgb < 96) {  setTextColor('#ddd'); }
    else if (rgb < 136) { setTextColor('#fff'); }
    else if (rgb < 160) { setTextColor('#000'); }
    else if (rgb < 192) { setTextColor('#333'); }
    else if (rgb < 224) { setTextColor('#444'); }
    else {                setTextColor('#555'); }
};

// change caption text color
const setTextColor = (color) => {
    var block = document.getElementsByClassName('cap_color'); // color of captions for color swatches
    for (var i = 0; i < block.length; i++) { block[i].style.color = color; }
};

// Show/Hide palette swatch text (captions)
const hideCaptions = () => {
    block = document.getElementsByClassName('cap_color');
    for (var i = 0; i < block.length; i++) {
        var attr = block[i].hasAttribute('hidden');
        if (attr == false) { block[i].setAttribute('hidden', 'hidden'); }
        else block[i].removeAttribute('hidden');
    }
};

//reset palette bkgd color
const paletteBkgdReset = () => { 
    setPaletteColor(128);
    setTextColor('fff');
};

// change palette background color
const changeBkgd = () => {
    var rgb = parseFloat(bkgd_color.value); // decimal 0-255 
    setPaletteColor(rgb);
};

reset_bkgd.addEventListener('click', paletteBkgdReset);
hide_palette_text.addEventListener('click', hideCaptions);
bkgd_color.addEventListener('change', changeBkgd);

changeBkgd();
paletteBkgdReset();
