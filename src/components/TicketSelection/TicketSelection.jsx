// src/components/TicketSelection/TicketSelection.jsx
import PropTypes from "prop-types";
import styles from "./TicketSelection.module.css";

const TicketSelection = ({ onSelect }) => {
  const tickets = [
    { id: 1, name: "Простой", price: 100, chance: "1 к 10", color: "#4CAF50" },
    { id: 2, name: "Золотой", price: 300, chance: "1 к 5", color: "#FFC107" },
    {
      id: 3,
      name: "Платиновый",
      price: 500,
      chance: "1 к 3",
      color: "#9C27B0",
    },
  ];

  const handleSelect = (ticket) => {
    onSelect(ticket);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Выберите билет</h2>
      <div className={styles.ticketList}>
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className={styles.ticketCard}
            onClick={() => handleSelect(ticket)}
            style={{ "--ticket-color": ticket.color }}
          >
            <div className={styles.ticketHeader}>
              <span className={styles.ticketName}>{ticket.name}</span>
              <span className={styles.ticketPrice}>{ticket.price} ₽</span>
            </div>
            <div className={styles.ticketInfo}>
              <span className={styles.chanceLabel}>Шанс выигрыша:</span>
              <span className={styles.chanceValue}>{ticket.chance}</span>
            </div>
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
