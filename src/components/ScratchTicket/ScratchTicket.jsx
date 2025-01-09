import { useState, useRef, useEffect } from "react";
import styles from "./ScratchTicket.module.css";

const ScratchTicket = ({ ticketId, price, poolSize }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [prize, setPrize] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [blockHeight, setBlockHeight] = useState(156823);
  const [players, setPlayers] = useState(1234);

  // Prevent scroll when scratching
  useEffect(() => {
    const preventScroll = (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventScroll, { passive: false });
    return () => document.removeEventListener("touchmove", preventScroll);
  }, [isDragging]);

  useEffect(() => {
    const blockInterval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
    }, 12000);

    const playersInterval = setInterval(() => {
      setPlayers((prev) => {
        const increment = Math.floor(Math.random() * 3);
        return prev + increment;
      });
    }, 5000);

    return () => {
      clearInterval(blockInterval);
      clearInterval(playersInterval);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const containerWidth = canvas.offsetWidth;
    const pixelRatio = window.devicePixelRatio || 1;

    // Set canvas size with device pixel ratio
    canvas.width = containerWidth * pixelRatio;
    canvas.height = containerWidth * pixelRatio;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerWidth}px`;

    // Scale context for retina displays
    ctx.scale(pixelRatio, pixelRatio);

    // Create cyberpunk scratch layer
    const gradient = ctx.createRadialGradient(
      containerWidth / 2,
      containerWidth / 2,
      0,
      containerWidth / 2,
      containerWidth / 2,
      containerWidth / 2
    );

    gradient.addColorStop(0, "#0e1627");
    gradient.addColorStop(1, "#1a2538");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, containerWidth, containerWidth);

    // Add matrix-like effect
    ctx.fillStyle = "rgba(32, 223, 255, 0.1)";
    const gridSize = 20;
    for (let x = 0; x < containerWidth; x += gridSize) {
      for (let y = 0; y < containerWidth; y += gridSize) {
        if (Math.random() > 0.5) {
          ctx.fillText(String.fromCharCode(0x30a0 + Math.random() * 96), x, y);
        }
      }
    }

    // Add noise effect
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < 0.05) {
        data[i] = data[i + 1] = data[i + 2] = Math.random() * 255;
        data[i + 3] = 25;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  const getScaledCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: ((e.clientX || e.touches[0].clientX) - rect.left) * scaleX,
      y: ((e.clientY || e.touches[0].clientY) - rect.top) * scaleY,
    };
  };

  const scratch = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const coords = getScaledCoordinates(e, canvas);
    const pixelRatio = window.devicePixelRatio || 1;
    const radius = 25 * pixelRatio;

    ctx.globalCompositeOperation = "destination-out";
    const gradient = ctx.createRadialGradient(
      coords.x,
      coords.y,
      0,
      coords.x,
      coords.y,
      radius
    );

    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    scratch(e.touches ? e.touches[0] : e);
  };

  const handleMove = (e) => {
    e.preventDefault();
    if (!isDragging) return;
    scratch(e.touches ? e.touches[0] : e);
  };

  const handleEnd = () => {
    setIsDragging(false);
    checkRevealThreshold();
  };

  const checkRevealThreshold = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    const winProbability = 1 / (poolSize || 1000);
    const isWinner = Math.random() < winProbability;

    let winAmount = 0;
    if (isWinner) {
      const prizes = [10000, 25000, 50000];
      const weights = [0.7, 0.25, 0.05];
      const random = Math.random();
      let sum = 0;

      for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        if (random <= sum) {
          winAmount = prizes[i];
          break;
        }
      }
    }

    setPrize(winAmount);
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.ticket}>
        <div className={styles.glassMorphism} />
        <div className={styles.ticketContent}>
          <div className={styles.networkStatus}>
            <div className={styles.statusDot} />
            <span className={styles.statusText}>MAINNET CONNECTED</span>
          </div>

          <div className={styles.chainInfo}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>PLAYERS</div>
              <div className={styles.infoValue}>{formatNumber(players)}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>TON POOL</div>
              <div className={styles.infoValue}>
                {formatNumber(poolSize || 156800)}
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>BLOCK</div>
              <div className={styles.infoValue}>#{blockHeight}</div>
            </div>
          </div>

          <div className={styles.scratchContainer}>
            <div className={styles.scratchArea}>
              <div className={styles.tokenRing} />
              {!isRevealed && (
                <canvas
                  ref={canvasRef}
                  className={styles.scratchCanvas}
                  onMouseDown={handleStart}
                  onMouseMove={handleMove}
                  onMouseUp={handleEnd}
                  onMouseLeave={handleEnd}
                  onTouchStart={handleStart}
                  onTouchMove={handleMove}
                  onTouchEnd={handleEnd}
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
                        +{formatNumber(prize)} TON
                      </span>
                      <span className={styles.prizeText}>TX CONFIRMED</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.prizeAmount}>0 TON</span>
                      <span className={styles.prizeText}>TX FAILED</span>
                    </>
                  )
                ) : (
                  <span className={styles.prizeText}>TAP TO VERIFY</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.prizes}>
            <div className={styles.prizeOption}>
              <div className={styles.prizeRank}>1ST</div>
              <div className={styles.prizeValue}>50K TON</div>
            </div>
            <div className={styles.prizeOption}>
              <div className={styles.prizeRank}>2ND</div>
              <div className={styles.prizeValue}>25K TON</div>
            </div>
            <div className={styles.prizeOption}>
              <div className={styles.prizeRank}>3RD</div>
              <div className={styles.prizeValue}>10K TON</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchTicket;
