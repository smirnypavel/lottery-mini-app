import { useState, useRef, useEffect } from "react";
import styles from "./ScratchTicket.module.css";

const ScratchTicket = ({ ticketId, poolSize, timeLeft, prizeAmount }) => {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [prize, setPrize] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Create circular gradient for scratch area
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2
    );
    gradient.addColorStop(0, "#0A1929");
    gradient.addColorStop(1, "#0F2942");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some noise texture
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1,
        1
      );
    }
  }, []);

  const handleScratch = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX ?? e.touches[0].clientX) - rect.left;
    const y = (e.clientY ?? e.touches[0].clientY) - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
    gradient.addColorStop(0, "rgba(0,0,0,1)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    checkRevealThreshold();
  };

  const checkRevealThreshold = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) transparentPixels++;
    }

    if ((transparentPixels / (pixels.length / 4)) * 100 > 50) {
      revealPrize();
    }
  };

  const revealPrize = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      setPrize(Math.random() > 0.5 ? prizeAmount : 0);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>TON LOTTERY</h1>
        <div className={styles.status}>
          <span className={styles.statusDot}></span>
          MAINNET CONNECTED
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.value}>{ticketId}</span>
          <span className={styles.label}>PLAYERS</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{poolSize}</span>
          <span className={styles.label}>TON POOL</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{timeLeft}</span>
          <span className={styles.label}>UNTIL DRAW</span>
        </div>
      </div>

      <div className={styles.scratchArea}>
        {!isRevealed && (
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            onMouseDown={(e) => {
              setIsDragging(true);
              handleScratch(e);
            }}
            onMouseMove={(e) => isDragging && handleScratch(e)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={(e) => {
              e.preventDefault();
              setIsDragging(true);
              handleScratch(e);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              isDragging && handleScratch(e);
            }}
            onTouchEnd={() => setIsDragging(false)}
          />
        )}
        <div
          className={`${styles.prizeArea} ${isRevealed ? styles.revealed : ""}`}
        >
          {isRevealed ? (
            <>
              <span
                className={`${styles.prizeAmount} ${
                  prize > 0 ? styles.won : styles.lost
                }`}
              >
                {prize > 0 ? `+${prize} TON` : "0 TON"}
              </span>
              <span className={styles.prizeText}>
                {prize > 0 ? "Congratulations!" : "Try again next time!"}
              </span>
            </>
          ) : (
            <div className={styles.scratchText}>
              <span className={styles.glowingRing}>SCRATCH HERE</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.prizes}>
        <div className={styles.prize}>
          <span className={styles.prizeValue}>50K TON</span>
          <span className={styles.prizeLabel}>1ST PRIZE</span>
        </div>
        <div className={styles.prize}>
          <span className={styles.prizeValue}>25K TON</span>
          <span className={styles.prizeLabel}>2ND PRIZE</span>
        </div>
        <div className={styles.prize}>
          <span className={styles.prizeValue}>10K TON</span>
          <span className={styles.prizeLabel}>3RD PRIZE</span>
        </div>
      </div>

      <button className={styles.scratchButton}>SCRATCH TO REVEAL</button>
    </div>
  );
};

export default ScratchTicket;
