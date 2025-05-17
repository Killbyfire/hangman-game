const express = require("express");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicFolder = "../public/";
const port = 3000;

const rooms = {};

app.use(express.static(path.join(__dirname, publicFolder)));

server.listen(port, () => {
  console.log("Listening on port", port);
});
