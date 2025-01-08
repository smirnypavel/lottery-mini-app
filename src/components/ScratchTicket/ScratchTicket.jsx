// src/components/ScratchTicket/ScratchTicket.jsx
import { useState, useRef, useEffect } from "react";
import styles from "./ScratchTicket.module.css";

// eslint-disable-next-line react/prop-types
const ScratchTicket = ({ ticketId, price }) => {
  const canvasRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [isScratched, setIsScratched] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [prize, setPrize] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Устанавливаем размер canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Заполняем серым цветом
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    scratch(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      scratch(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    checkRevealThreshold();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    scratchTouch(e);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (isDragging) {
      scratchTouch(e);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    checkRevealThreshold();
  };

  const scratch = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fill();
  };

  const scratchTouch = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fill();
  };

  const checkRevealThreshold = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) {
        transparentPixels++;
      }
    }

    const totalPixels = pixels.length / 4;
    const scratchedPercentage = (transparentPixels / totalPixels) * 100;

    if (scratchedPercentage > 50 && !isRevealed) {
      revealPrize();
    }
  };

  const revealPrize = () => {
    setIsRevealed(true);
    // Симулируем случайный выигрыш
    const isWinner = Math.random() > 0.5;
    const amount = isWinner ? Math.floor(Math.random() * 5 + 1) * 100 : 0;
    setPrize(amount);
  };

  return (
    <div className={styles.ticket}>
      <div className={styles.ticketInfo}>
        <span>Билет #{ticketId}</span>
        <span>{price} ₽</span>
      </div>
      <div className={styles.scratchArea}>
        {!isRevealed ? (
          <canvas
            ref={canvasRef}
            className={styles.scratchCanvas}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        ) : null}
        <div
          className={`${styles.prizeArea} ${isRevealed ? styles.revealed : ""}`}
        >
          {isRevealed ? (
            prize > 0 ? (
              <>
                <span className={styles.prizeAmount}>+{prize} ₽</span>
                <span className={styles.prizeText}>Поздравляем!</span>
              </>
            ) : (
              <>
                <span className={styles.prizeAmount}>0 ₽</span>
                <span className={styles.prizeText}>
                  Повезет в следующий раз!
                </span>
              </>
            )
          ) : (
            <span className={styles.scratchText}>
              Потрите, чтобы узнать результат
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScratchTicket;
