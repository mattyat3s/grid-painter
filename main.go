package main

// I used the below tutorial
// https://scotch.io/bar-talk/build-a-realtime-chat-server-with-go-and-websockets

import (
  "log"
  "net/http"

  "github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]bool) // Connected clients
var broadcast = make(chan Message)           // Broadcast channel

// Configures the upgrader
// - is used to upgrade a GET request to a WebSocket
var upgrader = websocket.Upgrader{}

// Defines the message object
// - this needs to match the structure of the javascript object
type Message struct {
  Username string `json:"username"`
  Message  string `json:"message"`
  X        int    `json:"x"`
  Y        int    `json:"y"`
  Colour   string `json:"colour"`
  Rows     string `json:"rows"`
  Cols     string `json:"cols"`
}

func main() {
  // Create a simple file server
  // - this means everything in the public folder is served at the "/" root
  fs := http.FileServer(http.Dir("public"))
  http.Handle("/", fs)

  // Configure websocket route
  http.HandleFunc("/ws", handleConnections)

  // Start listening for incoming chat messages
  // - this is a goroutine
  // - need to understand these better
  go handleMessages()

  // Start the server on localhost port 3001 and log any errors
  // 3001 is used because of gin
  // - if you use gin run main.go
  //   - gin will serve it at localhost:3000
  // - if you use go run main.go
  //   - the site will be served at localhost:3001
  log.Println("http server started on :3001")
  err := http.ListenAndServe("localhost:3001", nil)
  if err != nil {
    log.Fatal("ListenAndServe: ", err)
  }
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
  // Upgrade initial GET request to a websocket
  ws, err := upgrader.Upgrade(w, r, nil)
  if err != nil {
    log.Fatal(err)
  }
  // Make sure we close the connection when the function returns
  defer ws.Close()

  // Register our new client
  clients[ws] = true

  for {
    var msg Message
    // Read in a new message as JSON and map it to a Message object
    err := ws.ReadJSON(&msg)
    if err != nil {
      log.Printf("error: %v", err)
      delete(clients, ws)
      break
    }
    // Send the newly received message to the broadcast channel
    broadcast <- msg
  }
}

func handleMessages() {
  for {
    // Grab the next message from the broadcast channel
    msg := <-broadcast
    // Send it out to every client that is currently connected
    for client := range clients {
      err := client.WriteJSON(msg)
      if err != nil {
        log.Printf("error: %v", err)
        client.Close()
        delete(clients, client)
      }
    }
  }
}
