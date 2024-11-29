var rows = 4;
var columns = 4;

var currentTile;
var targetTile; //blank tile 

var turns = 0;
var imgOrder = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];

let timerInterval;
let timerExpired = false;
let shuffleHistory = [];
let countdown = 180;

window.onload = function () {

    shuffleArray(imgOrder);
    displayBoard();

    startTimer();

    document.getElementById("shuffle").addEventListener("click", () => {
        shuffleArray(imgOrder);
        displayBoard();
        turns = 0;
        document.getElementById("turns").innerText = "0 moves made";
    });
    document.getElementById("solve").addEventListener("click", solvePuzzle);

    document.getElementById("hint").addEventListener("click", () => {
        displayShuffleSteps();
    });
    document.getElementById("playAgain").addEventListener("click", () => {
       closeWinPopup();
        restartGame();
    });

    document.getElementById("goHome").addEventListener("click", () => {
        window.location.href = "./fifteen.html";
    });

};

//start timer
function startTimer() {
     //timer
    const timer = document.getElementById("timer"); // Ensure this element exists
    function updateTimer() {
        if (countdown > 0) {
            countdown--; // Start counting down
            timer.textContent = "⏱ " + countdown + " seconds remaining...";
        } else {
            if (!timerExpired) {
                timerExpired = true;
                clearInterval(timerInterval); // Stop the timer
                timer.textContent = "Time's up!";
                alert("Time's up! You ran out of time :(");
            }
        }
    }

    timer.textContent = "⏱ 180 seconds remaining...";
    timerInterval = setInterval(updateTimer, 1000);
}

// Function to check if the puzzle is solved
function isPuzzleSolved() {
    const solvedState = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
    return JSON.stringify(imgOrder) === JSON.stringify(solvedState);
}


//shuffle board images
function shuffleArray() {
    const solvedState = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
    imgOrder = [...solvedState];
    shuffleHistory = []; // Reset shuffle history

    let blankRow = rows - 1;
    let blankCol = columns - 1;

    const directions = [
        { dr: -1, dc: 0 }, // Up
        { dr: 1, dc: 0 },  // Down
        { dr: 0, dc: -1 }, // Left
        { dr: 0, dc: 1 }   // Right
    ];

    for (let i = 0; i < 100; i++) { // Shuffle with 100 random moves
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

        // Record the step in shuffle history
        shuffleHistory.push({
            from: [newRow, newCol],
            to: [blankRow, blankCol]
        });

        // Swap tiles
        [imgOrder[blankIndex], imgOrder[swapIndex]] = [imgOrder[swapIndex], imgOrder[blankIndex]];

        blankRow = newRow;
        blankCol = newCol;
    }
}

// Show win popup
function showWinPopup() {
    document.getElementById("winPopup").style.display = "flex"; // Show the popup
}

// Hide win popup
function closeWinPopup() {
    document.getElementById("winPopup").style.display = "none"; // Hide the popup
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
            tile.src = "./img/image2/cat_" + imgOrder[orderIndex++] + ".jpeg";
            //drag
            tile.addEventListener("dragstart", dragStart); //click image to drag
            tile.addEventListener("dragover", dragOver);    //moving image around 
            tile.addEventListener("dragenter", dragEnter);  //drag image to another
            tile.addEventListener("dragleave", dragLeave);  //dragged image leaving another image
            tile.addEventListener("drop", dragDrop);        //drag an image to another, then drop it
            tile.addEventListener("dragend", dragEnd);      //after drop, swap tiles
            
            board.append(tile);
        }
    }
}

// Display shuffle steps with animations
function displayShuffleSteps() {
    imgOrder;
    displayBoard();
}


