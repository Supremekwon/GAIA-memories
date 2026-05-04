// static/js/pong.js

let animationFrameId;

let canvas, ctx;
let upPressed = false;
let downPressed = false;

let player, ai, ball;
const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 8;

window.playerScore = 0;
window.aiScore = 0;

function startPong() {
  // Initialize canvas and context here
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  // Initialize player paddle
  player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 6
  };

  // Initialize AI paddle
  ai = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 4
  };

  // Initialize ball
  ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 5,
    dx: 5,
    dy: 5
  };

  window.playerScore = 0;
  window.aiScore = 0;

  // Set up key event listeners only once
  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);

  resetBall();
  gameLoop();
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 5;
  ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
  ball.dy = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
}

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

function drawText(text, x, y, color = '#fff', size = '30px') {
  ctx.fillStyle = color;
  ctx.font = `${size} Arial`;
  ctx.fillText(text, x, y);
}

function draw() {
  drawRect(0, 0, canvas.width, canvas.height, '#111');

  for(let i = 0; i < canvas.height; i += 20) {
    drawRect(canvas.width / 2 - 1, i, 2, 10, '#fff');
  }

  drawRect(player.x, player.y, player.width, player.height, '#ff69b4');
  drawRect(ai.x, ai.y, ai.width, ai.height, '#ff69b4');

  drawCircle(ball.x, ball.y, ball.radius, '#ff69b4');

  drawText(window.playerScore, canvas.width / 4, 50);
  drawText(window.aiScore, canvas.width * 3 / 4, 50);
}

function move() {
  if (upPressed && player.y > 0) player.y -= player.dy;
  if (downPressed && player.y + player.height < canvas.height) player.y += player.dy;

  if (ai.y + ai.height / 2 < ball.y) ai.y += ai.dy;
  else ai.y -= ai.dy;

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) ball.dy = -ball.dy;

  if (
    ball.x - ball.radius < player.x + player.width &&
    ball.y > player.y &&
    ball.y < player.y + player.height
  ) {
    ball.dx = -ball.dx;
    ball.speed += 0.5;
  }

  if (
    ball.x + ball.radius > ai.x &&
    ball.y > ai.y &&
    ball.y < ai.y + ai.height
  ) {
    ball.dx = -ball.dx;
    ball.speed += 0.5;
  }

  if (ball.x - ball.radius < 0) {
    window.aiScore++;
    resetBall();
    window.gaiaReact('player_lost');
  } else if (ball.x + ball.radius > canvas.width) {
    window.playerScore++;
    resetBall();
    window.gaiaReact('player_won');
  }
}

function gameLoop() {
  move();
  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
}

function keyDownHandler(e) {
  if (e.key === 'ArrowUp') upPressed = true;
  else if (e.key === 'ArrowDown') downPressed = true;
}

function keyUpHandler(e) {
  if (e.key === 'ArrowUp') upPressed = false;
  else if (e.key === 'ArrowDown') downPressed = false;
}

function resetGame() {
  window.playerScore = 0;
  window.aiScore = 0;
  resetBall();
  cancelAnimationFrame(animationFrameId);
  gameLoop();
}

window.startPong = startPong;
window.resetGame = resetGame;
