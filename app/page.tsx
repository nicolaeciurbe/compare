"use client";

import { useState, useEffect } from "react";

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export default function Home() {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [mineCount, setMineCount] = useState(20);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const BOARD_SIZE = 15;

  const initializeBoard = () => {
    const newBoard: Cell[][] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      newBoard[i] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        newBoard[i][j] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        };
      }
    }

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (!newBoard[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE) {
                if (newBoard[ni][nj].isMine) count++;
              }
            }
          }
          newBoard[i][j].neighborMines = count;
        }
      }
    }

    setBoard(newBoard);
    setGameOver(false);
    setGameWon(false);
    setFlaggedCount(0);
  };

  useEffect(() => {
    initializeBoard();
  }, []);

  const revealCell = (row: number, col: number) => {
    if (gameOver || gameWon || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }

    const newBoard = [...board];
    newBoard[row][col].isRevealed = true;

    if (newBoard[row][col].isMine) {
      setGameOver(true);
      // Reveal all mines
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          if (newBoard[i][j].isMine) {
            newBoard[i][j].isRevealed = true;
          }
        }
      }
    } else if (newBoard[row][col].neighborMines === 0) {
      // Reveal neighbors for cells with no adjacent mines
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          const ni = row + di;
          const nj = col + dj;
          if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE) {
            if (!newBoard[ni][nj].isRevealed && !newBoard[ni][nj].isFlagged) {
              revealCell(ni, nj);
            }
          }
        }
      }
    }

    setBoard(newBoard);
    checkWinCondition();
  };

  const toggleFlag = (row: number, col: number) => {
    if (gameOver || gameWon || board[row][col].isRevealed) {
      return;
    }

    const newBoard = [...board];
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
    setFlaggedCount(prev => newBoard[row][col].isFlagged ? prev + 1 : prev - 1);
  };

  const checkWinCondition = () => {
    let revealedCount = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j].isRevealed && !board[i][j].isMine) {
          revealedCount++;
        }
      }
    }
    if (revealedCount === BOARD_SIZE * BOARD_SIZE - mineCount) {
      setGameWon(true);
    }
  };

  const getCellContent = (cell: Cell) => {
    if (!cell.isRevealed) {
      return cell.isFlagged ? "🚩" : "";
    }
    if (cell.isMine) {
      return "💣";
    }
    if (cell.neighborMines === 0) {
      return "";
    }
    return cell.neighborMines.toString();
  };

  const getCellColor = (cell: Cell) => {
    if (!cell.isRevealed) {
      return "bg-gray-300";
    }
    if (cell.isMine) {
      return "bg-red-500";
    }
    const colors = [
      "", "text-blue-600", "text-green-600", "text-red-600", 
      "text-purple-600", "text-yellow-600", "text-cyan-600", 
      "text-pink-600", "text-orange-600"
    ];
    return colors[cell.neighborMines] || "";
  };

  return (
    <div className="min-h-screen bg-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Minesweeper</h1>
          <div className="flex justify-center gap-8 mb-4">
            <div className="text-lg">
              <span className="font-semibold">Mines:</span> {mineCount - flaggedCount}
            </div>
            <div className="text-lg">
              <span className="font-semibold">Flags:</span> {flaggedCount}
            </div>
          </div>
          <button
            onClick={initializeBoard}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            New Game
          </button>
        </div>

        {gameOver && (
          <div className="text-center mb-4">
            <div className="text-red-600 text-2xl font-bold">Game Over!</div>
          </div>
        )}

        {gameWon && (
          <div className="text-center mb-4">
            <div className="text-green-600 text-2xl font-bold">You Won!</div>
          </div>
        )}

        <div className="grid grid-cols-15 gap-1 bg-gray-400 p-2 rounded">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => revealCell(rowIndex, colIndex)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleFlag(rowIndex, colIndex);
                }}
                className={`
                  w-10 h-10 border border-gray-400 flex items-center justify-center
                  font-bold text-sm transition-colors
                  ${cell.isRevealed ? 'bg-gray-200' : 'bg-gray-300 hover:bg-gray-400'}
                  ${getCellColor(cell)}
                `}
              >
                {getCellContent(cell)}
              </button>
            ))
          )}
        </div>

        <div className="mt-6 text-center text-gray-600">
          <p>Left click to reveal • Right click to flag</p>
        </div>
      </div>
    </div>
  );
}
