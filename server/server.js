const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

const apiRoute = "/api/v1/";
const publicFolder = "../public/";
const port = 3000;

const rooms = {};

app.use(express.static(path.join(__dirname, publicFolder)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, publicFolder, "index.html"));
});

app.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, publicFolder, "hangman.html"));
});

io.on("connection", (socket) => {
  socket.on("registerPlayer", () => {
    socket.emit("playerAssigned", crypto.randomUUID());
  });

  socket.on("getRoomInfo", (roomID) => {
    if (rooms[roomID]) {
      const foundRoomData = rooms[roomID];
      socket.emit("roomInfo", foundRoomData);
    }
  });

  socket.on(
    "joinRoom",
    (roomID, playerUUID, gamemode = "switch", mode = "join") => {
      if (playerUUID === null) {
        playerUUID = crypto.randomUUID();
        socket.emit("playerAssigned", playerUUID);
      }

      if (mode === "create") {
        roomID = crypto.randomBytes(5).toString("hex");
      }

      if (!rooms[roomID] && mode === "create") {
        rooms[roomID] = {};
        rooms[roomID]["gamemode"] = gamemode;
        rooms[roomID]["players"] = [playerUUID];
      } else if (rooms[roomID]) {
        const currentRoom = rooms[roomID];

        if (currentRoom["players"].includes(playerUUID)) {
          return;
        }

        currentRoom["players"].push(playerUUID);

        rooms[roomID] = currentRoom;
      }

      if (!rooms[roomID]) {
        socket.emit("error", { message: "No room found with ID: " + roomID });
        return;
      }

      socket.emit("joinedRoom", roomID);

      socket.join(roomID);
      console.log(rooms);
    }
  );

  socket.on("leaveRoom", (roomID, playerUUID) => {
    if (!rooms[roomID]) {
      return;
    }

    let currentRoom = rooms[roomID];

    if (!currentRoom["players"].includes(playerUUID)) {
      return;
    }

    const playerIndex = currentRoom["players"].findIndex((player) => {
      player === playerUUID;
    });

    currentRoom["players"].splice(playerIndex, 1);

    if (currentRoom["players"].length === 0) {
      // Simply frees up memory
      delete rooms[roomID];
    }
    console.log(rooms);
  });
});

server.listen(port, () => {
  console.log("Listening on port", port);
});
