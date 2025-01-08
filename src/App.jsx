import { useState, useEffect } from "react";
import styles from "./App.module.css";
import ScratchTicket from "./components/ScratchTicket/ScratchTicket";
import TicketSelection from "./components/TicketSelection/TicketSelection";

function App() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    const tg = window.Telegram.WebApp;

    // Получаем пользователя из Telegram
    if (tg.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }

    // Настраиваем приложение
    tg.ready();
    tg.expand(); // Старый метод, разворачивает WebApp, но не на весь экран
    tg.requestFullscreen(); // Новый метод для полноэкранного режима

    // Настраиваем главную кнопку
    tg.MainButton.setText("КУПИТЬ БИЛЕТ");
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
      setIsSelecting(true);
      tg.requestFullscreen(); // Включение полноэкранного режима при нажатии на кнопку
    });
  }, []);

  const handleSelectTicket = (selectedTicket) => {
    const newTicket = {
      id: Date.now(),
      type: selectedTicket.name,
      price: selectedTicket.price,
      purchased: new Date().toISOString(),
      chance: selectedTicket.chance,
    };

    setTickets((prev) => [...prev, newTicket]);
    setIsSelecting(false);

    window.Telegram.WebApp.showPopup({
      message: `Билет "${selectedTicket.name}" куплен успешно!`,
    });
  };

  const handleRevealTicket = async (ticketId) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    const chance = parseInt(ticket.chance.split(" к ")[1]);

    return new Promise((resolve) => {
      setTimeout(() => {
        const isWinner = Math.random() * chance < 1;
        const amount = isWinner ? ticket.price * chance : 0;
        resolve({
          amount,
          isWinner,
        });
      }, 1500);
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Лотерея</h1>
        {user && (
          <div className={styles.userInfo}>
            <p>
              Привет,{" "}
              <span className={styles.userName}>{user.first_name}!</span>
            </p>
            <p className={styles.userBalance}>Баланс: 0 ₽</p>
          </div>
        )}
      </header>

      <main className={styles.main}>
        {isSelecting ? (
          <TicketSelection onSelect={handleSelectTicket} />
        ) : tickets.length > 0 ? (
          <div className={styles.ticketsList}>
            {tickets.map((ticket) => (
              <ScratchTicket
                key={ticket.id}
                ticketId={ticket.id}
                price={ticket.price}
                onReveal={handleRevealTicket}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>У вас пока нет билетов</p>
            <p className={styles.hint}>
              Нажмите кнопку КУПИТЬ БИЛЕТ внизу экрана
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
