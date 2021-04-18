import p5 from "p5";
import { computerMove } from "./ai.js";

let squareSize = 80; // 60
let pieceSize = 60; // 45
const boardPieces = 8;
let boardSize = boardPieces * squareSize;
const pieceTypes = {
  none: 0,
  red: 1,
  black: 2,
  redKing: 3,
  blackKing: 4
};

var aiColor = pieceTypes.black; // set AI to black pieces
// const aiColor = pieceTypes.none; // disable AI

let board;
let selected;
let validList;
let turn, turnsSinceEvent;
let multijump;
let button;
let button2;
const kingCorners = new Array(10);

for (var i = 0; i < 10; i++) {
  let theta = ((-18 + 36 * i) * Math.PI) / 180;
  var scale = i % 2 === 0 ? 2 : 5;
  kingCorners[i] = [
    (Math.cos(theta) * pieceSize) / scale,
    (Math.sin(theta) * pieceSize) / scale
  ];
}

let curWindowWidth, curWindowHeight;

export const print_board = (boardPrint) => {
  console.log("Board:");
  var i, j, row, p;
  for (i = 0; i < boardPieces; i++) {
    row = "";
    for (j = 0; j < boardPieces; j++) {
      p = boardPrint[i][j];
      if (p === 0) row += "- ";
      else row += String(p) + " ";
    }
    console.log(row);
  }
};

export const normalize = (piece) => {
  if (piece === pieceTypes.redKing) return pieceTypes.red;
  if (piece === pieceTypes.blackKing) return pieceTypes.black;
  return piece;
};
export const comparePieces = (a, b) => normalize(a) === normalize(b);
export const isKing = (a) => a > 2;

const bounds = (nX, nY, x, y) => {
  return (
    x + nX < boardPieces && //
    x + nX >= 0 && //
    y + nY < boardPieces && //
    y + nY >= 0
  ); //
};
const contains = (a, obj) => {
  return JSON.stringify(a).includes(JSON.stringify(obj));
};

const convert = (pieceX, pieceY, list) => {
  let out = [];
  list.forEach((element) => out.push([pieceY, pieceX, element[0], element[1]]));
  return out;
};
export const copy = (array) => {
  return JSON.parse(JSON.stringify(array));
};

export function validMoves(piece, y, x, board, jump) {
  let valid = [];
  if (piece === aiColor) {
    //red
    projectDiagonal(1, 1, x, y, piece, jump, valid, board);
    projectDiagonal(-1, 1, x, y, piece, jump, valid, board);
  } else if (piece === (aiColor === 1 ? 2 : 1)) {
    //black
    projectDiagonal(1, -1, x, y, piece, jump, valid, board);
    projectDiagonal(-1, -1, x, y, piece, jump, valid, board);
  } else if (piece === 3 || piece === 4) {
    //king
    projectDiagonal(1, 1, x, y, piece, jump, valid, board);
    projectDiagonal(-1, 1, x, y, piece, jump, valid, board);
    projectDiagonal(1, -1, x, y, piece, jump, valid, board);
    projectDiagonal(-1, -1, x, y, piece, jump, valid, board);
  }
  return valid;
}

//projects moves on one diagonal
const projectDiagonal = (nX, nY, x, y, piece, jump, valid, board) => {
  if (!bounds(nX, nY, x, y)) return;

  let nPiece = board[y + nY][x + nX];
  if (nPiece === 0 && !jump) {
    valid.push([y + nY, x + nX]);
  } else if (
    nPiece !== 0 && //
    normalize(nPiece) !== normalize(piece) && //
    bounds(nX * 2, nY * 2, x, y) && //
    board[y + nY * 2][x + nX * 2] === 0
  ) {
    valid.push([y + nY * 2, x + nX * 2]);
  }
};
// does a jump move if possible, and returns whether
// it's a multijump
export const isMultiJump = (piece, fromX, fromY, toX, toY, board) => {
  // this is a jump
  if (Math.abs(toY - fromY) > 1) {
    validList = validMoves(piece, toY, toX, board, true);
    if (validList.length > 0) return true;
  }
  return false;
};

