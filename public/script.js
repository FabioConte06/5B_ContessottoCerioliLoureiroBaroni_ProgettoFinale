const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cellSize = 50;
const rows = 10;
const cols = 10;

let grid = Array.from({ length: rows }, () => Array(cols).fill(0));
function piazzaNave(lunghezza, quantita) {
  let piazzate = 0;
  let tentativi = 0;
  while (piazzate < quantita && tentativi < 1000) {
    tentativi++;
    let dir = Math.floor(Math.random() * 2);
    let posX = Math.floor(Math.random() * (dir === 0 ? cols - lunghezza + 1 : cols));
    let posY = Math.floor(Math.random() * (dir === 1 ? rows - lunghezza + 1 : rows));
    let ok = true;
    for (let i = 0; i < lunghezza; i++) {
      let x = dir === 0 ? posX + i : posX;
      let y = dir === 1 ? posY + i : posY;
      if (grid[y][x] === 1) {
        ok = false;
        break;
      }
    }
    if (ok) {
      for (let i = 0; i < lunghezza; i++) {
        let x = dir === 0 ? posX + i : posX;
        let y = dir === 1 ? posY + i : posY;
        grid[y][x] = 1;
      }
      piazzate++;
    }
  }
}
piazzaNave(4, 1);
piazzaNave(3, 2);
piazzaNave(2, 3);
piazzaNave(1, 4);
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      ctx.strokeStyle = 'black';
      ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
      if (grid[i][j] === 2) {
        ctx.fillStyle = 'red';
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      } else if (grid[i][j] === 3) {
        ctx.fillStyle = 'lightblue';
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }
}

canvas.addEventListener('click', function(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const j = Math.floor(x / cellSize);
  const i = Math.floor(y / cellSize);

  if (i >= 0 && i < rows && j >= 0 && j < cols) {
    if (grid[i][j] === 1) {
      grid[i][j] = 2;
    } else if (grid[i][j] === 0) {
      grid[i][j] = 3;
    }
    drawGrid();
  }
});
drawGrid();