// Solve puzzle 
function solvePuzzle() {
    const board = document.getElementById("board");
    let tempImgOrder = [...imgOrder]; // Start with the current board state
    let movesMade = 0; // Initialize a counter for the number of moves made during solving

    // Find the position of the blank tile ("16")
    let blankRow, blankCol;
    for (let i = 0; i < imgOrder.length; i++) {
        if (imgOrder[i] === "16") { // Blank tile is represented by "16"
            blankRow = Math.floor(i / columns);
            blankCol = i % columns;
            break;
        }
    }

    // Replay the shuffle history in reverse to solve the puzzle
    for (let i = shuffleHistory.length - 1; i >= 0; i--) {
        setTimeout(() => {
            const step = shuffleHistory[i];
            const fromRow = step.from[0];
            const fromCol = step.from[1];
            const toRow = step.to[0];
            const toCol = step.to[1];

            // Check if the move is valid by ensuring that only adjacent tiles can be swapped
            const isAdjacent = Math.abs(blankRow - toRow) + Math.abs(blankCol - toCol) === 1;
            if (isAdjacent) {
                const fromIndex = fromRow * columns + fromCol;
                const toIndex = toRow * columns + toCol;

                // Swap tiles in the tempImgOrder
                [tempImgOrder[fromIndex], tempImgOrder[toIndex]] = [tempImgOrder[toIndex], tempImgOrder[fromIndex]];

                // Redraw the board with the new arrangement
                board.innerHTML = "";
                tempImgOrder.forEach((tile, index) => {
                    const img = document.createElement("img");
                    img.src = `./img/image2/cat_${tile}.jpeg`;
                    img.id = Math.floor(index / columns) + "-" + (index % columns);
                    board.appendChild(img);
                });

                // Update the final board state
                if (i === 0) imgOrder = [...tempImgOrder];

                // Update the blank tile's position
                blankRow = toRow;
                blankCol = toCol;

                // Increment the move counter
                movesMade++;
                document.getElementById("turns").innerText = movesMade + " moves made";
            }

            // Check if the puzzle is solved
            if (isPuzzleSolved()) {
                clearInterval(timerInterval); // Stop the timer
                showWinPopup(); // Show the win popup
            }
        }, (shuffleHistory.length - 1 - i) * 300); // Delay each step
    }
}


//gameplay functions
function dragStart() {
    currentTile = this; //tile being dragged
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {
    
}

function dragDrop() {
    targetTile = this; //tile being dropped on
}

function dragEnd() {
    if (!targetTile || targetTile === currentTile) {
        return; // Ensure targetTile exists and is not the same as the current tile
    }

    let currentCoords = currentTile.id.split("-");
    let r = parseInt(currentCoords[0]);
    let c = parseInt(currentCoords[1]);

    let targetCoords = targetTile.id.split("-");
    let r2 = parseInt(targetCoords[0]);
    let c2 = parseInt(targetCoords[1]);

    let moveLeft = r === r2 && c2 === c - 1;
    let moveRight = r === r2 && c2 === c + 1;
    let moveUp = c === c2 && r2 === r - 1;
    let moveDown = c === c2 && r2 === r + 1;

    let isAdjacent = moveLeft || moveRight || moveUp || moveDown;

    if (isAdjacent) {
        let currentImg = currentTile.src;
        let targetImg = targetTile.src;

        currentTile.src = targetImg;
        targetTile.src = currentImg;

        turns += 1;
        document.getElementById("turns").innerText = turns + " moves made";
    }
}

// Restart the game
function restartGame() {
    // Reset the puzzle state to the solved state and shuffle it
    const solvedState = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
    imgOrder = [...solvedState]; // Set the puzzle back to the solved state
    shuffleArray(); // Shuffle the tiles

    // Clear the board and redisplay the shuffled tiles
    displayBoard();

    // Reset the moves counter and update the UI
    turns = 0;
    document.getElementById("turns").innerText = "0 moves made";

    // Reset the timer
    countdown = 180; // Reset to 180 seconds
    document.getElementById("timer").textContent = "⏱ 180 seconds remaining...";
    timerExpired = false;

    // Clear the previous timer interval and start a new one
    clearInterval(timerInterval);
    startTimer();
}
