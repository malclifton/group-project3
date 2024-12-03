var rows = 4;
var columns = 4;

var currentTile; //selected tile
var targetTile; //blank tile 

var turns = 0;  //moves made counter
var imgOrder = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"]; //array of images

let timerInterval;
let timerExpired = false;
let shuffleHistory = [];    //array to keep track of shuffle
let countdown = 180;        //timer

let currentImageSet = "image1"; //default image background folder

window.onload = function () {
    const savedSet = localStorage.getItem("selectedImageSet");  //store choice so it loads up even if the page is reloaded
    if (savedSet) {
        currentImageSet = savedSet; // load saved set
        document.getElementById("imageSetSelect").value = savedSet; // update dropdown
    }

    const audio = document.getElementById("gameAudio"); //get game audio
    audio.play().catch(() => {      
        //styling the audio button
        const unmuteButton = document.createElement("button");
        unmuteButton.innerText = "♬⋆.˚";
        unmuteButton.style.position = "absolute";
        unmuteButton.style.top = "10px";
        unmuteButton.style.left = "10px";
        unmuteButton.style.width = "60px";
        unmuteButton.style.borderRadius = "50%"
        unmuteButton.style.zIndex = "1000";
        document.body.appendChild(unmuteButton);

        unmuteButton.addEventListener("click", () => {
            audio.play();
            document.body.removeChild(unmuteButton); 
        });
    });
    
    // Add CSS for movable tiles hover effect
    const style = document.createElement('style');
    style.textContent = `
    .movable:hover {
        opacity: 0.7;
        transform: scale(1.05);
    }
    `;
    document.head.appendChild(style);
    
    shuffleArray(imgOrder);
    displayBoard();
    startTimer();

    const imageSetSelect = document.getElementById("imageSetSelect"); //get users choosen background
    imageSetSelect.addEventListener("change", changeImageSet);  //set change

    //when shuffle button is clicked
    document.getElementById("shuffle").addEventListener("click", () => {
        shuffleArray(imgOrder);
        displayBoard();
        turns = 0;
        document.getElementById("turns").innerText = "0 moves made";
        restartAudio();
    });

    //when solve button is clicked
    document.getElementById("solve").addEventListener("click", solvePuzzle);

    //button for playagain? on popup
    document.getElementById("playAgain").addEventListener("click", () => {
       closeWinPopup();
        restartGame();
    });

    //button for quit? on popup
    document.getElementById("goHome").addEventListener("click", () => {
        window.location.href = "./fifteen.html";
    });

    // Event listener for the Hint button
    document.getElementById('hintButton').addEventListener('click', function () {
        highlightHintMove(imgOrder);
    });
};


function changeImageSet() {
    const selectedSet = document.getElementById("imageSetSelect").value;
    currentImageSet = selectedSet; 
    localStorage.setItem("selectedImageSet", selectedSet);  //stores user choice
    shuffleArray(imgOrder);
    displayBoard();
}

//audio functions
function playAudio() {
    const audio = document.getElementById("gameAudio");
    audio.play();
}
function restartAudio() {
    const audio = document.getElementById("gameAudio");
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
}

//start timer
function startTimer() {
    const timer = document.getElementById("timer");
    function updateTimer() {
        if (countdown > 0) {
            countdown--; 
            timer.textContent = "⏱ " + countdown + " seconds remaining...";
        } else {
            if (!timerExpired) {
                timerExpired = true;
                clearInterval(timerInterval); 
                timer.textContent = "Time's up!";
                showLosePopup();
            }
        }
    }
    timer.textContent = "⏱ 180 seconds remaining...";
    timerInterval = setInterval(updateTimer, 1000);
}

//check if the puzzle is solved
function isPuzzleSolved() {
    const solvedState = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
    return JSON.stringify(imgOrder) === JSON.stringify(solvedState); //converts js string to json and returns the string
}

