const partita = () => {
    return {
        setup: () => {
            console.log("conferma")
            const cellSize = 50;
            const rows = 10;
            const cols = 10;
            const canvasAlly = document.getElementById('canvas1');
            const canvasEnemy = document.getElementById('canvas2');
            const ctxAlly = canvasAlly.getContext('2d');
            const ctxEnemy = canvasEnemy.getContext('2d');
            const turnoText = document.getElementById('turno');
            const nextTurn = document.getElementById('nextTurn');
            const form = document.getElementById('form');
            const overlay = document.getElementById('overlay');

            let gridAlly = Array.from({ length: rows }, () => Array(cols).fill(0));
            let gridEnemy = Array.from({ length: rows }, () => Array(cols).fill(0));
            const turno = Math.floor(Math.random() * 2);

            while (cond < 2) {
                let dir = Math.floor(Math.random() * 2) + 1;
            
                if (dir == 1) {
                    let posX = Math.floor(Math.random() * 7) + 0;
                    let posY = Math.floor(Math.random() * 9) + 0;
            
                    trovato = false
            
                    for (i = 0; i < 3; i++) {
                        if (gridAlly[posY][posX+i] == 1) {
                            trovato = true
                        }
                    }
            
                    if (trovato==false) {
                        for (i = 0; i < 3; i++) {
                            gridAlly[posY][posX+i] = 1
                        }
                        cond++
                    }
                }
            
                else {
                    let posX = Math.floor(Math.random() * 9) + 0;
                    let posY = Math.floor(Math.random() * 7) + 0;
            
                    trovato = false
            
                    for (i = 0; i < 3; i++) {
                        if (gridAlly[posY+i][posX] == 1) {
                            trovato = true
                        }
                            
                    }
            
                    if (trovato==false) {
                        for (i = 0; i < 3; i++) {
                            gridAlly[posY+i][posX] = 1
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
                        if (gridAlly[posY][posX+i] == 1) {
                            trovato = true
                        }
                    }
            
                    if (trovato==false) {
                        for (i = 0; i < 2; i++) {
                            gridAlly[posY][posX+i] = 1
                        }
                        cond++
                    }
                }
            
                else {
                    let posX = Math.floor(Math.random() * 9) + 0;
                    let posY = Math.floor(Math.random() * 8) + 0;
            
                    trovato = false
            
                    for (i = 0; i < 2; i++) {
                        if (gridAlly[posY+i][posX] == 1) {
                            trovato = true
                        }
                            
                    }
            
                    if (trovato==false) {
                        for (i = 0; i < 2; i++) {
                            gridAlly[posY+i][posX] = 1
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
                
                if (gridAlly[posY][posX] == 1) {
                    trovato=true
                }
            
                if (trovato=false) {
                    gridAlly[posY][posX] = 1
                    cond++
                }
                
            }

            drawGrid(ctxAlly, gridAlly)
            
            // Disegna la griglia
            function drawGrid(ctx, grid, hideShips) {
                ctx.clearRect(0, 0, canvasAlly.width, canvasAlly.height);
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
            
        }
    };
};