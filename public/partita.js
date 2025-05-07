let currentUser = null;
const cellSize = 50;
const rows = 10;
const cols = 10;
const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');
const turnoText = document.getElementById('turno');
const nextTurn = document.getElementById('nextTurn');
const form = document.getElementById('form');
const overlay = document.getElementById('overlay');

let grid1 = Array.from({ length: rows }, () => Array(cols).fill(0));
let grid2 = Array.from({ length: rows }, () => Array(cols).fill(0));
let turno = 1;

// Funzione per piazzare le navi
function piazzaNave(grid, lunghezza, quantita) {
    let piazzate = 0;
    let tentativi = 0;
    while (piazzate < quantita && tentativi < 1000) {
        tentativi++;
        const dir = Math.floor(Math.random() * 2);
        const posX = Math.floor(Math.random() * (dir === 0 ? cols - lunghezza + 1 : cols));
        const posY = Math.floor(Math.random() * (dir === 1 ? rows - lunghezza + 1 : rows));
        let ok = true;

        for (let i = 0; i < lunghezza; i++) {
            const x = dir === 0 ? posX + i : posX;
            const y = dir === 1 ? posY + i : posY;
            if (grid[y][x] === 1) {
                ok = false;
                break;
            }
        }

        if (ok) {
            for (let i = 0; i < lunghezza; i++) {
                const x = dir === 0 ? posX + i : posX;
                const y = dir === 1 ? posY + i : posY;
                grid[y][x] = 1;
            }
            piazzate++;
        }
    }
}

// Piazzamento delle navi
[piazzaNave(grid1, 4, 1), piazzaNave(grid1, 3, 2), piazzaNave(grid1, 2, 3), piazzaNave(grid1, 1, 4)];
[piazzaNave(grid2, 4, 1), piazzaNave(grid2, 3, 2), piazzaNave(grid2, 2, 3), piazzaNave(grid2, 1, 4)];

// Disegna la griglia
function drawGrid(ctx, grid, hideShips) {
    ctx.clearRect(0, 0, canvas1.width, canvas1.height);
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
            } else if (grid[i][j] === 1 && !hideShips) {
                ctx.fillStyle = 'gray';
                ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }
    }
}

// Aggiorna la griglia
function aggiorna() {
    drawGrid(ctx1, grid1, turno !== 1);
    drawGrid(ctx2, grid2, turno !== 2);
    turnoText.innerText = `Turno: Giocatore ${turno}`;
}

nextTurn.onclick = function() {
  aggiorna();
  form.style.display = "none"
  overlay.style.display = "none"
}

// Gestione del click sulla griglia
function gestisciClick(canvas, gridNemico) {
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const j = Math.floor(x / cellSize);
        const i = Math.floor(y / cellSize);

        if (i >= 0 && i < rows && j >= 0 && j < cols) {
            if (gridNemico[i][j] === 1) {
                gridNemico[i][j] = 2;
                aggiorna();
            } else if (gridNemico[i][j] === 0) {
                gridNemico[i][j] = 3;
                turno = turno === 1 ? 2 : 1;
                form.style.display = "inline";
                overlay.style.display = "inline";
            }
        }
    });
}

gestisciClick(canvas1, grid1);
gestisciClick(canvas2, grid2);
aggiorna();

