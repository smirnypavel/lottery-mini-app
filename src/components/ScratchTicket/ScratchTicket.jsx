// ScratchTicket.jsx
import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./ScratchTicket.module.css";

const ScratchTicket = ({ ticketId, price }) => {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [prize, setPrize] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const tg = window.Telegram.WebApp;

    // Отключаем случайное закрытие свайпом
    tg.disableClosingConfirmation();
    tg.disableVerticalSwipes();

    // Включаем подтверждение при закрытии если билет не стерт
    if (!isRevealed) {
      tg.enableClosingConfirmation();
    }

    // Настраиваем кнопку Back если нужно
    if (isRevealed) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        tg.HapticFeedback.impactOccurred("medium");
        // Логика возврата
      });
    } else {
      tg.BackButton.hide();
    }

    return () => {
      tg.disableClosingConfirmation();
      tg.BackButton.hide();
    };
  }, [isRevealed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const tg = window.Telegram.WebApp;

    // Устанавливаем размер canvas с учетом SafeAreaInset
    const safeArea = tg.safeAreaInset || {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };
    canvas.width = canvas.offsetWidth - (safeArea.left + safeArea.right);
    canvas.height = canvas.offsetHeight - (safeArea.top + safeArea.bottom);

    ctx.fillStyle = tg.themeParams.secondary_bg_color || "#1B1464";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Слушаем изменения темы
    tg.onEvent("themeChanged", () => {
      ctx.fillStyle = tg.themeParams.secondary_bg_color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
  }, []);

  const handleMouseDown = (e) => {
    window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
    setIsDragging(true);
    scratch(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
      scratch(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    checkRevealThreshold();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
    setIsDragging(true);
    scratchTouch(e);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (isDragging) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
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
      // Показываем прогресс в MainButton
      const tg = window.Telegram.WebApp;
      tg.MainButton.showProgress();
      tg.MainButton.setText("Проверяем результат...");

      // Имитируем задержку для анимации
      setTimeout(() => {
        tg.MainButton.hideProgress();
        revealPrize();
      }, 1500);
    }
  };

  const revealPrize = () => {
    const tg = window.Telegram.WebApp;
    setIsRevealed(true);
    const isWinner = Math.random() > 0.5;
    const amount = isWinner ? Math.floor(Math.random() * 5 + 1) * 100 : 0;
    setPrize(amount);

    if (isWinner) {
      // Успешная тактильная отдача при выигрыше
      tg.HapticFeedback.notificationOccurred("success");
      // Показываем поздравление
      tg.showPopup({
        title: "Поздравляем!",
        message: `Вы выиграли ${amount}₽!`,
        buttons: [
          {
            id: "collect",
            type: "default",
            text: "Забрать выигрыш",
          },
        ],
      });
    } else {
      // Ошибочная тактильная отдача при проигрыше
      tg.HapticFeedback.notificationOccurred("error");
      tg.showPopup({
        message: "К сожалению, в этот раз не повезло. Попробуйте ещё раз!",
        buttons: [
          {
            id: "retry",
            type: "default",
            text: "Купить ещё билет",
          },
        ],
      });
    }
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
