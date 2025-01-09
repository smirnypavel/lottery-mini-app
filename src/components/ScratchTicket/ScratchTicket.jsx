import React, { useEffect, useRef, useState } from "react";
import styles from "./ScratchTicket.module.css";

const ScratchTicket = () => {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const lastMousePosRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 240;
    canvas.height = 240;

    // Create gradient background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#0D1117");
    gradient.addColorStop(1, "#1A1F2F");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add grid pattern
    ctx.strokeStyle = "rgba(0, 234, 255, 0.1)";
    ctx.lineWidth = 1;
    const gridSize = 20;

    for (let i = 0; i < canvas.width; i += gridSize) {
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

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsScratching(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX ?? e.touches[0].clientX;
    const y = e.clientY ?? e.touches[0].clientY;

    lastMousePosRef.current = {
      x: x - rect.left,
      y: y - rect.top,
    };
  };

  const handlePointerMove = (e) => {
    e.preventDefault();
    if (!isScratching || !lastMousePosRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX ?? e.touches[0].clientX;
    const y = e.clientY ?? e.touches[0].clientY;

    const currentPos = {
      x: x - rect.left,
      y: y - rect.top,
    };

    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 40;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(lastMousePosRef.current.x, lastMousePosRef.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastMousePosRef.current = currentPos;

    // Calculate reveal progress
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) transparentPixels++;
    }

    setRevealProgress((transparentPixels / (pixels.length / 4)) * 100);
  };

  const handlePointerUp = () => {
    setIsScratching(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>TON LOTTERY</h1>
            <div className={styles.status}>
              <span className={styles.dot}></span>
              MAINNET CONNECTED
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.value}>156.8K</div>
              <div className={styles.label}>TON POOL</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.value}>24H</div>
              <div className={styles.label}>UNTIL DRAW</div>
            </div>
          </div>

          <div className={styles.scratchArea}>
            <canvas
              ref={canvasRef}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className={styles.canvas}
            />
            {revealProgress < 30 && (
              <div className={styles.scratchText}>SCRATCH HERE</div>
            )}
          </div>

          <div className={styles.prizes}>
            <div className={styles.prize}>
              <span className={styles.amount}>50K TON</span>
              <span className={styles.label}>1ST PRIZE</span>
            </div>
            <div className={styles.prize}>
              <span className={styles.amount}>25K TON</span>
              <span className={styles.label}>2ND PRIZE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchTicket;