//SKETCH FUNCTION
let sketch = function (p) {
  /* RESET AND DRAWING FUNCTIONS */

  p.setup = () => {
    curWindowWidth = window.innerWidth;
    curWindowHeight = window.innerHeight;

    button = p.createButton("Reset");
    button.position(
      boardSize / 2 + squareSize / 4,
      boardSize + 2.5 * squareSize
    );
    button.size(200, 80);
    button.style("font-family", "Bodoni");
    button.style("font-size", "48px");
    button.mousePressed(reset);

    button2 = p.createButton("Swap");
    button2.position(
      boardSize / 2 - 2.5 * squareSize,
      boardSize + 2.5 * squareSize
    );
    button2.size(200, 80);
    button2.style("font-family", "Bodoni");
    button2.style("font-size", "48px");
    button2.mousePressed(swapColor);

    reset();
  };
  const swapColor = () => {
    if (aiColor === pieceTypes.red) {
      aiColor = pieceTypes.black;
    } else {
      aiColor = pieceTypes.red;
    }
    reset();
  };
  const reset = () => {
    console.log("Resetting Game");
    // initialize game
    if (aiColor === pieceTypes.black) {
      board = [
        [0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0],
        [0, 2, 0, 2, 0, 2, 0, 2],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0]
      ];
    } else {
      board = [
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [2, 0, 2, 0, 2, 0, 2, 0],
        [0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0]
      ];
    }

    selected = null;
    validList = [];
    turn = 1;
    turnsSinceEvent = 0;
    multijump = false;

    p.createCanvas(boardSize, boardSize);
    p.noStroke();
    if (turn === aiColor) moveAI(allMoves(turn));

    updateStatus();
  };

  const drawBoard = (x, y) => {
    if (contains(validList, [y, x])) {
      p.fill(0, 0, 128);
    } else if ((x + y) % 2 === 0) {
      p.fill(0xff);
    } else {
      p.fill(0x80);
    }
    p.square(x * squareSize, y * squareSize, squareSize);
  };

  const drawPiece = (x, y) => {
    const piece = board[y][x];
    const [selectedX, selectedY] = selected || [];
    if (selectedX === x && selectedY === y) {
      p.stroke(0xff);
      p.strokeWeight(5); // 3
    }
    if (comparePieces(pieceTypes.red, piece)) {
      p.fill(0xff, 0x20, 0x20);
    } else if (comparePieces(pieceTypes.black, piece)) {
      p.fill(0x00, 0x00, 0x00);
    }
    if (piece !== pieceTypes.none) {
      // regular piece
      p.circle(
        x * squareSize + squareSize / 2,
        y * squareSize + squareSize / 2,
        pieceSize
      );

      // king piece
      if (piece > 2) {
        p.fill(0xff);
        let offsetX = x * squareSize + squareSize / 2;
        let offsetY = y * squareSize + squareSize / 2;

        p.beginShape();
        for (var i = 0; i < 10; i++)
          p.vertex(kingCorners[i][0] + offsetX, kingCorners[i][1] + offsetY);
        p.endShape(p.CLOSE);
      }
    }
    p.noStroke();
  };

  const updateStatus = () => {
    let status;
    let gameState = getGameState();
    if (gameState !== 0) {
      if (gameState === 1) status = "Red Wins!";
      else if (gameState === 2) status = "Black Wins";
      else if (gameState === 3) status = "Draw Game";
    } else if (turn === 1) status = "Red to move.";
    else status = "Black to move.";

    document.getElementById("status").innerHTML = status;
  };

  p.draw = () => {
    if (
      curWindowWidth !== window.innerWidth ||
      curWindowHeight !== window.innerHeight
    ) {
      p.clear();
      curWindowWidth = window.innerWidth;
      curWindowHeight = window.innerHeight;
      var minDim = Math.min(curWindowWidth, curWindowHeight);
      squareSize = (2 * minDim) / 3 / 8;
      pieceSize = (squareSize * 3) / 4;
      boardSize = boardPieces * squareSize;
      button.position(
        boardSize / 2 + squareSize / 4,
        boardSize + 2 * squareSize
      );
      button2.position(
        boardSize / 2 - squareSize * 2.5,
        boardSize + 2 * squareSize
      );
    }

    for (let x = 0; x < boardPieces; x++) {
      for (let y = 0; y < boardPieces; y++) {
        drawBoard(x, y);
        drawPiece(x, y);
      }
    }
  };

  /* PLAYING THE GAME */

  p.mousePressed = () => {
    const x = p.floor(p.mouseX / squareSize);
    const y = p.floor(p.mouseY / squareSize);
    if (getGameState() !== 0) return;
    if (y < 0 || y >= boardPieces || x < 0 || x >= boardPieces) return;

    if (board[y][x] === pieceTypes.none) {
      //square selected is empty
      if (!selected) return;

      // check if selected position is located in validList
      let list = [y, x]; // x and y of where to go to
      if (contains(validList, list)) {
        var [selectedX, selectedY] = selected;
        movePiece(selectedX, selectedY, x, y);
      } else if (!multijump) {
        //deselect selection
        selected = null;
        validList = [];
      }
    } else {
      if (normalize(board[y][x]) === turn && !multijump) {
        selected = [x, y];
        validList = validMoves(board[y][x], y, x, board, false);
      } else if (!multijump) {
        selected = null;
        validList = [];
      }
    }

    updateStatus();
  };

  const movePiece = (fromX, fromY, toX, toY) => {
    selected = [fromX, fromY];
    const piece = board[fromY][fromX]; // color
    turnsSinceEvent++;
    //checks if its a jump
    updateBoard(fromX, fromY, toX, toY);
    //breaks if multi jump. Needs to jump again!
    multijump = isMultiJump(piece, fromX, fromY, toX, toY, board);
    if (multijump) {
      selected = [toX, toY];
      if (turn === aiColor) moveAI(convert(toX, toY, validList));
      return;
    }

    //print_board(board);
    turn = changeTurn(turn);
    // check for win/lose/draw
    let gameState = getGameState();
    if (gameState !== 0) return;

    p.draw();
    if (turn === aiColor) moveAI(allMoves(turn));
    selected = null;
  };
  const updateBoard = (fromX, fromY, toX, toY) => {
    //removes old piece
    const piece = board[fromY][fromX];
    board[fromY][fromX] = pieceTypes.none;

    //checks for promotions
    if ((toY === boardPieces - 1 || toY === 0) && piece < 3) {
      board[toY][toX] = piece + 2;
      turnsSinceEvent = 0;
    } else {
      board[toY][toX] = piece;
    }

    //checks for jumps
    if (Math.abs(toY - fromY) > 1) {
      board[(toY + fromY) / 2][(toX + fromX) / 2] = 0;
      turnsSinceEvent = 0;
    }

    // reset the validMoves
    validList = [];
  };

  const changeTurn = (t) => {
    return t === 1 ? 2 : 1;
  };

  // let 0=still playing, 1=red wins, 2=black wins, 3=draw
  // make the assumption that it's now 'turn' player to move
  const getGameState = () => {
    var nextTurn = turn === 1 ? 2 : 1;
    let allMovesList = allMoves(turn);

    if (allMovesList.length === 0) return nextTurn;
    if (turnsSinceEvent >= 80) return 3;
    return 0;
  };

  const moveAI = (moves) => {
    let moveArray = computerMove(moves, copy(board), aiColor);
    movePiece(moveArray[1], moveArray[0], moveArray[3], moveArray[2]);
  };

  //check locations of all pieces
  //run valid moves for each piece
  const allMoves = (curTurn) => {
    let allMovesList = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        if (normalize(board[i][j]) === curTurn) {
          let toMove = validMoves(board[i][j], i, j, board, false);
          toMove.forEach((element) =>
            allMovesList.push([i, j, element[0], element[1]])
          );
        }
      }
    }
    return allMovesList;
  };

  /* AI FUNCTIONS */
};
new p5(sketch);
