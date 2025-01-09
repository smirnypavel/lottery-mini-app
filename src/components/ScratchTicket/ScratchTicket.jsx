import { useState, useRef, useEffect } from "react";
import styles from "./ScratchTicket.module.css";

const ScratchTicket = ({ ticketId, price, poolSize }) => {
  const canvasRef = useRef(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [prize, setPrize] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Create cyber-themed scratch overlay
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2
    );

    gradient.addColorStop(0, "#1a2a3a");
    gradient.addColorStop(1, "#0d151c");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some "digital noise" effect
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2;
      ctx.fillStyle = `rgba(0, 255, 255, ${Math.random() * 0.1})`;
      ctx.fillRect(x, y, size, size);
    }
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

    // Create a glowing scratch effect
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
    gradient.addColorStop(0, "rgba(0, 255, 255, 1)");
    gradient.addColorStop(1, "rgba(0, 255, 255, 0)");

    ctx.fillStyle = gradient;
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
    setIsScratched(true);
    // Simulate random win with pool size consideration
    const winProbability = 1 / (poolSize || 1000); // Default 0.1% chance
    const isWinner = Math.random() < winProbability;
    const amount = isWinner ? Math.floor(Math.random() * 50 + 1) : 0;
    setPrize(amount);
  };

  return (
    <div className={styles.ticket}>
      <div className={styles.ticketInner}>
        <div className={styles.ticketContent}>
          <div className={styles.ticketInfo}>
            <span className={styles.ticketNumber}>#{ticketId}</span>
            <span className={styles.ticketPrice}>{price} TON</span>
          </div>
          <div className={styles.scratchArea}>
            {!isRevealed && (
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
            )}
            <div
              className={`${styles.prizeArea} ${
                isRevealed ? styles.revealed : ""
              }`}
            >
              {isRevealed ? (
                prize > 0 ? (
                  <>
                    <span className={`${styles.prizeAmount} ${styles.won}`}>
                      +{prize} TON
                    </span>
                    <span className={styles.prizeText}>WINNER!</span>
                  </>
                ) : (
                  <>
                    <span className={styles.prizeAmount}>0 TON</span>
                    <span className={styles.prizeText}>TRY AGAIN</span>
                  </>
                )
              ) : (
                <span className={styles.scratchText}>SCRATCH HERE</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchTicket;
