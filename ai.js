import {
  copy,
  validMoves,
  normalize,
  print_board,
  isMultiJump
} from "./index.js";

var depth = 5;

const pieceTypes = {
  none: 0,
  red: 1,
  black: 2,
  redKing: 3,
  blackKing: 4
};

export function computerMove(validMoves, copyBoard, color) {
  let redList = extractColor(1, copyBoard);
  let blackList = extractColor(2, copyBoard);

  let max = true;
  let minmaxValue = max === true ? -1000 : 1000;
  let move = validMoves[0];

  validMoves.forEach((element) => {
    let board = copy(copyBoard);

    let updatedSet = updateBoard(
      element[0],
      element[1],
      element[2],
      element[3],
      board
    );

    let newBoard = updatedSet[0];
    let multijump = updatedSet[1];

    let value;

    if (multijump) {
      value = minimax(
        copy(newBoard),
        redList,
        blackList,
        depth,
        color,
        true,
        minmaxValue,
        [true, element[2], element[3]]
      );
    } else {
      value = minimax(
        copy(newBoard),
        redList,
        blackList,
        depth - 1,
        color,
        false,
        minmaxValue,
        [false]
      );
    }

    if (value > minmaxValue) {
      minmaxValue = value;
      move = element;
    }
  });
  return move;
}

var boardPieces = 8;
function extractColor(color, board) {
  let list = [];
  for (let i = 0; i < boardPieces; i++) {
    for (let j = 0; j < boardPieces; j++) {
      let piece = board[i][j];
      if (piece === color) {
        list.push([i, j]);
      }
    }
  }
  return list;
}

function minimax(
  board,
  redList,
  blackList,
  depth,
  color,
  max,
  valueAbove,
  currentlyMultijump
) {
  if (depth === 1) {
    return evaluateBoard(board, color);
  } else {
    let maxNext = max === true ? false : true;
    //loop through each move in valid list
    //track min / max
    //alpha beta
    //return min/max number
    let oppositeColor = color === 1 ? 2 : 1;
    let moves = [];
    if (currentlyMultijump.length > 1) {
      let checkmoves = validMoves(
        max === true ? color : oppositeColor,
        currentlyMultijump[1],
        currentlyMultijump[2],
        board,
        true
      );
      checkmoves.forEach((element) =>
        moves.push([
          currentlyMultijump[1],
          currentlyMultijump[2],
          element[0],
          element[1]
        ])
      );
    } else {
      moves = allMoves(
        board,
        redList,
        blackList,
        max === true ? color : oppositeColor
      );
      if (moves.length === 0) {
        return max === true ? -1000 : 1000;
      }
    }

    let minmaxValue = max === true ? -1000 : 1000;
    moves.forEach((element) => {
      let updatedSet = updateBoard(
        element[0],
        element[1],
        element[2],
        element[3],
        copy(board)
      ); //element; use new projected board and pass down
      //MODIFY REDLIST AND BLACKLIST

      //multijump
      let newBoard = updatedSet[0];
      let multijump = updatedSet[1];
      let value;

      if (multijump) {
        value = minimax(
          newBoard,
          redList,
          blackList,
          depth,
          color,
          max,
          minmaxValue,
          [true, element[2], element[3]]
        );
      } else {
        value = minimax(
          newBoard,
          redList,
          blackList,
          depth - 1,
          color,
          maxNext,
          minmaxValue,
          [false]
        );
      }
      //use one less depth, new board, opposite minmax

      //depending on if min or max, set minmaxValue to if the value is less or greater
      minmaxValue =
        max === true
          ? value > minmaxValue
            ? value
            : minmaxValue
          : value < minmaxValue
          ? value
          : minmaxValue;
      //alpha beta pruning
      if (max) {
        if (minmaxValue > valueAbove) {
          return minmaxValue;
        }
      } else {
        if (minmaxValue < valueAbove) {
          return minmaxValue;
        }
      }
    });
    return minmaxValue;
  }
}

function evaluateBoard(board, color) {
  var score = 0;

  var i, j, piece, sign, val;
  for (i = 0; i < boardPieces; i++) {
    for (j = 0; j < boardPieces; j++) {
      piece = board[i][j];
      if (!piece) continue;
      // sign = piece % 2 === color % 2 ? 1 : -1;
      // val = piece > 2 ? 5 : 3;
      // score += val * sign;
      sign = normalize(piece) === color ? 1 : -1;
      val = piece > 2 ? 5 : 3;
      score += val * sign;
    }
  }
  return score;
}
const allMoves = (board, redList, blackList, color) => {
  let allMovesList = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (normalize(board[i][j]) === color) {
        let toMove = validMoves(board[i][j], i, j, board, false);
        toMove.forEach((element) =>
          allMovesList.push([i, j, element[0], element[1]])
        );
      }
    }
  }
  return allMovesList;
};

function updateBoard(fromY, fromX, toY, toX, oldboard) {
  let board = copy(oldboard);
  //removes old piece
  let piece = board[fromY][fromX];
  board[fromY][fromX] = pieceTypes.none;
  //checks for promotions
  if ((toY === boardPieces - 1 || toY === 0) && piece < 3) {
    board[toY][toX] = piece + 2;
  } else {
    board[toY][toX] = piece;
  }

  //checks for jumps
  if (Math.abs(toY - fromY) > 1) {
    board[(toY + fromY) / 2][(toX + fromX) / 2] = 0;
  }

  //checks for multijump
  let multijump = isMultiJump(piece, fromX, fromY, toX, toY, board);

  return [board, multijump];
}
