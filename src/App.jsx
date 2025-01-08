import { useState, useEffect } from "react";
import styles from "./App.module.css";

function App() {
  const [, setTg] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const telegram = window.Telegram.WebApp;
    setTg(telegram);

    // Получаем данные пользователя
    if (telegram.initDataUnsafe?.user) {
      setUser(telegram.initDataUnsafe.user);
    }

    // Настраиваем приложение
    telegram.ready();
    telegram.expand();

    // Показываем главную кнопку
    telegram.MainButton.setText("УЧАСТВОВАТЬ В ЛОТЕРЕЕ");
    telegram.MainButton.show();
    telegram.MainButton.onClick(() => {
      telegram.showPopup({
        message: "Скоро открытие! Следите за обновлениями.",
      });
    });
  }, []);

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
        <div className={styles.lotteryInfo}>
          <h2 className={styles.subtitle}>Текущий розыгрыш</h2>
          <div className={styles.card}>
            <p className={styles.prizeAmount}>Призовой фонд: 100,000 ₽</p>
            <p className={styles.timestamp}>До окончания: 24ч 00м</p>
            <p className={styles.participants}>Участников: 0</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
