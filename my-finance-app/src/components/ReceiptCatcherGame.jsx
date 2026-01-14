import React, { useEffect, useRef, useState } from "react";

const positions = ["top-left", "top-right", "bottom-left", "bottom-right"];

const positionStyles = {
  "top-left": { top: "60px", left: "80px" },
  "top-right": { top: "60px", right: "80px" },
  "bottom-left": { bottom: "60px", left: "80px" },
  "bottom-right": { bottom: "60px", right: "80px" }
};

const INITIAL_LIFETIME = 1000; // мс
const MIN_LIFETIME = 400;      // мс
const DIFFICULTY_STEP = 100;   // -0.1 сек
const DIFFICULTY_INTERVAL = 15000; // 15 сек

export default function ReceiptCatcherGame() {
  const [wolfPosition, setWolfPosition] = useState("bottom-left");
  const wolfRef = useRef(wolfPosition);

  const [receipt, setReceipt] = useState(null);
  const receiptHandledRef = useRef(false);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const [receiptLifetime, setReceiptLifetime] = useState(INITIAL_LIFETIME);
  const gameStartTimeRef = useRef(Date.now());

  // актуальная позиция волка
  useEffect(() => {
    wolfRef.current = wolfPosition;
  }, [wolfPosition]);

  // управление
  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;

      switch (e.key.toLowerCase()) {
        case "w": setWolfPosition("top-left"); break;
        case "d": setWolfPosition("top-right"); break;
        case "a": setWolfPosition("bottom-left"); break;
        case "s": setWolfPosition("bottom-right"); break;
        default: break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver]);

  // генерация чеков
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      if (receipt) return;

      receiptHandledRef.current = false;
      const pos = positions[Math.floor(Math.random() * positions.length)];
      setReceipt({ position: pos });

    }, 1200);

    return () => clearInterval(interval);
  }, [receipt, gameOver]);

  // мгновенная ловля + промах по таймеру
  useEffect(() => {
    if (!receipt || receiptHandledRef.current) return;

    // мгновенная ловля
    if (wolfRef.current === receipt.position) {
      receiptHandledRef.current = true;
      setScore((s) => s + 1);
      setReceipt(null);
      return;
    }

    // промах через lifetime
    const timeout = setTimeout(() => {
      if (receiptHandledRef.current) return;

      receiptHandledRef.current = true;
      setLives((l) => {
        if (l - 1 <= 0) {
          setGameOver(true);
          return 0;
        }
        return l - 1;
      });
      setReceipt(null);
    }, receiptLifetime);

    return () => clearTimeout(timeout);
  }, [receipt, wolfPosition, receiptLifetime]);

  // рост сложности
  useEffect(() => {
    if (gameOver) return;

    const difficultyTimer = setInterval(() => {
      setReceiptLifetime((prev) =>
        Math.max(MIN_LIFETIME, prev - DIFFICULTY_STEP)
      );
    }, DIFFICULTY_INTERVAL);

    return () => clearInterval(difficultyTimer);
  }, [gameOver]);

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setReceipt(null);
    setWolfPosition("bottom-left");
    setReceiptLifetime(INITIAL_LIFETIME);
    gameStartTimeRef.current = Date.now();
  };

  return (
    <div style={styles.container}>
      <h2>Кешбекни!</h2>

      <div style={styles.info}>
        <span>Очки: {score}</span>
        <span>❤️ {lives}</span>
      </div>

      <div style={{ fontSize: 12, opacity: 0.7 }}>
        Время жизни чека: {(receiptLifetime / 1000).toFixed(1)} сек
      </div>

      <div style={styles.gameField}>
        <div style={{ ...styles.wolf, ...positionStyles[wolfPosition] }}>🐺</div>
        {receipt && (
          <div style={{ ...styles.receipt, ...positionStyles[receipt.position] }}>
            🧾
          </div>
        )}
      </div>

      <p>w ⬉ | d ⬈ | a ⬋ | s ⬊</p>

      {gameOver && (
        <div>
          <h3>Игра окончена</h3>
          <p>Финальный счёт: {score}</p>
          <button onClick={resetGame}>Играть снова</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: 500,
    padding: 20,
    background: "#1e1e2f",
    color: "white",
    borderRadius: 12,
    textAlign: "center"
  },
  info: {
    display: "flex",
    justifyContent: "space-between"
  },
  gameField: {
    position: "relative",
    height: 300,
    background: "#2a2a40",
    borderRadius: 10,
    margin: "20px 0"
  },
  wolf: {
    position: "absolute",
    fontSize: 40,
    transition: "all 0.12s linear"
  },
  receipt: {
    position: "absolute",
    fontSize: 32
  }
};
