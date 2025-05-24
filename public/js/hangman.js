const hangmanContainer = document.querySelector(".hangmanContainer");
const guessContainer = document.querySelector(".guessContainer");
const correctGuessContainer = document.querySelector(".correctContainer");

const guessesLeftText = document.querySelector(".guessesLeft");
const alertDialog = document.querySelector(".guessInput .alertDialog");
const guessInput = document.querySelector(".guessInput input");

const resetButton = document.querySelector(".resetButton");
const giveUpButton = document.querySelector(".giveUpButton");

const maxGuesses = 6;
let guessesLeft = maxGuesses;

const wordListLanguage = "dutch";
let currentRoomID = "";

function getPlayerUUID() {
  return localStorage.getItem("playerUUID");
}

const currentUrl = location.href;
if (currentUrl.includes("?room=")) {
  // Get the current room url out of the url
  currentRoomID = currentUrl.split("?room=")[1].split("&")[0];
}

var socket = io();

// Add support for spaces
let pickedWord = "temp";
let pickedWordArray = pickedWord.split("");

let correctGuessedLetters = [];
let currentGuessedLetters = [];

resetButton.addEventListener("click", (ev) => {
  resetGame();
});

giveUpButton.addEventListener("click", (ev) => {
  alert(`The word was: ${pickedWord}`);
  resetGame();
});

guessInput.addEventListener("keyup", (ev) => {
  const currentLetter = ev.target.value.trim();

  if (!currentLetter) {
    return;
  }

  guessInput.value = "";

  if (currentGuessedLetters.includes(currentLetter)) {
    alertDialog.innerText = `Letter ${currentLetter} is al gegokt`;
    return;
  }

  alertDialog.innerText = "";

  let notInWord = true;
  pickedWordArray.forEach((pickedWordLetter, index) => {
    if (pickedWordLetter === currentLetter) {
      notInWord = false;
      correctGuessedLetters[index] = currentLetter;
    }
  });

  if (notInWord) {
    guessesLeft -= 1;
  }

  currentGuessedLetters.push(currentLetter);

  UpdateGuessedLetters();
});

function generatePlaceholderNumbers() {
  const pickedWordLength = pickedWord.length;
  for (let i = 0; i < pickedWordLength; i++) {}
}

UpdateGuessedLetters();

function UpdateGuessedLetters() {
  guessContainer.innerHTML = "";
  correctGuessContainer.innerHTML = "";
  guessesLeftText.innerHTML = "";

  if (guessesLeft <= 0) {
    alert(`You lost! The word was: ${pickedWord}`);
  }

  if (correctGuessedLetters.join("") === pickedWord) {
    alert(`You won! The word was: ${pickedWord}`);
  }

  guessesLeftText.innerText = `Guesses left: ${guessesLeft}`;

  currentGuessedLetters.forEach((guessedLetter) => {
    const letterSpan = document.createElement("span");

    letterSpan.classList.add("guessedLetter");
    letterSpan.innerText = guessedLetter;

    guessContainer.appendChild(letterSpan);
  });

  pickedWord.split("").forEach((wordLetter, index) => {
    const letterSpan = document.createElement("span");

    letterSpan.classList.add("guessedLetter");

    if (correctGuessedLetters[index] === wordLetter) {
      letterSpan.innerText = wordLetter;
    } else {
      letterSpan.innerText = "_";
    }

    correctGuessContainer.appendChild(letterSpan);
  });
}

async function pickNewWord() {
  const wordList = await fetch(`/assets/${wordListLanguage}.txt`);

  const text = await wordList.text();
  const lines = text.split("\n");

  return lines[Math.floor(Math.random() * lines.length)].trim();
}

async function resetGame() {
  pickedWord = await pickNewWord();
  pickedWordArray = pickedWord.split("");

  correctGuessedLetters = [];
  currentGuessedLetters = [];

  guessesLeft = maxGuesses;

  UpdateGuessedLetters();
}

resetGame();

socket.on("connect", () => {
  socket.on("disconnect", () => {
    socket.emit("leaveRoom", currentRoomID, getPlayerUUID());
  });
});
