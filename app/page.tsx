"use client";

import { useState, useEffect, useRef } from "react";

interface Score {
  id: number;
  clicks: number;
  time: number;
  date: string;
  gameMode: 'time' | 'clicks';
}

const TIME_MODE_SECONDS = 5;

// Animal data
const animalData = [
  {
    name: "Turtle",
    min: 0,
    max: 5,
    emoji: "🐢",
    img: "",
  },
  {
    name: "Octopus",
    min: 5,
    max: 8,
    emoji: "🐙",
    img: "",
  },
  {
    name: "Rabbit",
    min: 8,
    max: 11,
    emoji: "🐇",
    img: "",
  },
  {
    name: "Cheetah",
    min: 11,
    max: Infinity,
    emoji: "🐆",
    img: "",
  }
];

// Helper to get animal info by CPS
function getAnimalByCPS(cps: number) {
  for (const animal of animalData) {
    if (cps <= animal.max && cps > animal.min) {
      return animal;
    }
    if (cps === 0 && animal.min === 0) {
      return animal;
    }
  }
  return animalData[0];
}

// Helper to get "time ago" string
function getTimeAgo(dateString: string | number) {
  // Accepts either a string (legacy) or a timestamp (number)
  let date: Date;
  if (typeof dateString === "number") {
    date = new Date(dateString);
  } else {
    // fallback for legacy, but we will use timestamp going forward
    date = new Date(dateString);
  }
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec} second${diffSec === 1 ? "" : "s"} ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  // Otherwise, show date
  return date.toLocaleDateString();
}

