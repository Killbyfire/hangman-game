var socket = io();

const createRoomSelect = document.querySelector(".createRoomSelect");
const createRoomButton = document.querySelector(".createRoomButton");

const joinRoomInput = document.querySelector(".joinRoomInput");
const joinRoomButton = document.querySelector(".joinRoomButton");

function getPlayerUUID() {
  return localStorage.getItem("playerUUID");
}

socket.on("connect", () => {
  if (!getPlayerUUID()) {
    socket.emit("registerPlayer");
  }

  socket.on("playerAssigned", (playerUUID) => {
    localStorage.setItem("playerUUID", playerUUID);
  });

  socket.on("joinedRoom", (roomID) => {
    location.href = location.origin + "/game" + "?room=" + roomID;
  });

  socket.on("error", (errorInfo) => {
    alert(errorInfo["message"]);
  });
});

createRoomButton.addEventListener("click", () => {
  socket.emit(
    "joinRoom",
    "",
    getPlayerUUID(),
    createRoomSelect.value,
    "create"
  );
});

joinRoomButton.addEventListener("click", () => {
  if (joinRoomInput.value.length < 5) {
    return;
  }

  socket.emit("joinRoom", joinRoomInput.value, getPlayerUUID());
});
