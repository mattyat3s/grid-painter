class Swatch {
  constructor (websocket, settings, palette, colour) {
    this.websocket = websocket;
    this.settings  = settings;
    this.palette   = palette;
    this.colour    = colour;
    this.show();
  }

  show () {
    this.el = document.createElement("div");

    this.el.className = "css-palette-swatch";
    this.el.setAttribute("style", "background-color: " + this.colour);
    this.el.onmousedown = () => {
      this.sendColour();
    };

    // if this is the default "red" the select this swatch
    if (this.colour === this.settings.colour) {
      this.selectColour();
    }

    this.palette.append(this.el);
  }

  sendColour() {
    this.websocket.send(
      JSON.stringify({
        username: this.settings.username,
        message: "colour",
        colour: this.colour,
      }
    ));
  }

  selectColour () {
    this.settings.colour = this.colour;

    this.palette.childNodes.forEach((swatch) => {
      swatch.className = "css-palette-swatch";
    })

    this.el.className = "css-palette-swatch js-palette-swatch-selected";

    this.visible = !this.visible;
  }
}
