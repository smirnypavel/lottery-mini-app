import React, { useEffect, useRef, useState } from "react";
import styles from "./ScratchTicket.module.css";
// import EnhancedIcons from "./EnhancedIcons";
// import { useParams } from "react-router-dom";

const TonLotteryCard = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const [isScratching, setIsScratching] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const lastMousePosRef = useRef(null);
  // const { id } = useParams<{ id: string }>();
  useEffect(() => {
    // Create blockchain nodes
    const nodeCount = 12;
    const newNodes = Array.from({ length: nodeCount }, (_, i) => {
      const angle = (i * 2 * Math.PI) / nodeCount;
      const radius = 120;
      return {
        x: Math.cos(angle) * radius + 150,
        y: Math.sin(angle) * radius + 150,
      };
    });
    setNodes(newNodes);

    // Create connections with improved randomization
    const newConnections = [];
    for (let i = 0; i < nodeCount; i++) {
      // Ensure each node has at least one connection
      const j = (i + 1) % nodeCount;
      const dx = newNodes[j].x - newNodes[i].x;
      const dy = newNodes[j].y - newNodes[i].y;
      newConnections.push({
        start: i,
        end: j,
        angle: Math.atan2(dy, dx) * (180 / Math.PI),
        distance: Math.sqrt(dx * dx + dy * dy),
      });

      // Add random additional connections
      for (let j = i + 2; j < nodeCount; j++) {
        if (Math.random() > 0.7) {
          const dx = newNodes[j].x - newNodes[i].x;
          const dy = newNodes[j].y - newNodes[i].y;
          newConnections.push({
            start: i,
            end: j,
            angle: Math.atan2(dy, dx) * (180 / Math.PI),
            distance: Math.sqrt(dx * dx + dy * dy),
          });
        }
      }
    }
    setConnections(newConnections);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    contextRef.current = ctx;

    // Настраиваем размеры canvas равными размеру визуализатора
    canvas.width = 200;
    canvas.height = 200;

    // Рисуем скретч-слой
    ctx.fillStyle = "rgba(13, 17, 23, 0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Рисуем сумму выигрыша
    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "#00EAFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("100", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "bold 24px Arial";
    ctx.fillText("TON", canvas.width / 2, canvas.height / 2 + 20);

    // Накладываем слой для стирания
    ctx.fillStyle = "#0D1117";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Enhanced rotation calculation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -15; // Reduced rotation angle
    const rotY = ((x - centerX) / centerX) * 15;

    // Enhanced glow position
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;
    setRotateX(rotX);
    setRotateY(rotY);
    setGlowPosition({ x: glowX, y: glowY });
  };

  const handleMouseLeave = () => {
    // Smooth reset animation
    setRotateX(0);
    setRotateY(0);
    setGlowPosition({ x: 50, y: 50 });
  };
  // Вынесем общую логику в универсальные методы
  const handlePointerDown = (x, y) => {
    setIsScratching(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    lastMousePosRef.current = {
      x: x - rect.left,
      y: y - rect.top,
    };
  };

  const handlePointerMove = (x, y) => {
    if (!isScratching || !contextRef.current || !lastMousePosRef.current)
      return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentPos = {
      x: x - rect.left,
      y: y - rect.top,
    };

    const ctx = contextRef.current;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 40;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastMousePosRef.current.x, lastMousePosRef.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastMousePosRef.current = currentPos;

    // Подсчет прогресса стирания
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] === 0) transparentPixels++;
    }
    setRevealProgress((transparentPixels / (pixels.length / 4)) * 100);
  };

  const handlePointerUp = () => {
    setIsScratching(false);
  };

  return (
    <div className={styles.container}>
      <div
        ref={cardRef}
        className={styles.card}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        <div className={styles.floatingOrbs}>
          {[...Array(8)].map((_, i) => (
            <div
              key={`orb-${i}`}
              className={styles.floatingOrb}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                //@ts-ignore
                "--tx1": `${-50 + Math.random() * 100}px`,
                "--ty1": `${-50 + Math.random() * 100}px`,
                "--tx2": `${-50 + Math.random() * 100}px`,
                "--ty2": `${-50 + Math.random() * 100}px`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
        <div
          className={styles.glowEffect}
          style={{
            "--x": `${glowPosition.x}%`,
            "--y": `${glowPosition.y}%`,
          }}
        />
        <div className={styles.cardInner}>
          {/* <Particles />  */}
          {/* <div className="relative w-full h-full">
            <div className={`${styles.iconWrapper} ${styles.iconOne}`} >
                <div className={styles.trailEffect} />
                <div className={styles.iconGlow} />
                <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor" d="M15.977 7.813c-.587-1.504-2.074-1.641-3.81-1.299l-.613-2.164l-1.315.382l.604 2.087l-1.046.317l-.604-2.113l-1.303.381l.613 2.143l-.836.257V7.8l-1.804.514l.398 1.398s.965-.3.956-.275c.527-.154.789.107.917.36l.703 2.447l.142-.021l-.142.038l.986 3.438c.026.171 0 .463-.364.57c.017.008-.956.278-.956.278l.188 1.637l1.702-.488l.943-.262l.625 2.173l1.299-.377l-.609-2.147l1.046-.291l.613 2.142l1.316-.377L15 16.384c2.164-.758 3.549-1.757 3.15-3.878c-.326-1.706-1.324-2.229-2.657-2.165c.643-.612.921-1.422.493-2.528zm-.489 5.186c.46 1.628-2.374 2.237-3.257 2.498l-.827-2.884c.887-.257 3.596-1.307 4.085.386m-1.774-3.905c.42 1.488-1.954 1.976-2.696 2.19l-.75-2.614c.742-.21 3-1.114 3.446.433z"/>
                </svg>
            </div>

            <div className={`${styles.iconWrapper} ${styles.iconTwo}`} >
                <div className={styles.trailEffect} />
                <div className={styles.iconGlow} />
                <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor" fillRule="evenodd" d="M14.06 8.44a23 23 0 0 0-.315-2.098v-.001c-.18-.867-.401-1.638-.686-2.191c-.276-.547-.623-.91-1.06-.91c-.434 0-.787.362-1.064.91c-.278.551-.505 1.317-.68 2.193c-.13.654-.234 1.368-.312 2.098a31 31 0 0 0-1.968-.777l-.003-.002c-.842-.284-1.618-.475-2.238-.51h-.002c-.61-.027-1.1.09-1.318.464l-.001.002c-.217.38-.076.865.256 1.378L4.67 9l.003.005a9 9 0 0 0 1.556 1.678A31 31 0 0 0 7.89 12q-.852.63-1.66 1.318l-.003.002c-.668.586-1.216 1.165-1.557 1.682l-.001.002c-.331.514-.473.998-.255 1.378l.143-.082l-.142.083c.218.375.713.492 1.318.464h.011a9 9 0 0 0 2.233-.51a31 31 0 0 0 1.968-.778q.119 1.052.308 2.095l.002.006c.18.866.401 1.638.686 2.19c.276.548.623.91 1.059.91s.788-.361 1.065-.91c.278-.55.505-1.317.68-2.193c.13-.654.233-1.368.312-2.098q.97.422 1.967.777c.72.265 1.47.436 2.232.511h.012c.61.028 1.099-.09 1.317-.463l-.185-.108l.186.105c.218-.38.076-.864-.255-1.377l-.003-.005l-.003-.004a9 9 0 0 0-1.555-1.678A31 31 0 0 0 16.11 12q.852-.63 1.661-1.318l.003-.002c.668-.586 1.216-1.165 1.556-1.682l.002-.002c.331-.513.472-.998.255-1.378v-.002c-.22-.374-.714-.491-1.319-.464h-.005l-.006.001a9 9 0 0 0-2.233.511q-.997.356-1.965.777M12 3.67c-.172 0-.417.149-.682.674c-.253.502-.471 1.224-.643 2.083a24 24 0 0 0-.32 2.198Q11.189 9 12 9.428q.811-.427 1.646-.805a23 23 0 0 0-.322-2.195c-.177-.858-.39-1.583-.648-2.083v-.002c-.267-.527-.506-.674-.677-.674"/>
                </svg>
            </div>

            <div className={`${styles.iconWrapper} ${styles.iconThree}`} >
                <div className={styles.trailEffect} />
                <div className={styles.iconGlow} />
                <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19.011 9.201L12.66 19.316a.857.857 0 0 1-1.453-.005L4.98 9.197a1.8 1.8 0 0 1-.266-.943a1.856 1.856 0 0 1 1.881-1.826h10.817c1.033 0 1.873.815 1.873 1.822c0 .334-.094.664-.274.951M6.51 8.863l4.632 7.144V8.143H6.994c-.48 0-.694.317-.484.72m6.347 7.144l4.633-7.144c.214-.403-.005-.72-.485-.72h-4.148z"/>
                </svg>
            </div>

            <div className={`${styles.iconWrapper} ${styles.iconFour}`} >
                <div className={styles.trailEffect} />
                <div className={styles.iconGlow} />
                <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g fill="none" fillRule="evenodd">
                    <path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/>
                    <path fill="currentColor" d="M17.42 3a2 2 0 0 1 1.649.868l.087.14L22.49 9.84a2 2 0 0 1-.208 2.283l-.114.123l-9.283 9.283a1.25 1.25 0 0 1-1.666.091l-.102-.09l-9.283-9.284a2 2 0 0 1-.4-2.257l.078-.15l3.333-5.832a2 2 0 0 1 1.572-1.001L6.58 3h10.84Zm0 2H6.58l-3.333 5.833L12 19.586l8.753-8.753L17.42 5ZM15 6a1 1 0 1 1 0 2h-2v1.545c.758.07 1.447.217 2.004.426c.395.148.749.336 1.013.571c.264.234.483.557.483.958c0 .401-.219.724-.483.958c-.264.235-.618.423-1.013.57c-.594.223-1.338.377-2.157.44A.995.995 0 0 1 13 14v2a1 1 0 1 1-2 0v-2c0-.196.056-.378.153-.532c-.819-.063-1.563-.216-2.157-.44c-.395-.147-.749-.335-1.013-.57c-.264-.234-.483-.557-.483-.958c0-.401.219-.724.483-.958c.264-.235.618-.423 1.013-.57c.556-.21 1.245-.357 2.004-.427V8H9a1 1 0 1 1 0-2h6Zm-2.001 4.55a1 1 0 0 1-1.998 0a6.778 6.778 0 0 0-1.654.357c-.33.124-.56.259-.701.383c-.117.104-.14.172-.145.199L8.5 11.5c0 .013.005.085.146.21c.14.124.372.26.701.382c.655.246 1.592.408 2.653.408c1.06 0 1.998-.162 2.653-.408c.329-.123.56-.258.7-.382a.46.46 0 0 0 .14-.178l.007-.032l-.007-.032a.46.46 0 0 0-.14-.178c-.14-.124-.371-.26-.7-.382c-.44-.165-1.008-.293-1.654-.358Z"/>
                </g>
                </svg>
            </div>
            </div> */}
          {/* <EnhancedIcons /> */}
          {/* Добавим дополнительные слои глубины */}
          <div
            className={styles.layer1}
            style={{ transform: "translateZ(80px)" }}
          ></div>
          <div
            className={styles.layer2}
            style={{ transform: "translateZ(60px)" }}
          ></div>
          <div
            className={styles.layer3}
            style={{ transform: "translateZ(40px)" }}
          ></div>
          <div
            className={styles.layer4}
            style={{ transform: "translateZ(20px)" }}
          ></div>

          <div className={styles.header}>
            <div className={styles.headerGlow}></div>
            <h1 className={styles.title}>TON LOTTERY</h1>
            <div className={styles.networkStatus}>
              <span className={styles.networkDot}></span>
              <span className={styles.networkText}>MAINNET CONNECTED</span>
            </div>
          </div>
          <div className={styles.statsContainer}>
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
          <div className={styles.visualizer}>
            <div className={styles.visualizerBg}></div>

            {[...Array(3)].map((_, i) => (
              <div
                key={`ring-${i}`}
                className={styles.orbitalRing}
                style={{
                  animationDelay: `${-i * 2}s`,
                  animationDuration: `${20 + i * 5}s`,
                }}
              />
            ))}

            {connections.map((conn, index) => (
              <div
                key={`conn-${index}`}
                className={styles.connection}
                style={{
                  width: `${conn.distance}px`,
                  left: `${nodes[conn.start].x}px`,
                  top: `${nodes[conn.start].y}px`,
                  transform: `rotate(${conn.angle}deg)`,
                }}
              />
            ))}

            {nodes.map((node, index) => (
              <div
                key={`node-${index}`}
                className={styles.node}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                }}
              >
                <div className={styles.nodeGlow}></div>
                <div className={styles.nodePulse}></div>
              </div>
            ))}
            <div className={styles.scratchOverlay}>
              <canvas
                ref={canvasRef}
                className={styles.scratchCanvas}
                /* Мышь */
                onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                /* Тач-события */
                onTouchStart={(e) => {
                  // Берём первый палец
                  const touch = e.touches[0];
                  handlePointerDown(touch.clientX, touch.clientY);
                }}
                onTouchMove={(e) => {
                  e.preventDefault(); // Чтобы страница не скроллилась
                  const touch = e.touches[0];
                  handlePointerMove(touch.clientX, touch.clientY);
                }}
                onTouchEnd={handlePointerUp}
                onTouchCancel={handlePointerUp}
              />
              {revealProgress < 30 && (
                <div className={styles.scratchText}>
                  SCRATCH
                  <br />
                  HERE
                </div>
              )}
            </div>
          </div>
          <div className={styles.prizePools}>
            <div className={styles.prizePool}>
              <div className={styles.prizeAmount}>50K TON</div>
              <div className={styles.prizeLabel}>1st Prize</div>
            </div>
            <div className={styles.prizePool}>
              <div className={styles.prizeAmount}>25K TON</div>
              <div className={styles.prizeLabel}>2nd Prize</div>
            </div>
            <div className={styles.prizePool}>
              <div className={styles.prizeAmount}>10K TON</div>
              <div className={styles.prizeLabel}>3rd Prize</div>
            </div>
          </div>

          {/* <div className={styles.infoPanel}>
  <div className={styles.infoPanelTitle}>Lottery Info</div>
  <div className={styles.infoGrid}>
    <div className={styles.infoItem}>
      <span className={styles.infoIcon}>🎯</span>
      <span className={styles.infoText}>Daily Draws</span>
    </div>
    <div className={styles.infoItem}>
      <span className={styles.infoIcon}>💎</span>
      <span className={styles.infoText}>Guaranteed Winners</span>
    </div>
    <div className={styles.infoItem}>
      <span className={styles.infoIcon}>🔒</span>
      <span className={styles.infoText}>Smart Contract Secured</span>
    </div>
    <div className={styles.infoItem}>
      <span className={styles.infoIcon}>⚡</span>
      <span className={styles.infoText}>Instant Payouts</span>
    </div>
  </div>
</div>       */}
          <div className={styles.scratchArea}>
            <div className={styles.scratchGradient}></div>
            <div className={styles.scratchText}>SCRATCH TO REVEAL</div>
          </div>

          {[...Array(4)].map((_, i) => (
            <div
              key={`corner-${i}`}
              className={`${styles.cornerDecor} ${
                styles[`cornerDecor${i + 1}`]
              }`}
            >
              <div className={styles.cornerInner}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TonLotteryCard;