//shuffle board pics
function shuffleArray() {
    const solvedState = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
    imgOrder = [...solvedState];
    shuffleHistory = [];
    let blankRow = rows - 1;
    let blankCol = columns - 1;

    const directions = [
        { dr: -1, dc: 0 }, // up
        { dr: 1, dc: 0 },  // down
        { dr: 0, dc: -1 }, // left
        { dr: 0, dc: 1 }   // right
    ];

    for (let i = 0; i < 100; i++) {
        const validMoves = directions.filter(({ dr, dc }) => {
            const newRow = blankRow + dr;
            const newCol = blankCol + dc;
            return newRow >= 0 && newRow < rows && newCol >= 0 && newCol < columns;
        });
        const { dr, dc } = validMoves[Math.floor(Math.random() * validMoves.length)];
        const newRow = blankRow + dr;
        const newCol = blankCol + dc;
        const blankIndex = blankRow * columns + blankCol;
        const swapIndex = newRow * columns + newCol;

        shuffleHistory.push({
            from: [newRow, newCol],
            to: [blankRow, blankCol]
        });

        [imgOrder[blankIndex], imgOrder[swapIndex]] = [imgOrder[swapIndex], imgOrder[blankIndex]];

        blankRow = newRow;
        blankCol = newCol;
    }
}

//display gameboard
function displayBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";
    let orderIndex = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = r.toString() + "-" + c.toString();
            tile.src = `./img/${currentImageSet}/`  + imgOrder[orderIndex++] + ".jpeg";

            tile.addEventListener("dragstart", dragStart); //click image to drag
            tile.addEventListener("dragover", dragOver);    //moving image around 
            tile.addEventListener("dragenter", dragEnter);  //drag image to another
            tile.addEventListener("dragleave", dragLeave);  //dragged image leaving another image
            tile.addEventListener("drop", dragDrop);        //drag an image to another, then drop it
            tile.addEventListener("dragend", dragEnd);      //after drop, swap tiles
            
            board.append(tile);
        }
    }
    
    updateMovableTiles();
}

// Add hover highlighting for movable tiles
function updateMovableTiles() {
    const board = document.getElementById("board");
    const blankTile = document.querySelector(`img[src$="16.jpeg"]`);
    const blankCoords = blankTile.id.split("-");
    const blankRow = parseInt(blankCoords[0]);
    const blankCol = parseInt(blankCoords[1]);

    const tiles = board.querySelectorAll("img:not([src$='16.jpeg'])");
    
    tiles.forEach(tile => {
        const coords = tile.id.split("-");
        const row = parseInt(coords[0]);
        const col = parseInt(coords[1]);

        // Check if tile is in same row or column as blank tile
        const isMovable = row === blankRow || col === blankCol;
        
        if (isMovable) {
            tile.classList.add("movable");
            tile.style.cursor = "pointer";
        } else {
            tile.classList.remove("movable");
            tile.style.cursor = "default";
        }
    });
}

// Solve puzzle 
function solvePuzzle() {
    const board = document.getElementById("board");
    let tempImgOrder = [...imgOrder];
    let movesMade = 0; 

    let blankRow, blankCol;
    for (let i = 0; i < imgOrder.length; i++) {
        if (imgOrder[i] === "16") { // blank tile is 16
            blankRow = Math.floor(i / columns);
            blankCol = i % columns;
            break;
        }
    }

    for (let i = shuffleHistory.length - 1; i >= 0; i--) {
        setTimeout(() => {
            const step = shuffleHistory[i];
            const fromRow = step.from[0];
            const fromCol = step.from[1];
            const toRow = step.to[0];
            const toCol = step.to[1];

            const isAdjacent = Math.abs(blankRow - toRow) + Math.abs(blankCol - toCol) === 1;
            if (isAdjacent) {
                const fromIndex = fromRow * columns + fromCol;
                const toIndex = toRow * columns + toCol;

                [tempImgOrder[fromIndex], tempImgOrder[toIndex]] = [tempImgOrder[toIndex], tempImgOrder[fromIndex]];

                board.innerHTML = "";
                tempImgOrder.forEach((tile, index) => {
                    const img = document.createElement("img");
                    img.src = `./img/${currentImageSet}/${tile}.jpeg`;
                    img.id = Math.floor(index / columns) + "-" + (index % columns);
                    board.appendChild(img);
                });

                if (i === 0) imgOrder = [...tempImgOrder];

                blankRow = toRow;
                blankCol = toCol;

                movesMade++;
                document.getElementById("turns").innerText = movesMade + " moves made";
            }

            // Check if the puzzle is solved
            if (isPuzzleSolved()) {
                clearInterval(timerInterval); 
                showWinPopup(); 
            }
        }, (shuffleHistory.length - 1 - i) * 300);
    }
}

