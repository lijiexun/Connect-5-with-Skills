(function () {
  'use strict';

  const BOARD_SIZE = 15;
  const EMPTY = 0;
  const BLACK = 1;
  const WHITE = 2;
  const WIN_COUNT = 5;

  // Directions for win checking: right, down, down-right, down-left
  const DIRECTIONS = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  // --- State ---
  let board = [];
  let currentPlayer = BLACK;
  let gameOver = false;
  let moveHistory = [];
  let scores = { [BLACK]: 0, [WHITE]: 0 };
  let winningCells = [];

  // --- DOM refs ---
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const statusText = document.getElementById('status-text');
  const currentStone = document.getElementById('current-stone');
  const undoBtn = document.getElementById('undo-btn');
  const newGameBtn = document.getElementById('new-game-btn');
  const blackScoreEl = document.getElementById('black-score');
  const whiteScoreEl = document.getElementById('white-score');

  // --- Drawing constants (set during resize) ---
  let cellSize = 0;
  let padding = 0;
  let stoneRadius = 0;
  let boardPixelSize = 0;

  // --- Hover state ---
  let hoverCol = -1;
  let hoverRow = -1;

  // =========================================================
  // Initialization
  // =========================================================

  function initBoard() {
    board = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      board.push(new Array(BOARD_SIZE).fill(EMPTY));
    }
    currentPlayer = BLACK;
    gameOver = false;
    moveHistory = [];
    winningCells = [];
    updateStatus();
    draw();
  }

  function sizeBoardToWindow() {
    const maxSize = Math.min(window.innerWidth - 40, window.innerHeight - 200, 600);
    boardPixelSize = Math.max(maxSize, 300);
    cellSize = boardPixelSize / (BOARD_SIZE + 1);
    padding = cellSize;
    stoneRadius = cellSize * 0.43;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = boardPixelSize * dpr;
    canvas.height = boardPixelSize * dpr;
    canvas.style.width = boardPixelSize + 'px';
    canvas.style.height = boardPixelSize + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // =========================================================
  // Drawing
  // =========================================================

  function draw() {
    drawBackground();
    drawGrid();
    drawStarPoints();
    drawStones();
    drawHover();
    drawWinHighlight();
  }

  function drawBackground() {
    ctx.fillStyle = '#dcb35c';
    ctx.fillRect(0, 0, boardPixelSize, boardPixelSize);
  }

  function drawGrid() {
    ctx.strokeStyle = '#5a4320';
    ctx.lineWidth = 1;
    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = padding + i * cellSize;
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(padding, pos);
      ctx.lineTo(padding + (BOARD_SIZE - 1) * cellSize, pos);
      ctx.stroke();
      // Vertical
      ctx.beginPath();
      ctx.moveTo(pos, padding);
      ctx.lineTo(pos, padding + (BOARD_SIZE - 1) * cellSize);
      ctx.stroke();
    }
  }

  function drawStarPoints() {
    const points = [3, 7, 11];
    ctx.fillStyle = '#5a4320';
    for (const r of points) {
      for (const c of points) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        ctx.beginPath();
        ctx.arc(x, y, cellSize * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawStones() {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] !== EMPTY) {
          drawStone(r, c, board[r][c]);
        }
      }
    }
    // Highlight the last move
    if (moveHistory.length > 0) {
      const last = moveHistory[moveHistory.length - 1];
      const x = padding + last.col * cellSize;
      const y = padding + last.row * cellSize;
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, stoneRadius * 0.45, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawStone(row, col, player) {
    const x = padding + col * cellSize;
    const y = padding + row * cellSize;

    ctx.beginPath();
    ctx.arc(x, y, stoneRadius, 0, Math.PI * 2);

    if (player === BLACK) {
      const grad = ctx.createRadialGradient(x - stoneRadius * 0.3, y - stoneRadius * 0.3, stoneRadius * 0.1, x, y, stoneRadius);
      grad.addColorStop(0, '#555');
      grad.addColorStop(1, '#111');
      ctx.fillStyle = grad;
    } else {
      const grad = ctx.createRadialGradient(x - stoneRadius * 0.3, y - stoneRadius * 0.3, stoneRadius * 0.1, x, y, stoneRadius);
      grad.addColorStop(0, '#fff');
      grad.addColorStop(1, '#ccc');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.fill();
  }

  function drawHover() {
    if (gameOver || hoverRow < 0 || hoverCol < 0) return;
    if (board[hoverRow][hoverCol] !== EMPTY) return;

    const x = padding + hoverCol * cellSize;
    const y = padding + hoverRow * cellSize;

    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, stoneRadius, 0, Math.PI * 2);
    ctx.fillStyle = currentPlayer === BLACK ? '#222' : '#eee';
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  function drawWinHighlight() {
    if (winningCells.length === 0) return;
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    for (const cell of winningCells) {
      const x = padding + cell.col * cellSize;
      const y = padding + cell.row * cellSize;
      ctx.beginPath();
      ctx.arc(x, y, stoneRadius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // =========================================================
  // Game logic
  // =========================================================

  function placeStone(row, col) {
    if (gameOver) return;
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;
    if (board[row][col] !== EMPTY) return;

    board[row][col] = currentPlayer;
    moveHistory.push({ row, col, player: currentPlayer });

    const result = checkWin(row, col, currentPlayer);
    if (result) {
      winningCells = result;
      gameOver = true;
      scores[currentPlayer]++;
      updateScores();
      updateStatus();
      draw();
      return;
    }

    // Check for draw (board full)
    if (moveHistory.length === BOARD_SIZE * BOARD_SIZE) {
      gameOver = true;
      updateStatus();
      draw();
      return;
    }

    currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    updateStatus();
    draw();
  }

  function checkWin(row, col, player) {
    for (const [dr, dc] of DIRECTIONS) {
      const cells = [{ row, col }];

      // Count forward
      for (let i = 1; i < WIN_COUNT; i++) {
        const nr = row + dr * i;
        const nc = col + dc * i;
        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
        if (board[nr][nc] !== player) break;
        cells.push({ row: nr, col: nc });
      }

      // Count backward
      for (let i = 1; i < WIN_COUNT; i++) {
        const nr = row - dr * i;
        const nc = col - dc * i;
        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
        if (board[nr][nc] !== player) break;
        cells.push({ row: nr, col: nc });
      }

      if (cells.length >= WIN_COUNT) {
        return cells;
      }
    }
    return null;
  }

  function undo() {
    if (moveHistory.length === 0) return;
    if (gameOver) {
      // If the game just ended, revert the score increment
      const lastMove = moveHistory[moveHistory.length - 1];
      if (winningCells.length > 0) {
        scores[lastMove.player]--;
        updateScores();
      }
      gameOver = false;
      winningCells = [];
    }
    const move = moveHistory.pop();
    board[move.row][move.col] = EMPTY;
    currentPlayer = move.player;
    updateStatus();
    draw();
  }

  // =========================================================
  // UI updates
  // =========================================================

  function updateStatus() {
    if (gameOver) {
      if (winningCells.length > 0) {
        const winner = currentPlayer === BLACK ? 'Black' : 'White';
        statusText.textContent = winner + ' wins!';
        currentStone.className = 'stone ' + (currentPlayer === BLACK ? 'black' : 'white');
      } else {
        statusText.textContent = 'Draw!';
        currentStone.className = 'stone';
      }
    } else {
      const name = currentPlayer === BLACK ? 'Black' : 'White';
      statusText.textContent = name + "'s turn";
      currentStone.className = 'stone ' + (currentPlayer === BLACK ? 'black' : 'white');
    }
  }

  function updateScores() {
    blackScoreEl.textContent = scores[BLACK];
    whiteScoreEl.textContent = scores[WHITE];
  }

  // =========================================================
  // Input handling
  // =========================================================

  function getGridPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.round((x - padding) / cellSize);
    const row = Math.round((y - padding) / cellSize);
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return { row: -1, col: -1 };
    }
    return { row, col };
  }

  canvas.addEventListener('click', function (e) {
    const { row, col } = getGridPos(e);
    placeStone(row, col);
  });

  canvas.addEventListener('mousemove', function (e) {
    const { row, col } = getGridPos(e);
    if (row !== hoverRow || col !== hoverCol) {
      hoverRow = row;
      hoverCol = col;
      draw();
    }
  });

  canvas.addEventListener('mouseleave', function () {
    hoverRow = -1;
    hoverCol = -1;
    draw();
  });

  undoBtn.addEventListener('click', undo);
  newGameBtn.addEventListener('click', initBoard);

  // Keyboard shortcut: Ctrl+Z for undo
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undo();
    }
  });

  // =========================================================
  // Responsive resize
  // =========================================================

  function handleResize() {
    sizeBoardToWindow();
    draw();
  }

  window.addEventListener('resize', handleResize);

  // =========================================================
  // Start
  // =========================================================

  sizeBoardToWindow();
  initBoard();
})();
