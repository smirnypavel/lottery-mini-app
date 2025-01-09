import React, { useState, useRef, useEffect } from "react";
import styles from "./styles.module.css";

const CyberLottery = () => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 240;
    canvas.height = 240;

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
      0,
      Math.PI * 2
    );
    ctx.clip();

    // Create cyberpunk gradient background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#0A1824");
    gradient.addColorStop(1, "#142838");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add grid pattern
    ctx.strokeStyle = "rgba(0, 231, 255, 0.1)";
    ctx.lineWidth = 1;

    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
  }, []);

  // Generate dots around the circle
  const generateDots = () => {
    const dots = [];
    const totalDots = 12;
    const radius = 120;

    for (let i = 0; i < totalDots; i++) {
      const angle = (i * 2 * Math.PI) / totalDots;
      const x = Math.cos(angle) * radius + radius;
      const y = Math.sin(angle) * radius + radius;
      dots.push(
        <div
          key={i}
          className={styles.dot}
          style={{
            left: `${x}px`,
            top: `${y}px`,
            animation: `pulse 2s infinite ${i * (2 / totalDots)}s`,
          }}
        />
      );
    }
    return dots;
  };

  const handleScratch = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX ?? e.touches[0].clientX) - rect.left;
    const y = (e.clientY ?? e.touches[0].clientY) - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratch percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) transparentPixels++;
    }

    const newPercentage = (transparentPixels / (pixels.length / 4)) * 100;
    setScratchPercentage(newPercentage);

    if (newPercentage > 50 && !isRevealed) {
      setIsRevealed(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>TON LOTTERY</h1>
        <div className={styles.status}>
          <div className={styles.statusDot} />
          MAINNET CONNECTED
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>1,234</div>
          <div className={styles.statLabel}>Players</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>156.8K</div>
          <div className={styles.statLabel}>TON Pool</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>24H</div>
          <div className={styles.statLabel}>Until Draw</div>
        </div>
      </div>

      <div className={styles.scratchArea}>
        <div className={styles.scratchCircle} />
        <div className={styles.scratchDots}>{generateDots()}</div>
        {!isRevealed && (
          <canvas
            ref={canvasRef}
            className={styles.scratchCanvas}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={(e) => isDragging && handleScratch(e)}
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
        <div className={styles.scratchText}>
          {isRevealed ? "25K TON" : "SCRATCH\nHERE"}
        </div>
      </div>

      <div className={styles.prizes}>
        <div className={styles.prizeItem}>
          <div className={styles.prizeAmount}>50K TON</div>
          <div className={styles.prizeLabel}>1st Prize</div>
        </div>
        <div className={styles.prizeItem}>
          <div className={styles.prizeAmount}>25K TON</div>
          <div className={styles.prizeLabel}>2nd Prize</div>
        </div>
        <div className={styles.prizeItem}>
          <div className={styles.prizeAmount}>10K TON</div>
          <div className={styles.prizeLabel}>3rd Prize</div>
        </div>
      </div>

      <button className={styles.scratchButton}>SCRATCH TO REVEAL</button>
    </div>
  );
};

export default CyberLottery;