//gameplay functions
function dragStart() {
    currentTile = this; 
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {
    
}

function dragDrop() {
    targetTile = this;
}

function dragEnd() {
    if (!targetTile || targetTile === currentTile) {
        return; 
    }

    let currentCoords = currentTile.id.split("-");
    let r = parseInt(currentCoords[0]);
    let c = parseInt(currentCoords[1]);

    let targetCoords = targetTile.id.split("-");
    let r2 = parseInt(targetCoords[0]);
    let c2 = parseInt(targetCoords[1]);

    let currentIsBlank = currentTile.src.includes("16.jpeg");
    let targetIsBlank = targetTile.src.includes("16.jpeg");

    if (currentIsBlank) {
        return; 
    }

    if (targetIsBlank) {
        // check if adjacent 
        const isAdjacent = Math.abs(r - r2) + Math.abs(c - c2) === 1;

        if (isAdjacent) {
            // swap
            let currentImg = currentTile.src;
            let targetImg = targetTile.src;

            currentTile.src = targetImg;
            targetTile.src = currentImg;

            turns++;
            document.getElementById("turns").innerText = turns + " moves made";
            
        }
    }

        updateMovableTiles();

        if (isPuzzleSolved()) {
            clearInterval(timerInterval); 
            showWinPopup(); 
        }
    }

// show win popup
function showWinPopup() {
    document.getElementById("winPopup").style.display = "flex";
}

// hide win popup
function closeWinPopup() {
    document.getElementById("winPopup").style.display = "none";
}

//show lose popup
function showLosePopup() {
    const losePopup = document.getElementById("losePopup");
    losePopup.style.display = "flex";

    document.getElementById("retry").addEventListener("click", () => {
        losePopup.style.display = "none";
        restartGame();
    });

    document.getElementById("goHome").addEventListener("click", () => {
        window.location.href = "./fifteen.html";
    });
}

// Restart the game
function restartGame() {
    const solvedState = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
    imgOrder = [...solvedState]; 
    shuffleArray();
    displayBoard();
    turns = 0;
    document.getElementById("turns").innerText = "0 moves made";
    countdown = 180;
    document.getElementById("timer").textContent = "⏱ 180 seconds remaining...";
    timerExpired = false;
    clearInterval(timerInterval);
    startTimer();
    restartAudio();
}
// Function to find the position of the empty space ("16")
function findEmptySpace(board) {
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "16") { // The empty tile is represented by "16"
            return i;
        }
    }
    return -1; // Should never reach here if the board is valid
}

// Function to get the possible moves for the empty space
function getPossibleMoves(emptyIndex) {
    const moves = [];
    const row = Math.floor(emptyIndex / columns);
    const col = emptyIndex % columns;

    if (row > 0) moves.push(emptyIndex - columns); // Above
    if (row < rows - 1) moves.push(emptyIndex + columns); // Below
    if (col > 0) moves.push(emptyIndex - 1); // Left
    if (col < columns - 1) moves.push(emptyIndex + 1); // Right

    return moves;
}

// Function to get the tile number at a specific index
function getTileAtIndex(board, index) {
    return board[index];
}

// Function to get the optimal move for the hint
function getHint(board) {
    const emptyIndex = findEmptySpace(board);
    const possibleMoves = getPossibleMoves(emptyIndex);
    let optimalMove = possibleMoves[0];
    let minManhattanDistance = Infinity;

    for (let move of possibleMoves) {
        const tile = getTileAtIndex(board, move);
        const tileNumber = parseInt(tile, 10); // Convert tile string to integer
        const targetIndex = tileNumber - 1;
        const targetRow = Math.floor(targetIndex / columns);
        const targetCol = targetIndex % columns;
        const currentRow = Math.floor(move / columns);
        const currentCol = move % columns;
        const distance = Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol);

        if (distance < minManhattanDistance) {
            minManhattanDistance = distance;
            optimalMove = move;
        }
    }

    return optimalMove;
}

// Function to highlight the hint move
function highlightHintMove(board) {
    // Clear previous highlights
    const tiles = document.querySelectorAll('#board img');
    tiles.forEach(tile => tile.style.border = '');

    const optimalMove = getHint(board);
    const row = Math.floor(optimalMove / columns);
    const col = optimalMove % columns;
    const tileElement = document.getElementById(`${row}-${col}`);
    tileElement.style.border = '2px solid red'; // Highlight the tile with a red border
}