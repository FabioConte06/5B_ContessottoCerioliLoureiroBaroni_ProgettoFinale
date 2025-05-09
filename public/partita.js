const partita = () => {
    return {
        setup: () => {
            console.log("conferma")
            const cellSize = 50;
            const rows = 10;
            const cols = 10;
            const canvasAlly = document.getElementById('canvas1');
            const canvasEnemy = document.getElementById('canvas2');
            const ctxAlly = canvas1.getContext('2d');
            const ctxEnemy = canvas2.getContext('2d');
            const turnoText = document.getElementById('turno');
            const nextTurn = document.getElementById('nextTurn');
            const form = document.getElementById('form');
            const overlay = document.getElementById('overlay');

            let gridAlly = Array.from({ length: rows }, () => Array(cols).fill(0));
            let gridEnemy = Array.from({ length: rows }, () => Array(cols).fill(0));
            let turno = Math.floor(Math.random() * 2);

            function shuffle(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            }
            
            function getPossiblePositions(length) {
                const positions = [];
            
                for (let y = 0; y < 10; y++) {
                    for (let x = 0; x <= 10 - length; x++) {
                        positions.push({ x, y, dir: 0 }); // Horizontal
                    }
                }
            
                for (let y = 0; y <= 10 - length; y++) {
                    for (let x = 0; x < 10; x++) {
                        positions.push({ x, y, dir: 1 }); // Vertical
                    }
                }
            
                shuffle(positions);
                return positions;
            }
            
            function canPlace(grid, x, y, dir, length) {
                for (let i = 0; i < length; i++) {
                    const nx = x + (dir === 0 ? i : 0);
                    const ny = y + (dir === 1 ? i : 0);
                    if (grid[ny][nx] !== 0) return false;
                }
                return true;
            }
            
            function place(grid, x, y, dir, length) {
                for (let i = 0; i < length; i++) {
                    const nx = x + (dir === 0 ? i : 0);
                    const ny = y + (dir === 1 ? i : 0);
                    grid[ny][nx] = 1;
                }
            }
            
            function placeShip(grid, length, count) {
                const positions = getPossiblePositions(length);
                let placed = 0;
            
                for (let pos of positions) {
                    if (placed >= count) break;
                    if (canPlace(grid, pos.x, pos.y, pos.dir, length)) {
                        place(grid, pos.x, pos.y, pos.dir, length);
                        placed++;
                    }
                }
            }
            
            // Posiziona le navi
            placeShip(gridAlly, 4, 1); // Portaerei
            placeShip(gridAlly, 3, 2); // Incrociatori
            placeShip(gridAlly, 2, 3); // Torpedinieri
            placeShip(gridAlly, 1, 4); // Sommergibili
            
            
            // Disegna la griglia
            function drawGrid(ctx, grid, hideShips) {
                console.log("griglia")
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
                console.log("update")
                drawGrid(ctxAlly, gridAlly, turno !== 1);
                drawGrid(ctxEnemy, gridEnemy, turno !== 2);
                turnoText.innerText = `Turno: Giocatore ${turno}`;
            }
            
            nextTurn.onclick = function() {
                console.log("click")
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
            
            gestisciClick(canvasAlly, gridAlly);
            gestisciClick(canvasEnemy, gridEnemy);
            aggiorna();
            
        }
    };
};