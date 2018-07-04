var pixelPainter = (function () {
  // Set variables only accesible within the pixelPainter scope
  let websocket   = null,
      columns     = 20,
      rows        = 20,
      colours     = ["red", "orange", "yellow", "green", "blue", "purple", "white"],
      userInput   = null,
      joinBtn     = null,
      sendBtn     = null,
      messageList = null,
      palette     = null,
      swatches    = [],
      rowsInput   = null,
      colsInput   = null,
      grid        = null,
      cells       = [],
      x           = null,
      y           = null;

  const settings = {
    username: null,
    colour: colours[0],
    painting: false,
  }

  // The first function that is run and is the only public variable
  function _initialise () {
    websocket   = new WebSocket("ws://" + window.location.host + "/ws");
    userInput   = document.querySelector(".js-user-input");
    joinBtn     = document.querySelector(".js-join-btn");
    sendBtn     = document.querySelector(".js-send-btn");
    messageList = document.querySelector(".js-message-list");
    palette     = document.querySelector(".js-palette");
    rowsInput   = document.querySelector(".js-rows-input");
    colsInput   = document.querySelector(".js-cols-input");
    grid        = document.querySelector(".js-grid");

    _onbind();
    _createPalette();
    _createGrid();
  }

  // Binds all the event listners to the DOM and WebSocket
  function _onbind (e) {
    websocket.onmessage = _messageRecieved;
    joinBtn.onclick     = _join;
    sendBtn.onclick     = _send;
    rowsInput.oninput   = _changeRows;
    colsInput.oninput   = _changeCols;

    rowsInput.value     = rows;
    colsInput.value     = columns;
  }

  // Handels the messages that are received from the WebSocket
  function _messageRecieved (e) {
    const msg = JSON.parse(e.data);
    const message = document.createElement("div");
          message.className = "css-message-item";
          msg.username = msg.username || "Anonymous";

    switch (msg.message) {
      case "colour":
        const swatch = swatches.find((swatch) => {
          return swatch.colour === msg.colour;
        });

        swatch.selectColour();
        message.innerHTML = msg.username + ": has selected the colour " + msg.colour;
        break;
      case "paint":
        console.clear();

        xRange = [];
        yRange = [];

        if (x) {
          // X
          step = 1;
          start = x;
          end = msg.x;

          if (end < start) {
            step = -step;
          }

          while (step > 0 ? end >= start : end <= start) {
            xRange.push(start);
            start += step;
          }

          // Y
          step = 1;
          start = y;
          end = msg.y;

          if (end < start) {
            step = -step;
          }

          while (step > 0 ? end >= start : end <= start) {
            yRange.push(start);
            start += step;
          }
        }

        console.log(xRange);
        console.log(yRange);


        // if (x) {
        //   console.log("lastX", x);
        //   var xDiff = Math.abs(x - msg.x);
        //   for (var i = 0; i < xDiff; i++) {
        //     console.log("midX_"+i, x+i);
        //   }
        //   console.log("X", msg.x);
        //
        //   console.log("lastY", y);
        //   var yDiff = Math.abs(y - msg.y);
        //   for (var i = 0; i < yDiff; i++) {
        //     console.log("midY_"+i, y+i);
        //   }
        //   console.log("Y", msg.y);
        // }

        // console.log("lastX", x);
        // console.log("lastY", y);
        // console.log("midX", (msg.x+x) / 2);
        // console.log("midY", (msg.y+y) / 2);
        // console.log("X", msg.x);
        // console.log("Y", msg.y);

        const cell = cells.find((cell) => {
          return cell.x === msg.x && cell.y === msg.y;
        });

        cell.paint();

        message.innerHTML = msg.username + ": has painted cell x:" + msg.x + " y:" + msg.y;

        x = msg.x;
        y = msg.y;
        break;
      case "rows":
        rowsInput.value = msg.rows;
        message.innerHTML = msg.username + ": has changed the number of rows to " + msg.rows;

        rows = msg.rows;
        _createGrid();
        break;
      case "cols":
        colsInput.value = msg.cols;
        message.innerHTML = msg.username + ": has changed the number of cols to " + msg.cols;

        columns = msg.cols;
        _createGrid();
        break;
      default:
        message.innerHTML = msg.username + ": " + msg.message;
    }

    messageList.append(message);
    messageList.scrollTop = messageList.scrollHeight; // auto scroll to the bottom
  }

  // Sets the username when the join button is clicked
  function _join () {
    settings.username = userInput.value;

    userInput.value = "";
    userInput.setAttribute("placeholder", "enter message");

    joinBtn.setAttribute("style", "display: none;");
    sendBtn.setAttribute("style", "display: inline-block;");
  }

  // Sends the username and message to the WebSocket when the send button is clicked
  function _send () {
    if (userInput.value != "") {
      websocket.send(
        JSON.stringify({
          username: settings.username,
          message: userInput.value
        }
      ));

      userInput.value = "";
    }
  }

  // Creates swactches
  function _createPalette () {
    for (let i = 0; i < colours.length; i++) {
      swatches.push(
        new Swatch(websocket, settings, palette, colours[i])
      )
    }
  }

  // Creates a grid of cells
  function _createGrid () {
    // Clear the cells and elements from the array and grid element
    cells = [];
    grid.innerHTML = "";

    // Sets the css grid columns and rows
    grid.setAttribute("style", "grid-template-columns: repeat(" + columns + ", 1fr);\
                                grid-template-rows: repeat(" + rows + ", 1fr);");

    // Creates each cell
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        cells.push(
          new Cell(websocket, settings, grid, x, y)
        )
      }
    }
  }

  // Changes the amount of rows
  function _changeRows() {
    websocket.send(
      JSON.stringify({
        username: settings.username,
        message: "rows",
        rows: rowsInput.value,
      }
    ));
  }

  // Changes the amount of rows
  function _changeCols() {
    websocket.send(
      JSON.stringify({
        username: settings.username,
        message: "cols",
        cols: colsInput.value,
      }
    ));
  }

  return {
    initialise: () => {
      _initialise();
    }
  };
})();

pixelPainter.initialise();
