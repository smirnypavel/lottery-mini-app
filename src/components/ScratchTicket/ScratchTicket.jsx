// ScratchTicket.jsx
import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./ScratchTicket.module.css";

const ScratchTicket = ({ ticketId, price }) => {
  const canvasRef = useRef(null);
  // const [isScratched, setIsScratched] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [prize, setPrize] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.fillStyle = "#1B1464";
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
    const isWinner = Math.random() > 0.5;
    const amount = isWinner ? Math.floor(Math.random() * 5 + 1) * 100 : 0;
    setPrize(amount);
  };

  return (
    <div className={styles.ticket}>
      <div className={styles.ticketInner}>
        <div className={styles.ticketContent}>
          <div className={styles.ticketHeader}>
            <h1 className={styles.ticketTitle}>BIG WIN</h1>
          </div>

          <div className={styles.ticketInfo}>
            <span className={styles.ticketNumber}>#{ticketId}</span>
            <span className={styles.ticketPrice}>{price}₽</span>
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
              className={`${styles.prizeArea} ${
                isRevealed ? styles.revealed : ""
              }`}
            >
              {isRevealed ? (
                prize > 0 ? (
                  <>
                    <div className={styles.symbolCell}>
                      <span className={styles.symbol}>★</span>
                    </div>
                    <div className={styles.symbolCell}>
                      <span className={`${styles.prizeAmount} ${styles.won}`}>
                        {prize}₽
                      </span>
                    </div>
                    <div className={styles.symbolCell}>
                      <span className={styles.symbol}>★</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.symbolCell}>
                      <span className={styles.symbol}>✖</span>
                    </div>
                    <div className={styles.symbolCell}>
                      <span className={styles.prizeAmount}>0₽</span>
                    </div>
                    <div className={styles.symbolCell}>
                      <span className={styles.symbol}>✖</span>
                    </div>
                  </>
                )
              ) : (
                <span className={styles.scratchText}>СТЕРЕТЬ</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ScratchTicket.propTypes = {
  ticketId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  price: PropTypes.number.isRequired,
};

export default ScratchTicket;
