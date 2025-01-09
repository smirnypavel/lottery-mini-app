import { useState, useRef, useEffect } from "react";
import styles from "./ScratchTicket.module.css";

const ScratchTicket = ({ ticketId, price, poolSize }) => {
  const canvasRef = useRef(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [prize, setPrize] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [blockHeight, setBlockHeight] = useState(156823);
  const [players, setPlayers] = useState(1234);

  useEffect(() => {
    // Имитация обновления высоты блока
    const interval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
    }, 12000);

    const playersInterval = setInterval(() => {
      setPlayers((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(playersInterval);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Создаем футуристичный фон для области скретча
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2
    );

    gradient.addColorStop(0, "#0e1627");
    gradient.addColorStop(1, "#1a2538");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Добавляем декоративные элементы
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3;

      ctx.fillStyle = `rgba(32, 223, 255, ${Math.random() * 0.2})`;
      ctx.fillRect(x, y, size, size);
    }

    // Добавляем сетку
    ctx.strokeStyle = "rgba(32, 223, 255, 0.1)";
    ctx.lineWidth = 1;

    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
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

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 25);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, 2 * Math.PI);
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

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 25);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, 2 * Math.PI);
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
    const winProbability = 1 / (poolSize || 1000);
    const isWinner = Math.random() < winProbability;
    const amount = isWinner ? Math.floor(Math.random() * 50 + 1) : 0;
    setPrize(amount);
  };

  // Создаем массив точек для кольца токенов
  const tokenDots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const x = 50 + 45 * Math.cos(angle);
    const y = 50 + 45 * Math.sin(angle);
    return { x, y };
  });

  return (
    <div className={styles.container}>
      <div className={styles.ticket}>
        <div className={styles.hexagonBorder} />
        <div className={styles.ticketContent}>
          <div className={styles.networkStatus}>
            <div className={styles.statusDot} />
            MAINNET CONNECTED
          </div>

          <div className={styles.chainInfo}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>PLAYERS</div>
              <div className={styles.infoValue}>{players.toLocaleString()}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>TON POOL</div>
              <div className={styles.infoValue}>
                {(poolSize || 156.8).toFixed(1)}K
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>BLOCK</div>
              <div className={styles.infoValue}>#{blockHeight}</div>
            </div>
          </div>

          <div className={styles.scratchArea}>
            <div className={styles.scratchCircle}>
              <div className={styles.tokenRing}>
                {tokenDots.map((pos, i) => (
                  <div
                    key={i}
                    className={styles.tokenDot}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}
              </div>
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
                      <span className={styles.prizeText}>VERIFIED WIN</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.prizeAmount}>0 TON</span>
                      <span className={styles.prizeText}>NO MATCH</span>
                    </>
                  )
                ) : (
                  <span className={styles.prizeText}>SCRATCH HERE</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.prizes}>
            <div className={styles.prizeOption}>
              <div className={styles.prizeRank}>1ST PRIZE</div>
              <div className={styles.prizeValue}>50K TON</div>
            </div>
            <div className={styles.prizeOption}>
              <div className={styles.prizeRank}>2ND PRIZE</div>
              <div className={styles.prizeValue}>25K TON</div>
            </div>
            <div className={styles.prizeOption}>
              <div className={styles.prizeRank}>3RD PRIZE</div>
              <div className={styles.prizeValue}>10K TON</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchTicket;
