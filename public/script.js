const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const cellSize = 50;
const rows = 10;
const cols = 10;

// Matrice 10x10: 0 = acqua, 1 = nave, 2 = colpito nave, 3 = colpito acqua
let grid = [];

// Inizializza la matrice a 0 (solo acqua)
for (let i = 0; i < rows; i++) {
  grid[i] = [];
  for (let j = 0; j < cols; j++) {
    grid[i][j] = 0;
  }
}

//PortaAerei
let dir = Math.floor(Math.random() * 2) + 1;

if (dir == 1) {
    let posX = Math.floor(Math.random() * 6) + 0;
    let posY = Math.floor(Math.random() * 9) + 0;

    for (i = 0; i < 4; i++) {
        grid[posY][posX+i] = 1
    }
}
else if (dir = 2) {
    let posX = Math.floor(Math.random() * 9) + 0;
    let posY = Math.floor(Math.random() * 6) + 0;

    for (i = 0; i < 4; i++) {
        grid[posY+i][posX] = 1
    }
}

let trovato = false

let cond = 0

//Incrociatori
while (cond < 2) {
    let dir = Math.floor(Math.random() * 2) + 1;

    if (dir == 1) {
        let posX = Math.floor(Math.random() * 7) + 0;
        let posY = Math.floor(Math.random() * 9) + 0;

        trovato = false

        for (i = 0; i < 3; i++) {
            if (grid[posY][posX+i] == 1) {
                trovato = true
            }
        }

        if (trovato==false) {
            for (i = 0; i < 3; i++) {
                grid[posY][posX+i] = 1
            }
            cond++
        }
    }

    else {
        let posX = Math.floor(Math.random() * 9) + 0;
        let posY = Math.floor(Math.random() * 7) + 0;

        trovato = false

        for (i = 0; i < 3; i++) {
            if (grid[posY+i][posX] == 1) {
                trovato = true
            }
                
        }

        if (trovato==false) {
            for (i = 0; i < 3; i++) {
                grid[posY+i][posX] = 1
            }
            cond++
        }   
    }
}

cond = 0

//Torpedinieri
while (cond < 3) {
    let dir = Math.floor(Math.random() * 2) + 1;

    if (dir == 1) {
        let posX = Math.floor(Math.random() * 8) + 0;
        let posY = Math.floor(Math.random() * 9) + 0;

        trovato = false

        for (i = 0; i < 2; i++) {
            if (grid[posY][posX+i] == 1) {
                trovato = true
            }
        }

        if (trovato==false) {
            for (i = 0; i < 2; i++) {
                grid[posY][posX+i] = 1
            }
            cond++
        }
    }

    else {
        let posX = Math.floor(Math.random() * 9) + 0;
        let posY = Math.floor(Math.random() * 8) + 0;

        trovato = false

        for (i = 0; i < 2; i++) {
            if (grid[posY+i][posX] == 1) {
                trovato = true
            }
                
        }

        if (trovato==false) {
            for (i = 0; i < 2; i++) {
                grid[posY+i][posX] = 1
            }
            cond++
        }
        
    }
}

cond = 0

//Sommergibili
while (cond <4) {
    let posX = Math.floor(Math.random() * 9) + 0;
    let posY = Math.floor(Math.random() * 9) + 0;

    trovato=false
    
    if (grid[posY][posX] == 1) {
        trovato=true
    }

    if (trovato=false) {
        grid[posY][posX] = 1
        cond++
    }
    
}

// Funzione per disegnare la griglia
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      ctx.strokeStyle = 'black';
      ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);

      if (grid[i][j] === 2) { // Colpito nave
        ctx.fillStyle = 'red';
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
      if (grid[i][j] === 3) { // Colpito acqua
        ctx.fillStyle = 'lightblue';
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }
}

// Gestisci click
canvas.addEventListener('click', function(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const j = Math.floor(x / cellSize); // Colonna
  const i = Math.floor(y / cellSize); // Riga

  // Controlla che sia dentro i limiti
  if (i >= 0 && i < rows && j >= 0 && j < cols) {
    if (grid[i][j] === 1) {
      grid[i][j] = 2; // Colpito nave
    } else if (grid[i][j] === 0) {
      grid[i][j] = 3; // Colpito acqua
    }
  }

  drawGrid();
});

// Disegna la griglia iniziale
drawGrid();
