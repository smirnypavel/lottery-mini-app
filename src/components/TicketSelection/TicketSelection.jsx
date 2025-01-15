// src/components/TicketSelection/TicketSelection.jsx
import PropTypes from "prop-types";
import styles from "./TicketSelection.module.css";

const TicketSelection = ({ onSelect }) => {
  const tickets = [
    {
      id: 1,
      name: "Простой",
      price: 100,
      chance: "1 к 10",
      color: "#4CAF50",
      description: "Базовый билет для начинающих игроков",
      icon: "🎫",
    },
    {
      id: 2,
      name: "Золотой",
      price: 300,
      chance: "1 к 5",
      color: "#FFC107",
      description: "Увеличенные шансы на победу",
      icon: "✨",
    },
    {
      id: 3,
      name: "Платиновый",
      price: 500,
      chance: "1 к 3",
      color: "#9C27B0",
      description: "Максимальные шансы на крупный выигрыш",
      icon: "💎",
    },
  ];

  const handleSelect = (ticket) => {
    // Добавляем тактильный отклик
    window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");

    // Показываем подтверждение
    window.Telegram.WebApp.showPopup(
      {
        title: "Подтверждение",
        message: `Вы выбрали "${ticket.name}" билет за ${ticket.price}$. Подтвердить покупку?`,
        buttons: [
          {
            type: "ok",
            text: "Купить",
            id: "buy",
          },
          {
            type: "cancel",
            text: "Отмена",
          },
        ],
      },
      (buttonId) => {
        if (buttonId === "buy") {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
          onSelect(ticket);
        }
      }
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Выберите билет</h2>
        <p className={styles.subtitle}>
          Чем дороже билет, тем выше шанс выигрыша
        </p>
      </div>

      <div className={styles.ticketList}>
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className={styles.ticketCard}
            onClick={() => handleSelect(ticket)}
            style={{ "--ticket-color": ticket.color }}
          >
            <div className={styles.ticketIcon}>{ticket.icon}</div>

            <div className={styles.ticketContent}>
              <div className={styles.ticketHeader}>
                <span className={styles.ticketName}>{ticket.name}</span>
                <span className={styles.ticketPrice}>{ticket.price} $</span>
              </div>

              <p className={styles.ticketDescription}>{ticket.description}</p>

              <div className={styles.ticketInfo}>
                <div className={styles.chanceInfo}>
                  <span className={styles.chanceLabel}>Шанс выигрыша:</span>
                  <span className={styles.chanceValue}>{ticket.chance}</span>
                </div>
                <button className={styles.buyButton}>Купить билет</button>
              </div>
            </div>

            <div className={styles.shine}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

TicketSelection.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default TicketSelection;
