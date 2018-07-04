class Cell {
  constructor (websocket, settings, grid, x, y) {
    this.websocket = websocket;
    this.settings  = settings;
    this.grid      = grid;
    this.x         = x;
    this.y         = y;
    this.show();
  }

  show () {
    this.el = document.createElement("div");
    this.el.className = "css-grid-cell";

    this.el.onmousedown = () => {
      this.startPainting()
    };
    this.el.onmouseover = (e) => {
      // only if mouse is clicked paint
      if (e.buttons === 1) {
        this.continuePainting();
      }
    };
    this.el.onmouseup = () => {
      this.stopPainting()
    };

    this.grid.append(this.el);
  }

  startPainting() {
    this.settings.painting = true;
    this.sendPaint();
  }
  continuePainting() {
    if (this.settings.painting) {
      this.sendPaint();
    }
  }
  stopPainting() {
    this.settings.painting = false;
  }

  sendPaint() {
    this.websocket.send(
      JSON.stringify({
        username: this.settings.username,
        message: "paint",
        x: this.x,
        y: this.y,
      }
    ));
  }

  paint () {
    this.el.setAttribute("style", "background-color: " + this.settings.colour);
  }
}
