const startScreen = document.getElementById('start-screen');
const menuScreen = document.getElementById('menu-screen');
const gameFrame = document.getElementById('game-frame');
const gameCanvas = document.getElementById('game-canvas');
const gaiaComment = document.getElementById('gaia-comment');
const restartBtn = document.getElementById('restart-btn');
const backBtn = document.getElementById('back-btn');
const startGameBtn = document.getElementById('start-game-btn');
const pointsToWinInput = document.getElementById('points-to-win');

let currentGame = null; // track current game
let winningPoints = 5;  // default winning points for pong

// Gaia's reactions
function gaiaReact(event) {
  switch(event) {
    case 'player_won':
      gaiaComment.textContent = "🎉 You scored! Nice shot!";
      break;
    case 'player_lost':
      gaiaComment.textContent = "😢 Oh no, Gaia’s got this! YOU HAVE TO LOCK IN!";
      break;
    case 'start':
      gaiaComment.textContent = "Let's play! Use Up/Down arrows to move your paddle.";
      break;
    default:
      gaiaComment.textContent = "Let's play! Have fun!";
  }
}

window.gaiaReact = gaiaReact;

// Show or hide the start, menu, and game UI elements
function showStartScreen(show) {
  startScreen.style.display = show ? 'block' : 'none';
}
function showMenuScreen(show) {
  menuScreen.style.display = show ? 'block' : 'none';
}
function showGameUI(show) {
  gameFrame.style.display = show ? 'flex' : 'none';
}

// Show or hide game-specific elements inside game frame (canvas, comment, controls)
function toggleGameElements(show) {
  gameCanvas.style.display = show ? 'block' : 'none';
  gaiaComment.style.display = show ? 'block' : 'none';
  restartBtn.parentElement.style.display = show ? 'block' : 'none';
}

// When user clicks a game button on start screen
document.querySelectorAll('.game-select-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentGame = btn.getAttribute('data-game');
    if (currentGame === 'pong') {
      // Show menu screen with points input instead of starting game immediately
      showStartScreen(false);
      showMenuScreen(true);
      showGameUI(false);
      toggleGameElements(false);
      // Reset default points value
      pointsToWinInput.value = 5;
    } else {
      gaiaComment.textContent = "This game is not available yet!";
      showStartScreen(true);
      showMenuScreen(false);
      showGameUI(false);
      toggleGameElements(false);
    }
  });
});

// When user clicks "Start Game" on menu screen
startGameBtn.addEventListener('click', () => {
  winningPoints = parseInt(pointsToWinInput.value, 10) || 5;  // fallback to 5

  showMenuScreen(false);
  showGameUI(true);
  toggleGameElements(true);

  gaiaReact('start');

  if (currentGame === 'pong' && typeof startPong === 'function') {
    // Pass the winningPoints to the Pong game, for example:
    if (typeof setWinningPoints === 'function') {
      setWinningPoints(winningPoints);
    }
    startPong();
  }
});

// Restart button restarts the current game
restartBtn.addEventListener('click', () => {
  if (currentGame === 'pong' && typeof resetGame === 'function') {
    resetGame();
    gaiaReact('start');
  }
});

// Back button returns to start screen, stops game loop
backBtn.addEventListener('click', () => {
  if (currentGame === 'pong' && typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(animationFrameId);  // stop pong animation loop
  }
  currentGame = null;
  showStartScreen(true);
  showMenuScreen(false);
  showGameUI(false);
  toggleGameElements(false);
});
