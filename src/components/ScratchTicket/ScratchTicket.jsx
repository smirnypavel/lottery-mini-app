import { useState, useRef, useEffect } from "react";
import styles from "./ScratchTicket.module.css";

const ScratchTicket = ({ ticketId, price, poolSize }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const particlesRef = useRef(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [prize, setPrize] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [blockHeight, setBlockHeight] = useState(156823);
  const [players, setPlayers] = useState(1234);
  useEffect(() => {
    const preventDefault = (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    // Добавляем обработчики событий для предотвращения скролла
    document.addEventListener("touchmove", preventDefault, { passive: false });
    document.addEventListener("scroll", preventDefault, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventDefault);
      document.removeEventListener("scroll", preventDefault);
    };
  }, [isDragging]);
  // Инициализация частиц
  useEffect(() => {
    const createParticles = () => {
      return Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 1,
        delay: Math.random() * 5,
      }));
    };

    setParticles(createParticles());

    const interval = setInterval(() => {
      setParticles(createParticles());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Обновление блоков и игроков
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

  // Инициализация canvas и 3D-эффектов
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const containerWidth = canvas.offsetWidth;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = containerWidth * pixelRatio;
    canvas.height = containerWidth * pixelRatio;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerWidth}px`;

    ctx.scale(pixelRatio, pixelRatio);

    // Создаем футуристичный фон для скретча
    const gradient = ctx.createRadialGradient(
      containerWidth / 2,
      containerWidth / 2,
      0,
      containerWidth / 2,
      containerWidth / 2,
      containerWidth / 2
    );

    gradient.addColorStop(0, "#0e1627");
    gradient.addColorStop(0.5, "#1a2538");
    gradient.addColorStop(1, "#0e1627");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, containerWidth, containerWidth);

    // Добавляем матричные символы
    ctx.font = "12px monospace";
    ctx.fillStyle = "rgba(32, 223, 255, 0.2)";

    for (let i = 0; i < containerWidth; i += 20) {
      for (let j = 0; j < containerWidth; j += 20) {
        if (Math.random() > 0.5) {
          const char = String.fromCharCode(0x30a0 + Math.random() * 96);
          ctx.fillText(char, i, j);
        }
      }
    }

    // Добавляем сетку
    ctx.strokeStyle = "rgba(32, 223, 255, 0.1)";
    ctx.lineWidth = 1;

    for (let i = 0; i < containerWidth; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, containerWidth);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(containerWidth, i);
      ctx.stroke();
    }
  }, []);

  // Обработчики движения мыши для 3D-эффекта
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    const ticket = containerRef.current.querySelector(`.${styles.ticket}`);
    if (ticket) {
      const rotateX = y * 10;
      const rotateY = -x * 10;
      ticket.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.05, 1.05, 1.05)
      `;
    }
  };

  const handleMouseLeave = () => {
    const ticket = containerRef.current?.querySelector(`.${styles.ticket}`);
    if (ticket) {
      ticket.style.transform = "none";
    }
  };

  // Обработчики скретча
  const handleStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    scratch(e.touches ? e.touches[0] : e);
  };

  const handleMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) return;
    scratch(e.touches ? e.touches[0] : e);
  };

  const handleEnd = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(false);
    checkRevealThreshold();
  };
  const scratch = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x =
      ((e.clientX || e.touches[0].clientX) - rect.left) *
      (canvas.width / rect.width);
    const y =
      ((e.clientY || e.touches[0].clientY) - rect.top) *
      (canvas.height / rect.height);

    ctx.globalCompositeOperation = "destination-out";

    // Увеличиваем размер области стирания для лучшего опыта
    const radius = 35;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
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
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  };

  // Создаем токены на кольце
  const tokenDots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const x = 50 + 45 * Math.cos(angle);
    const y = 50 + 45 * Math.sin(angle);
    return { x, y };
  });

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.hologramFrame} />
      <div className={styles.ticket}>
        <div className={styles.gridOverlay} />
        <div className={styles.particleContainer}>
          {particles.map((particle) => (
            <div
              key={particle.id}
              className={styles.particle}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>
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

          <div className={styles.scratchArea}>
            <div className={styles.tokenRing}>
              {tokenDots.map((pos, i) => (
                <div
                  key={i}
                  className={styles.tokenDot}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: "translate(-50%, -50%)",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
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
                <span className={styles.prizeText}>VERIFY TX</span>
              )}
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
