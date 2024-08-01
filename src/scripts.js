import './styles.css';
import './assets/turdle-turtle.png';
// import { words } from './words.js';
const words = [];

fetch("http://localhost:3001/api/v1/words")
  .then(response => response.json())
  .then(data => words.push(...data))
  .catch(err => console.log(err));

// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';
var gamesPlayed = [];

// Query Selectors
var inputs = document.querySelectorAll('input');
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');
var gameOverBox = document.querySelector('#game-over-section');
var gameOverHeading = document.querySelector('#game-over-heading')
var gameOverInfo = document.querySelector('#game-over-text');
// var gameOverGuessCount = document.querySelector('#game-over-guesses-count');
// var gameOverGuessGrammar = document.querySelector('#game-over-guesses-plural');

// Event Listeners
window.addEventListener('load', setGame);

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('keyup', function () { moveToNextInput(event) });
}

for (var i = 0; i < keyLetters.length; i++) {
  keyLetters[i].addEventListener('click', function () { clickLetter(event) });
}

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Functions
function setGame() {
  currentRow = 1;
  winningWord = getRandomWord();
  console.log(winningWord)
  updateInputPermissions();
}

function getRandomWord() {
  var randomIndex = Math.floor(Math.random() * 2500);
  return words[randomIndex];
}

function updateInputPermissions() {
  for (var i = 0; i < inputs.length; i++) {
    if (!inputs[i].id.includes(`-${currentRow}-`)) {
      inputs[i].disabled = true;
    } else {
      inputs[i].disabled = false;
    }
  }
  inputs[0].focus();
}

function moveToNextInput(e) {
  var key = e.keyCode || e.charCode;

  if (key !== 8 && key !== 46) { // if not backspace and delete
    var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
    if (inputs.length > indexOfNext) { // added - stop changing focus if there's no next input
      inputs[indexOfNext].focus();
    }

  }
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].id.includes(`-${currentRow}-`) && !inputs[i].value && !activeInput) {
      activeInput = inputs[i];
      activeIndex = i;
    }
  }
  // after clicking the letter, focus on next input
  activeInput.value = e.target.innerText;
  if (inputs.length > activeIndex + 1) { //added - stop changing focus if there's no next input
    inputs[activeIndex + 1].focus();
  }

}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    compareGuess();
    if (checkForWin()) {
      recordGameStats(checkForWin())
      setTimeout(endGame, 1000);

    } else if (currentRow < 6) {
      changeRow();
    } else {
      recordGameStats(checkForWin())
      setTimeout(endGame, 1000);
    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
}



function checkIsWord() {
  guess = '';

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].id.includes(`-${currentRow}-`)) {
      guess += inputs[i].value;
    }
  }

  return words.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('');

  for (var i = 0; i < guessLetters.length; i++) {

    if (winningWord.includes(guessLetters[i]) && winningWord.split('')[i] !== guessLetters[i]) {
      updateBoxColor(i, 'wrong-location');
      updateKeyColor(guessLetters[i], 'wrong-location-key');
    } else if (winningWord.split('')[i] === guessLetters[i]) {
      updateBoxColor(i, 'correct-location');
      updateKeyColor(guessLetters[i], 'correct-location-key');
    } else {
      updateBoxColor(i, 'wrong');
      updateKeyColor(guessLetters[i], 'wrong-key');
    }
  }

}

function updateBoxColor(letterLocation, className) {
  var row = [];

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].id.includes(`-${currentRow}-`)) {
      row.push(inputs[i]);
    }
  }

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keyLetter = null;

  for (var i = 0; i < keyLetters.length; i++) {
    if (keyLetters[i].innerText === letter) {
      keyLetter = keyLetters[i];
    }
  }

  keyLetter.classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function endGame() {
  changeGameOverText();
  viewGameOverMessage();
  setTimeout(startNewGame, 4000);
}

function recordGameStats(result) {
  gamesPlayed.push({ solved: result, guesses: currentRow });
}

function changeGameOverText() {
  if (gamesPlayed[gamesPlayed.length - 1].solved) {
    let gameOverGuessGrammar = "";
    if (currentRow >= 2) {
      gameOverGuessGrammar = "es"
    } 
    gameOverHeading.textContent = "Yay!"
    gameOverInfo.textContent = `You did it! It took you ${currentRow} guess${gameOverGuessGrammar} to find the correct word.`
  }
  else {
    gameOverHeading.textContent = "Ouch!"
    gameOverInfo.textContent = `Better luck next time! The correct word was... ${winningWord}!`
  }
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  setGame();
  viewGame();
  inputs[0].focus();
}

function clearGameBoard() {
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
    inputs[i].classList.remove('correct-location', 'wrong-location', 'wrong');
  }
}

function clearKey() {
  for (var i = 0; i < keyLetters.length; i++) {
    keyLetters[i].classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  }
}

// Change Page View Functions

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  gameOverBox.classList.add('collapsed')
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}

function viewGameOverMessage() {
  gameOverBox.classList.remove('collapsed')
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
}
