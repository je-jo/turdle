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
var statsTotalGames = document.querySelector('#stats-total-games');
var statsPercentCorrect = document.querySelector('#stats-percent-correct');
var statsAverageGuesses = document.querySelector('#stats-average-guesses');


// Event Listeners
window.addEventListener('load', setGame);

inputs.forEach(input => input.addEventListener('keyup', (event) => {
  moveToNextInput(event)
}));

keyLetters.forEach(keyLetter => keyLetter.addEventListener("click", (event) => {
  clickLetter(event)
}));

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
  inputs.forEach(input => {
    if (!input.id.includes(`-${currentRow}-`)) {
      input.disabled = true;
    } else {
      input.disabled = false;
    }
  })
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

  inputs.forEach((input, index) => {
    if (input.id.includes(`-${currentRow}-`) && !input.value && !activeInput) {
      activeInput = input;
      activeIndex = index;
    }
  })
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
    if (currentRow < 6 && !checkForWin()) {
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
  inputs.forEach(input => {
    if(input.id.includes(`-${currentRow}-`)) {
      guess += input.value
    }
  })
  return words.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('');

  guessLetters.forEach((letter, index) => {
    if (winningWord.includes(letter) && winningWord.split('')[index] !== letter) {
      updateBoxColor(index, 'wrong-location');
      updateKeyColor(letter, 'wrong-location-key');
    } else if (winningWord.split('')[index] === letter) {
      updateBoxColor(index, 'correct-location');
      updateKeyColor(letter, 'correct-location-key');
    } else {
      updateBoxColor(index, 'wrong');
      updateKeyColor(letter, 'wrong-key');
    }
  })



}

function updateBoxColor(letterLocation, className) {
  var row = [];

  inputs.forEach(input => {
    if (input.id.includes(`-${currentRow}-`)) {
      row.push(input);
    }
  })

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keySpan = null;

  keyLetters.forEach(keyLetter => {
    if (keyLetter.innerText === letter) {
      keySpan = keyLetter;
    }
  })
  
  keySpan.classList.add(className);
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
  changeStatText();
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

function changeStatText() {
  const totalGames = gamesPlayed.length;
  const wonGames = gamesPlayed.filter(game => game.solved);
  const percentCorrect = Math.round((wonGames.length / totalGames * 100) * 100) / 100
  const guesses = wonGames.map(game => game.guesses)
  const sumOfGuesses = guesses.reduce((acc, curr) => {
    acc += curr;
    return acc;
  }, 0)
  const averageGuesses = Math.round((sumOfGuesses / guesses.length) * 100) / 100
  statsTotalGames.textContent = totalGames;
  statsPercentCorrect.textContent = percentCorrect;
  statsAverageGuesses.textContent = averageGuesses;
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  setGame();
  viewGame();
  inputs[0].focus();
}

function clearGameBoard() {
  inputs.forEach(input => {
    input.value = '';
    input.classList.remove('correct-location', 'wrong-location', 'wrong')
  })
}

function clearKey() {
  keyLetters.forEach(keyLetter => {
    keyLetter.classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  })
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
