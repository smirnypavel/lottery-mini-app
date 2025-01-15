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

    // Применяем цвета темы Telegram
    document.documentElement.style.setProperty(
      "--tg-theme-bg-color",
      tg.themeParams.bg_color
    );
    document.documentElement.style.setProperty(
      "--tg-theme-text-color",
      tg.themeParams.text_color
    );
    document.documentElement.style.setProperty(
      "--tg-theme-button-color",
      tg.themeParams.button_color
    );
    document.documentElement.style.setProperty(
      "--tg-theme-button-text-color",
      tg.themeParams.button_text_color
    );
    tg.requestFullscreen();

    // Устанавливаем цвет хедера
    tg.setHeaderColor(tg.themeParams.bg_color);

    // Включаем подтверждение закрытия
    tg.enableClosingConfirmation();

    // Отключаем свайпы по вертикали для предотвращения случайного закрытия
    tg.disableVerticalSwipes();

    if (tg.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }

    tg.ready();
    tg.expand();

    // Настраиваем MainButton
    tg.MainButton.setText("КУПИТЬ БИЛЕТ");
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
      tg.HapticFeedback.impactOccurred("medium");
      setIsSelecting(true);
    });

    // Добавляем обработчик изменения темы
    tg.onEvent("themeChanged", () => {
      document.documentElement.style.setProperty(
        "--tg-theme-bg-color",
        tg.themeParams.bg_color
      );
      document.documentElement.style.setProperty(
        "--tg-theme-text-color",
        tg.themeParams.text_color
      );
      document.documentElement.style.setProperty(
        "--tg-theme-button-color",
        tg.themeParams.button_color
      );
      document.documentElement.style.setProperty(
        "--tg-theme-button-text-color",
        tg.themeParams.button_text_color
      );
      tg.setHeaderColor(tg.themeParams.bg_color);
    });

    return () => {
      tg.disableClosingConfirmation();
    };
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
