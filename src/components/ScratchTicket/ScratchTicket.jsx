// src/components/ScratchTicket/ScratchTicket.jsx
import { useState } from "react";
import styles from "./ScratchTicket.module.css";

// eslint-disable-next-line react/prop-types
const ScratchTicket = ({ ticketId, price, onReveal }) => {
  const [isScratched, setIsScratched] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleScratch = async () => {
    if (isScratched) return;

    setIsRevealing(true);
    // eslint-disable-next-line no-unused-vars
    const result = await onReveal(ticketId);
    setIsScratched(true);
    setIsRevealing(false);
  };

  return (
    <div className={styles.ticket}>
      <div className={styles.ticketHeader}>
        <span className={styles.ticketId}>№ {ticketId}</span>
        <span className={styles.price}>{price} ₽</span>
      </div>

      <div
        className={`${styles.scratchArea} ${
          isScratched ? styles.scratched : ""
        }`}
        onClick={handleScratch}
      >
        {!isScratched && !isRevealing && (
          <div className={styles.scratchOverlay}>
            <span>Нажмите, чтобы стереть</span>
          </div>
        )}

        {isRevealing && (
          <div className={styles.revealing}>
            <span>Открываем...</span>
          </div>
        )}

        {isScratched && (
          <div className={styles.prizeArea}>
            <span className={styles.prizeAmount}>1000 ₽</span>
            <span className={styles.prizeText}>Поздравляем!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScratchTicket;
