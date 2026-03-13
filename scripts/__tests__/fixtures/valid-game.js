// Simple valid game script
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let score = 0;
let gameRunning = true;

function update() {
  if (!gameRunning) return;
  score += 1;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f0';
  ctx.font = '24px monospace';
  ctx.fillText('Score: ' + score, 10, 30);
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();
