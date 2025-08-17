const boardSize = 4;
let board, score;

function initBoard() {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  score = 0;
  addRandomTile();
  addRandomTile();
  updateBoard();
  document.getElementById('game-over').style.display = 'none';
  document.getElementById('score').textContent = `점수: ${score}`;
}

function addRandomTile() {
  const empty = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function updateBoard() {
  const boardDiv = document.getElementById('board');
  boardDiv.innerHTML = '';
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
  const tile = document.createElement('div');
  tile.className = 'tile' + (board[r][c] ? ` tile-${board[r][c]}` : '');
  const span = document.createElement('span');
  span.textContent = board[r][c] ? board[r][c] : '';
  tile.appendChild(span);
  boardDiv.appendChild(tile);
    }
  }
  document.getElementById('score').textContent = `점수: ${score}`;
}

function move(dir) {
  let moved = false;
  let merged = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));
  function traverse(callback) {
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        callback(r, c);
      }
    }
  }
  function getCell(r, c) {
    if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) return null;
    return board[r][c];
  }
  function setCell(r, c, val) {
    board[r][c] = val;
  }
  let dr = 0, dc = 0;
  if (dir === 'left') dc = -1;
  if (dir === 'right') dc = 1;
  if (dir === 'up') dr = -1;
  if (dir === 'down') dr = 1;
  let range = [...Array(boardSize).keys()];
  if (dir === 'right' || dir === 'down') range = range.reverse();
  for (let i of range) {
    for (let j of range) {
      let r = dir === 'up' || dir === 'down' ? i : j;
      let c = dir === 'up' || dir === 'down' ? j : i;
      if (board[r][c] === 0) continue;
      let nr = r, nc = c;
      while (true) {
        let tr = nr + dr, tc = nc + dc;
        if (getCell(tr, tc) === 0) {
          setCell(tr, tc, board[nr][nc]);
          setCell(nr, nc, 0);
          nr = tr; nc = tc;
          moved = true;
        } else if (getCell(tr, tc) === board[nr][nc] && !merged[tr][tc]) {
          setCell(tr, tc, board[nr][nc] * 2);
          setCell(nr, nc, 0);
          score += board[nr][nc] * 2;
          merged[tr][tc] = true;
          moved = true;
          break;
        } else {
          break;
        }
      }
    }
  }
  if (moved) {
    addRandomTile();
    updateBoard();
    if (isGameOver()) {
      document.getElementById('game-over').style.display = 'block';
    }
  }
}

function isGameOver() {
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 0) return false;
      for (let [dr, dc] of [[0,1],[1,0],[-1,0],[0,-1]]) {
        let nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize && board[r][c] === board[nr][nc]) {
          return false;
        }
      }
    }
  }
  return true;
}

document.getElementById('restart').onclick = initBoard;
document.addEventListener('keydown', e => {
  if (document.getElementById('game-over').style.display === 'block') return;
  if (e.key === 'ArrowLeft') move('left');
  if (e.key === 'ArrowRight') move('right');
  if (e.key === 'ArrowUp') move('up');
  if (e.key === 'ArrowDown') move('down');
});

// 모바일 방향키 버튼 이벤트
document.getElementById('btn-up').onclick = () => move('up');
document.getElementById('btn-down').onclick = () => move('down');
document.getElementById('btn-left').onclick = () => move('left');
document.getElementById('btn-right').onclick = () => move('right');

// 모바일 스와이프 제스처 지원
let touchStartX, touchStartY;
const boardDiv = document.getElementById('board');
boardDiv.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
});
boardDiv.addEventListener('touchend', e => {
  if (typeof touchStartX !== 'number' || typeof touchStartY !== 'number') return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) move('right');
      else move('left');
    } else {
      if (dy > 0) move('down');
      else move('up');
    }
  }
  touchStartX = touchStartY = undefined;
});

document.getElementById('restart').onclick = initBoard;

window.onload = initBoard;
