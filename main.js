import "./style.css";
import {
  BLOCK_SIZE,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  EVENT_MOVEMENTS,
} from "./const";

const canvas = document.querySelector("canvas");

const canvasContext = canvas.getContext("2d");
const $span = document.querySelector("span");

let score = 0;

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

canvasContext.scale(BLOCK_SIZE, BLOCK_SIZE);

const PIECES = [
  [
    [1, 1],
    [1, 1],
  ],
  [[1, 1, 1, 1]],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
];

let PIECE = {
  position: { x: 5, y: 0 },
  shape: PIECES[0],
};

function createBoard(width, height) {
  return Array(height)
    .fill()
    .map(() => Array(width).fill(0));
}

const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

addEventListener("keydown", (event) => {
  if (event.key == EVENT_MOVEMENTS.CHANGE) {
    const rotated = [];
    for (let i = 0; i < PIECE.shape[0].length; i++) {
      const row = [];
      for (let j = PIECE.shape.length - 1; j >= 0; j--) {
        row.push(PIECE.shape[j][i]);
      }
      rotated.push(row);
    }
    const previousShape = PIECE.shape;
    PIECE.shape = rotated;
    if (checkCollision()) {
      PIECE.shape = previousShape;
    }
  }

  if (event.key == EVENT_MOVEMENTS.LEFT) {
    PIECE.position.x--;
    if (checkCollision()) {
      PIECE.position.x++;
    }
  }
  if (event.key == EVENT_MOVEMENTS.RIGHT) {
    PIECE.position.x++;
    if (checkCollision()) {
      PIECE.position.x--;
    }
  }
  if (event.key == EVENT_MOVEMENTS.DOWN) {
    PIECE.position.y++;
    if (checkCollision()) {
      PIECE.position.y--;
      solidify();
      removeRows();
    }
  }
});

let dropCounter = 0;
let lastTime = 0;

function update(time = 0) {
  let deltaCounter = time - lastTime;
  lastTime = time;
  dropCounter += deltaCounter;
  if (dropCounter > 1000) {
    PIECE.position.y++;

    dropCounter = 0;
    if (checkCollision()) {
      PIECE.position.y--;

      solidify();
      removeRows();
    }
  }

  draw();
  window.requestAnimationFrame(update);
}
function draw() {
  canvasContext.fillStyle = "black";
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  board.map((row, y) => {
    row.map((value, x) => {
      if (value) {
        canvasContext.fillStyle = "yellow";
        canvasContext.fillRect(x, y, 1, 1);
      }
    });
  });

  PIECE.shape?.map((row, y) => {
    row.map((value, x) => {
      if (value) {
        canvasContext.fillStyle = "red";
        canvasContext.fillRect(
          x + PIECE.position.x,
          y + PIECE.position.y,
          1,
          1
        );
      }
    });
  });

  $span.innerText = score;
}

function checkCollision() {
  return PIECE.shape?.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 && board[y + PIECE.position.y]?.[x + PIECE.position.x] !== 0
      );
    });
  });
}

function solidify() {
  PIECE.shape.map((row, y) => {
    row.map((value, x) => {
      if (value == 1) {
        board[y + PIECE.position.y][x + PIECE.position.x] = 1;
      }
    });
  });

  PIECE.position.x = 5;
  PIECE.position.y = 0;
  PIECE.shape = PIECES[Math.floor(Math.random() * PIECES.length)];
  if (checkCollision()) {
    alert("Game over!");
    board.map((row) => row.fill(0));
  }
}

function removeRows() {
  const rowsToRemove = [];

  board.map((row, y) => {
    if (row.every((value) => value == 1)) {
      rowsToRemove.push(y);
    }
  });

  rowsToRemove.map((y) => {
    board.splice(y, 1);
    board.unshift(Array(BOARD_WIDTH).fill(0));
    score += 10;
  });
}

const $section = document.querySelector("section")

$section.addEventListener("click", () => {
  update();
  $section.remove()
  const audio = new Audio("./theme.mp3");
  audio.volume = 0.5;
  audio.play();
});
