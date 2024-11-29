
//fifteen.html
document.addEventListener("DOMContentLoaded", () => {
  const howToButton = document.getElementById("how-to");
  const instructionsPopup = document.getElementById("instructions-popup");
  const closeInstructionsButton = document.getElementById("close-instructions");
  
    howToButton.addEventListener("click", () => {
    instructionsPopup.style.display = "flex";
  }); //show 
  closeInstructionsButton.addEventListener("click", () => {
    instructionsPopup.style.display = "none"; //hide
  });
    
});


//fifteenPuzzle.html
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
    const audio = document.getElementById("gameAudio");

    audio.play().catch(() => {
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
    shuffleArray(imgOrder);
    displayBoard();
    startTimer();

    document.getElementById("shuffle").addEventListener("click", () => {
        shuffleArray(imgOrder);
        displayBoard();
        turns = 0;
        document.getElementById("turns").innerText = "0 moves made";
        restartAudio();
    });
    document.getElementById("solve").addEventListener("click", solvePuzzle);

    document.getElementById("playAgain").addEventListener("click", () => {
       closeWinPopup();
        restartGame();
    });

    document.getElementById("goHome").addEventListener("click", () => {
        window.location.href = "./fifteen.html";
    });
};

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
    return JSON.stringify(imgOrder) === JSON.stringify(solvedState);
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

// show win popup
function showWinPopup() {
    document.getElementById("winPopup").style.display = "flex"; // Show the popup
}

// hide win popup
function closeWinPopup() {
    document.getElementById("winPopup").style.display = "none"; // Hide the popup
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
                    img.src = `./img/image2/cat_${tile}.jpeg`;
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
