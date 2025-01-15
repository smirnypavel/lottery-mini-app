import { useState, useEffect } from "react";
import styles from "./App.module.css";
import ScratchTicket from "./components/ScratchTicket/ScratchTicket";
import TicketSelection from "./components/TicketSelection/TicketSelection";

function App() {
  const [user, setUser] = useState(null);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    const tg = window.Telegram.WebApp;

    if (tg.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }

    tg.ready();
    tg.expand();

    tg.MainButton.setText("КУПИТЬ БИЛЕТ");
    tg.MainButton.show();
    tg.MainButton.onClick(() => setIsSelecting(true));
  }, []);

  const handleSelectTicket = (selectedTicket) => {
    // Когда выбираем новый билет, заменяем текущий
    setCurrentTicket({
      ...selectedTicket,
      id: Date.now(), // Уникальный ID для каждого билета
    });
    setIsSelecting(false);
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
        ) : currentTicket ? (
          <ScratchTicket
            key={currentTicket.id}
            ticketId={currentTicket.id}
            price={currentTicket.price}
          />
        ) : (
          <div className={styles.emptyState}>
            <p>У вас нет активного билета</p>
            <p className={styles.hint}>
              Нажмите кнопку &quot;КУПИТЬ БИЛЕТ&quot; внизу экрана
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