export default function Home() {
  const [clickCount, setClickCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_MODE_SECONDS);
  const [isGameActive, setIsGameActive] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);
  const [gameMode, setGameMode] = useState<'time' | 'clicks'>('time');
  const [targetClicks] = useState(50);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lastScoreId, setLastScoreId] = useState<number | null>(null);

  // New: Track if the game has started (timer running) after first click
  const [hasStarted, setHasStarted] = useState(false);

  // Timer refs for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // For time mode: timer only runs after first click
  useEffect(() => {
    if (gameMode === 'time') {
      if (isGameActive && hasStarted && timeLeft > 0) {
        timerRef.current = setTimeout(() => {
          setTimeLeft(prev => prev - 1);
        }, 1000);
      } else if (isGameActive && hasStarted && timeLeft === 0) {
        endGame();
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isGameActive, hasStarted, timeLeft, gameMode]);

  // For clicks mode: timer only runs after first click
  useEffect(() => {
    if (gameMode === 'clicks') {
      if (isGameActive && hasStarted) {
        timerRef.current = setTimeout(() => {
          setElapsedTime(prev => prev + 1);
        }, 1000);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isGameActive, hasStarted, gameMode, elapsedTime]);

  useEffect(() => {
    if (isGameActive && hasStarted && clickCount >= targetClicks && gameMode === 'clicks') {
      endGame();
    }
  }, [isGameActive, hasStarted, clickCount, targetClicks, gameMode]);

  const startGame = () => {
    setClickCount(0);
    setTimeLeft(TIME_MODE_SECONDS);
    setElapsedTime(0);
    setIsGameActive(true);
    setHasStarted(false); // Wait for first click to start timer
  };

  const endGame = () => {
    setIsGameActive(false);
    setHasStarted(false);
    const newScore: Score = {
      id: Date.now(),
      clicks: clickCount,
      time: gameMode === 'time' ? TIME_MODE_SECONDS - timeLeft : elapsedTime,
      date: Date.now().toString(), // Store as timestamp string for easier "time ago"
      gameMode: gameMode
    };
    setScores(prev => [newScore, ...prev.slice(0, 9)]);
    setLastScoreId(newScore.id);
  };

  const handleClick = () => {
    if (isGameActive) {
      // On first click, start the timer
      if (!hasStarted) {
        setHasStarted(true);
      }
      setClickCount(prev => prev + 1);
    }
  };

  const resetScores = () => {
    setScores([]);
    setLastScoreId(null);
  };

  const handleGameModeChange = (newMode: 'time' | 'clicks') => {
    setIsGameActive(false);
    setHasStarted(false);
    setClickCount(0);
    setTimeLeft(TIME_MODE_SECONDS);
    setElapsedTime(0);
    setGameMode(newMode);
  };

  const getCPS = (clicks: number, time: number) => {
    if (!time || time === 0) return "0.0";
    return (clicks / time).toFixed(1);
  };

  const animatedBgStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(-45deg, #a7c7e7, #fbc2eb, #fcb69f, #a1c4fd, #c2e9fb)",
    backgroundSize: "400% 400%",
    animation: "gradientBG 20s ease infinite",
    fontFamily: "'Open Sans', sans-serif"
  };

  const gradientKeyframes = `
    @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap');
    @keyframes gradientBG {
      0%{background-position:0% 50%}
      50%{background-position:100% 50%}
      100%{background-position:0% 50%}
    }
    html, body, #__next {
      font-family: 'Open Sans', sans-serif !important;
    }
    .discreet-animated-btn {
      transition: 
        background 0.18s, 
        color 0.18s, 
        transform 0.12s cubic-bezier(.4,1.2,.6,1), 
        box-shadow 0.15s;
      will-change: transform;
    }
    .discreet-animated-btn:hover, .discreet-animated-btn:focus-visible {
      transform: scale(1.025);
      box-shadow: 0 2px 8px 0 rgba(80, 80, 180, 0.08);
      filter: brightness(1.03);
      z-index: 1;
    }
    .discreet-animated-btn:active {
      transform: scale(0.98);
      filter: brightness(0.98);
    }
    .score-animate {
      animation: scorePop 0.6s cubic-bezier(.4,1.2,.6,1);
      z-index: 2;
      position: relative;
    }
    @keyframes scorePop {
      0% {
        transform: scale(0.96) translateY(10px);
        box-shadow: 0 0 0 0 rgba(255, 182, 193, 0.18);
        background: rgba(255,255,255,0.92);
      }
      60% {
        transform: scale(1.04) translateY(-2px);
        box-shadow: 0 4px 24px 0 rgba(255, 182, 193, 0.18);
        background: rgba(255,255,255,1);
      }
      100% {
        transform: scale(1) translateY(0);
        box-shadow: 0 2px 8px 0 rgba(80, 80, 180, 0.08);
        background: rgba(255,255,255,0.8);
      }
    }
    /* Scorecard glassmorphism and highlight */
    .scorecard-glass {
      background: rgba(255,255,255,0.85);
      box-shadow: 0 4px 24px 0 rgba(80, 180, 255, 0.10), 0 1.5px 8px 0 rgba(80, 80, 180, 0.08);
      border: 1.5px solid #a7c7e7;
      backdrop-filter: blur(8px);
      transition: box-shadow 0.18s, border 0.18s, transform 0.12s cubic-bezier(.4,1.2,.6,1);
      position: relative;
      overflow: hidden;
    }
    .scorecard-glass.score-animate {
      box-shadow: 0 8px 32px 0 rgba(255, 182, 193, 0.18), 0 2px 12px 0 rgba(80, 80, 180, 0.10);
      border-color: #f472b6;
      z-index: 2;
    }
    .scorecard-rank-badge {
      position: absolute;
      top: 0px; /* CHANGED from -18px to 8px to lower the badge */
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(90deg, #fbc2eb 0%, #a1c4fd 100%);
      color: #fff;
      font-weight: bold;
      font-size: 1.1rem;
      padding: 0.25rem 1.1rem;
      border-radius: 9999px;
      box-shadow: 0 2px 8px 0 rgba(80, 80, 180, 0.10);
      border: 2px solid #fff;
      letter-spacing: 0.02em;
      z-index: 3;
      pointer-events: none;
      user-select: none;
      /* Add a dark outline for better visibility */
      text-shadow: 0 1px 2px #1e293b, 0 0px 2px #1e293b;
    }
    .scorecard-index-circle {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 2.2rem;
      height: 2.2rem;
      background: linear-gradient(135deg, #fbc2eb 0%, #a1c4fd 100%);
      color: #fff;
      font-weight: bold;
      font-size: 1.2rem;
      border-radius: 9999px;
      box-shadow: 0 2px 8px 0 rgba(80, 80, 180, 0.10);
      border: 2px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 4;
      pointer-events: none;
      user-select: none;
      text-shadow: 0 1px 2px #1e293b, 0 0px 2px #1e293b;
    }
    .scorecard-animal-glow {
      box-shadow: 0 0 0 0 #fff, 0 0 16px 2px #a1c4fd, 0 0 32px 4px #fbc2eb;
      border: 2.5px solid #fbc2eb !important;
      background: #f0f4fa !important;
    }
    .scorecard-label {
      font-size: 0.98rem;
      color: #7e9acb;
      font-weight: 600;
      letter-spacing: 0.01em;
      margin-bottom: 0.1rem;
    }
    .scorecard-value {
      font-size: 1.35rem;
      font-weight: 700;
      color: #1e3a8a;
      margin-bottom: 0.1rem;
    }
    .scorecard-cps {
      font-size: 1.1rem;
      font-weight: 600;
      color: #f472b6;
      margin-bottom: 0.1rem;
    }
    .scorecard-mode {
      font-size: 0.95rem;
      color: #60a5fa;
      font-weight: 600;
      margin-bottom: 0.2rem;
      letter-spacing: 0.01em;
    }
    .scorecard-date {
      font-size: 0.85rem;
      color: #b6b6c7;
      font-weight: 500;
      margin-top: 0.2rem;
      letter-spacing: 0.01em;
    }
    /* Make the top 3 stat boxes the same size */
    .top-stat-box {
      min-width: 160px !important;
      max-width: 160px !important;
      min-height: 130px !important;
      height: 130px !important;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }
    @media (max-width: 640px) {
      .top-stat-box {
        min-width: 100px !important;
        max-width: 100% !important;
        min-height: 100px !important;
        height: 100px !important;
      }
    }
  `;

  // Make all boxes like the game area box but less transparent
  // Game area box: bg-white/60 hover:bg-white/70
  // We'll use bg-white/80 hover:bg-white/90 for all boxes (including stat boxes and scoreboard cards)
  const boxBgClass = "bg-white/80 hover:bg-white/90";

  let currentCPS = 0;
  if (isGameActive && hasStarted) {
    if (gameMode === "time") {
      currentCPS = (clickCount / (TIME_MODE_SECONDS - timeLeft || 1));
    } else {
      currentCPS = (clickCount / (elapsedTime || 1));
    }
  } else {
    if (scores.length > 0 && lastScoreId === scores[0].id) {
      const score = scores[0];
      if (score.gameMode === "time") {
        currentCPS = score.clicks / (TIME_MODE_SECONDS);
      } else {
        currentCPS = score.clicks / (score.time || 1);
      }
    }
  }
  const animal = getAnimalByCPS(Number(currentCPS.toFixed(1)));

  function AnimalVisual({ animal, size = 64, className = "" }: { animal: typeof animalData[0], size?: number, className?: string }) {
    if (animal.img) {
      return (
        <img
          src={animal.img}
          alt={animal.name}
          className={`w-[${size}px] h-[${size}px] rounded-full object-cover border-2 border-blue-200 mb-2 ${className}`}
          style={{ background: "#f0f4fa", width: size, height: size }}
        />
      );
    }
    return (
      <span
        className={className}
        style={{
          fontSize: size * 0.85,
          display: "inline-block",
          width: size,
          height: size,
          lineHeight: `${size}px`,
          textAlign: "center",
          background: "#f0f4fa",
          borderRadius: "9999px",
          border: "2px solid #bfdbfe",
          marginBottom: 8,
        }}
        aria-label={animal.name}
        role="img"
      >
        {animal.emoji}
      </span>
    );
  }

  return (
    <>
      <style>{gradientKeyframes}</style>
      <div
        className="flex flex-col items-center justify-center p-8 transition-colors duration-1000"
        style={animatedBgStyle}
      >
        <div className="max-w-4xl w-full">
          {/* Game Area (now includes Title) */}
          <div className={`w-full ${boxBgClass} transition-colors duration-700 rounded-2xl shadow-lg border-2 border-blue-200 flex flex-col items-center justify-center p-8 mb-8`} style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {/* Title inside game area */}
            <div className="text-center mb-8 w-full" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              <h1 className="text-7xl font-bold text-blue-900 mb-4" style={{ fontFamily: "'Open Sans', sans-serif" }}>SPEED CLICK TEST</h1>
            </div>
            {/* Clicks, Time, and Animal at the top - now in 3 boxes, centered and same size */}
            <div className="flex justify-center items-center gap-6 mb-6 w-full">
              <div className="flex justify-center w-full max-w-4xl gap-6">
                {/* Clicks Box */}
                <div className="top-stat-box transition-colors duration-700 rounded-lg shadow border border-blue-200 px-6 py-4 flex flex-col items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.8)" }}
                >
                  <div className="flex flex-col items-center justify-center h-full w-full">
                    <span className="font-semibold text-blue-700 text-base mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>Clicks</span>
                    <span
                      className="text-4xl font-extrabold text-blue-900 flex items-center justify-center w-full"
                      style={{
                        fontFamily: "'Open Sans', sans-serif",
                        textAlign: "center",
                        minHeight: "2.8rem",
                      }}
                    >
                      {clickCount}
                      {gameMode === 'clicks' && <span className="text-lg font-normal text-blue-500 ml-1">/{targetClicks}</span>}
                    </span>
                  </div>
                </div>
                {/* Time Box */}
                <div className="top-stat-box transition-colors duration-700 rounded-lg shadow border border-blue-200 px-6 py-4 flex flex-col items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.8)" }}
                >
                  <div className="flex flex-col items-center justify-center h-full w-full">
                    <span className="font-semibold text-blue-700 text-base mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>Time</span>
                    <span
                      className="text-4xl font-extrabold text-blue-900 flex items-center justify-center w-full"
                      style={{
                        fontFamily: "'Open Sans', sans-serif",
                        textAlign: "center",
                        minHeight: "2.8rem",
                      }}
                    >
                      {gameMode === 'time' ? timeLeft : elapsedTime}
                      <span className="text-lg font-normal text-blue-500 ml-1">s</span>
                    </span>
                  </div>
                </div>
                {/* Animal Box */}
                <div className="top-stat-box transition-colors duration-700 rounded-lg shadow border border-blue-200 px-6 py-4 flex flex-col items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.8)" }}
                >
                  <div className="flex flex-col items-center justify-center h-full w-full">
                    <span className="font-semibold text-blue-700 text-base mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>Your Speed</span>
                    <div className="flex flex-col items-center justify-center">
                      <AnimalVisual animal={animal} size={44} />
                      <span className="text-lg font-bold text-blue-900" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                        {animal.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Click Target - Wide Rectangle */}
            <div className="flex justify-center w-full mb-6">
              <button
                onClick={handleClick}
                disabled={!isGameActive}
                className={`
                  w-full max-w-4xl h-40 rounded-lg text-4xl font-bold transition-all duration-150
                  ${isGameActive 
                    ? 'bg-red-400 hover:bg-pink-500 active:scale-95 text-white cursor-pointer' 
                    : 'bg-blue-200 text-blue-600 cursor-not-allowed'
                  }
                `}
                style={{ fontFamily: "'Open Sans', sans-serif" }}
              >
                {isGameActive ? (hasStarted ? 'CLICK!' : 'Click to Start!') : 'Click  to Start'}
              </button>
            </div>

            {/* Game Mode Toggle and Start/Restart Button Row */}
            <div className="flex flex-row items-center justify-between w-full mt-2">
              <div className="flex flex-row gap-2">
                <button
                  onClick={() => handleGameModeChange('time')}
                  className={`discreet-animated-btn px-4 py-2 rounded ${
                    gameMode === 'time' 
                      ? 'bg-blue-500 text-white cursor-pointer' 
                      : 'bg-blue-200 text-blue-700 cursor-pointer'
                  }`}
                  style={{ fontFamily: "'Open Sans', sans-serif" }}
                  title="Click as many times as you can in 5 seconds!"
                >
                  5 Second Mode
                </button>
                <button
                  onClick={() => handleGameModeChange('clicks')}
                  className={`discreet-animated-btn px-4 py-2 rounded ${
                    gameMode === 'clicks' 
                      ? 'bg-blue-500 text-white cursor-pointer' 
                      : 'bg-blue-200 text-blue-700 cursor-pointer'
                  }`}
                  style={{ fontFamily: "'Open Sans', sans-serif" }}
                  title="Click 50 times as fast as you can!"
                >
                  50 Clicks Mode
                </button>
              </div>
              <button
                onClick={startGame}
                className="discreet-animated-btn bg-emerald-400 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded text-lg cursor-pointer"
                style={{ fontFamily: "'Open Sans', sans-serif" }}
              >
                {isGameActive ? 'Restart Game' : 'Start Game'}
              </button>
            </div>

            {/* Game instructions/message */}
            <div className="mt-6 text-center text-blue-700" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              {isGameActive ? (
                <div className="text-orange-500 text-xl font-bold mb-2" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  {!hasStarted
                    ? (gameMode === 'time'
                        ? 'Click the button to start the timer, then click as fast as you can!'
                        : 'Click the button to start the timer, then click 50 times as fast as you can!')
                    : (gameMode === 'time'
                        ? 'Click as fast as you can!'
                        : 'Click 50 times as fast as you can!')}
                </div>
              ) : null}
            </div>
          </div>

          {/* Scoreboard */}
          <div className={`w-full ${boxBgClass} transition-colors duration-700 rounded-2xl shadow-lg border-2 border-blue-200 flex flex-col items-center justify-center p-8`} style={{ fontFamily: "'Open Sans', sans-serif" }}>
            <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center" style={{ fontFamily: "'Open Sans', sans-serif" }}>SCOREBOARD</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {scores.map((score, index) => {
                const scoreCPS = score.gameMode === "time"
                  ? Number(getCPS(score.clicks, TIME_MODE_SECONDS))
                  : Number(getCPS(score.clicks, score.time));
                const scoreAnimal = getAnimalByCPS(scoreCPS);

                // Color for top 3 ranks
                let rankColor = "";
                if (index === 0) rankColor = "bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 text-yellow-900";
                else if (index === 1) rankColor = "bg-gradient-to-r from-gray-300 via-gray-200 to-gray-400 text-gray-900";
                else if (index === 2) rankColor = "bg-gradient-to-r from-orange-300 via-orange-200 to-orange-400 text-orange-900";

                // Score index (1-based, most recent at top left)
                const visibleIndex = index + 1;

                return (
                  <div
                    key={score.id}
                    className={`scorecard-glass rounded-2xl px-6 pt-8 pb-5 flex flex-col items-center shadow-lg border relative ${score.id === lastScoreId ? "score-animate" : ""}`}
                    style={{
                      fontFamily: "'Open Sans', sans-serif",
                      background: "rgba(255,255,255,0.8)",
                      minHeight: 210,
                    }}
                  >
                    
                    {/* Rank badge */}
                    <div className={`scorecard-rank-badge ${rankColor}`}>
                      #{scores.length - index}
                    </div>
                    {/* Animal visual with glow */}
                    <div className="mb-2 mt-2">
                      <AnimalVisual animal={scoreAnimal} size={60} className="scorecard-animal-glow" />
                    </div>
                    <div className="text-lg font-bold text-blue-800 mb-1">{scoreAnimal.name}</div>
                    <div className="scorecard-mode mb-1">
                      {score.gameMode === 'time' ? '5 Second Mode' : '50 Clicks Mode'}
                    </div>
                    <div className="flex flex-row gap-6 justify-center items-center w-full mb-1">
                      {score.gameMode === 'time' ? (
                        <>
                          <div className="flex flex-col items-center">
                            <div className="scorecard-label">Clicks</div>
                            <div className="scorecard-value">{score.clicks}</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="scorecard-label">CPS</div>
                            <div className="scorecard-cps">{getCPS(score.clicks, TIME_MODE_SECONDS)}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col items-center">
                            <div className="scorecard-label">Time</div>
                            <div className="scorecard-value">{score.time}s</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="scorecard-label">CPS</div>
                            <div className="scorecard-cps">{getCPS(score.clicks, score.time)}</div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="scorecard-date">
                      {getTimeAgo(Number(score.date))}
                    </div>
                  </div>
                );
              })}
              {scores.length === 0 && (
                <div className="text-blue-400 text-center text-lg col-span-full" style={{ fontFamily: "'Open Sans', sans-serif" }}>No scores yet</div>
              )}
            </div>
            {scores.length > 0 && (
              <div className="text-center mt-6">
                <button
                  onClick={resetScores}
                  className="discreet-animated-btn bg-pink-400 hover:bg-pink-500 text-white font-bold py-3 px-4 rounded text-lg cursor-pointer"
                  style={{ fontFamily: "'Open Sans', sans-serif" }}
                >
                  Reset Scores
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
