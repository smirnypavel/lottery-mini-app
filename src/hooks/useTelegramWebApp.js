// src/hooks/useTelegramWebApp.js
import { useState, useEffect } from "react";

const useTelegramWebApp = () => {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (!tg) {
      console.error("Telegram WebApp is not available");
      return;
    }

    setWebApp(tg);

    if (tg.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }

    // Настройка темы
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

    tg.enableClosingConfirmation();
    tg.expand();

    tg.ready();
    setIsReady(true);

    return () => {
      tg.disableClosingConfirmation();
    };
  }, []);

  const showMainButton = (text, callback) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text);
      webApp.MainButton.onClick(callback);
      webApp.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  };

  const showPopup = (message, buttons = []) => {
    if (webApp) {
      webApp.showPopup({
        message,
        buttons,
      });
    }
  };

  return {
    webApp,
    user,
    isReady,
    showMainButton,
    hideMainButton,
    showPopup,
  };
};

export default useTelegramWebApp;
