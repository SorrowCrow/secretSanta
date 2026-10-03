'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Locale = 'en' | 'ru';

export interface Translations {
  [key: string]: string;
}

export const translations: Record<Locale, Translations> = {
  en: {
    // Navbar
    'nav.brand': 'Secret Santa',
    'nav.year': '🎅 2026',
    'nav.subtitle': 'Holiday Gift Exchange',
    'nav.home': 'Home',
    'nav.newExchange': 'New Exchange',
    'nav.langSwitch': 'RU',

    // Hero
    'hero.word1': 'Organize',
    'hero.word2': 'Secret',
    'hero.word3': 'Santa',
    'hero.unwrapHint': '🎁 Click to unwrap & create room',
    'hero.createCta': 'Create Exchange Room',
    'hero.joinCta': 'Join Existing Room',

    // Quick Join Card
    'quickJoin.title': 'Enter an Exchange',
    'quickJoin.subtitle': 'Already invited? Enter Room ID or invite link:',
    'quickJoin.placeholder': 'Paste Room ID or link...',
    'quickJoin.button': 'Go to Room',
    'quickJoin.errorEmpty': 'Please enter a room ID or paste an invite link',

    // Create Form Card
    'create.cardTitle': 'Create Your Secret Santa Exchange',
    'create.cardDesc': 'Set up your room in 10 seconds. You will get a shareable link and a secret host key.',
    'create.titleLabel': 'Exchange Title',
    'create.titlePlaceholder': 'e.g. Family Holiday 2026 or Marketing Team Santa',
    'create.budgetLabel': 'Budget Limit (Optional)',
    'create.budgetPlaceholder': 'e.g. €20, €30, €50',
    'create.budgetHint': 'Suggests gift ideas to participants',
    'create.dateLabel': 'Exchange Date (Optional)',
    'create.showAdvanced': 'Show Advanced Security & Settings',
    'create.hideAdvanced': 'Hide Advanced Security & Settings',
    'create.passwordLabel': 'Room Password (Optional)',
    'create.passwordPlaceholder': 'Protect room from unwanted visitors',
    'create.passwordHint': 'If set, participants must enter this password to view details and join.',
    'create.adminKeyLabel': 'Custom Host Admin Key (Optional)',
    'create.adminKeyPlaceholder': 'Leave blank to generate randomly',
    'create.adminKeyHint': 'Secret key needed to trigger the Santa draw. Keep it safe!',
    'create.submitBtn': 'Create Secret Santa Room 🎁',
    'create.submittingBtn': 'Creating Room...',
    'create.titleRequired': 'Please enter an exchange title',

    // Created Modal
    'createdModal.title': 'Exchange Created!',
    'createdModal.desc': 'Your room is ready for participants.',
    'createdModal.step1': '1. Share This Link With Participants:',
    'createdModal.copy': 'Copy',
    'createdModal.copied': 'Copied!',
    'createdModal.adminWarningTitle': 'Save Your Host Admin Key!',
    'createdModal.adminWarningDesc': 'You will need this secret key to start the Santa match draw later. Do NOT share it with participants!',
    'createdModal.saved': 'Saved!',
    'createdModal.enterRoom': 'Go to Exchange Room',

    // Session Page
    'session.loading': 'Loading Secret Santa workshop...',
    'session.notFound': 'Exchange Not Found',
    'session.backHome': 'Back to Secret Santa Home',
    'session.statusOpen': 'Accepting Participants',
    'session.statusLocked': 'Draw Complete • Locked',
    'session.passwordProtected': 'Password Protected',
    'session.budget': 'Budget:',
    'session.exchangeDate': 'Exchange:',
    'session.elvesJoined': '{count} Elves Joined',
    'session.oneElfJoined': '1 Elf Joined',
    'session.hostControls': 'Host Controls',
    'session.refresh': 'Refresh Roster',
    'session.shareBarLabel': 'Share this invite link with your group:',
    'session.copyLink': 'Copy Link',
    'session.copied': 'Copied!',

    // Locked Banner
    'session.lockedBannerTitle': 'Submissions have ended! The Secret Santa draw has taken place 🎅',
    'session.lockedBannerDesc':
      "Santa's workshop has paired everyone into a secret gift circle. Check your inbox for your recipient, personal rhyming poem, and AI gift ideas!",

    // Join Form
    'session.joinTitle': 'Join This Secret Santa',
    'session.joinDesc': 'Fill in your details below to participate in the draw',
    'session.firstName': 'First Name',
    'session.firstNamePlaceholder': 'e.g. Alice',
    'session.lastName': 'Last Name',
    'session.lastNamePlaceholder': 'e.g. Smith',
    'session.email': 'Email Address',
    'session.emailPlaceholder': 'alice@example.com',
    'session.emailPrivacyBadge': 'Never displayed publicly',
    'session.emailPrivacyHint': 'Your email will only be used to send your secret match reveal.',
    'session.wishlist': 'Wishlist / Gift Preferences (Optional)',
    'session.wishlistPlaceholder': 'e.g. Warm wool socks, dark roast coffee beans, fantasy books...',
    'session.wishlistAiBadge': 'Santa AI will use this',
    'session.hobbies': 'Hobbies / Interests (Optional)',
    'session.hobbiesPlaceholder': 'e.g. Board games, hiking, photography, baking...',
    'session.hobbiesHint': 'Helps your secret Santa choose a thoughtful gift!',
    'session.joinBtn': 'Join Exchange 🎄',
    'session.joiningBtn': 'Joining Santa List...',
    'session.joinSuccess': 'You have been registered! Check your email when the host triggers the draw.',

    // Locked Summary Block
    'session.summaryTitle': 'Exchange Summary',
    'session.summaryDesc': 'This exchange has locked with {count} participating elves. Each participant has been emailed their secret recipient.',
    'session.totalPairs': 'Total Matched Pairs:',
    'session.matchingMode': 'Matching Mode:',
    'session.matchingModeVal': 'Cyclic Derangement (Zero Self-Matches)',
    'session.exchangeDay': 'Exchange Day:',

    // Workshop Roster
    'session.rosterTitle': 'Workshop Roster',
    'session.rosterSubtitle': 'Public participant list (emails hidden)',
    'session.emptyRoster': 'No elves yet. Be the first to join the workshop!',
    'session.privacyFooter': 'Strict Email Privacy: Emails are encrypted on the server and never revealed in this roster or sent to other participants.',
    'session.removeParticipant': 'Remove participant',
    'session.confirmRemoveParticipant': 'Are you sure you want to remove {name} from this exchange?',
    'session.participantRemoved': 'Participant removed successfully',
    'session.enterAdminKeyToManage': 'Please enter your Host Admin Key to manage participants:',

    // Password Gate Modal
    'session.gateTitle': 'Password Protected Room',
    'session.gateDesc': 'The host has locked this exchange with a password. Enter password to view details and register.',
    'session.gatePlaceholder': 'Enter room password...',
    'session.gateUnlockBtn': 'Unlock Exchange',
    'session.gateCheckingBtn': 'Checking Key...',

    // Host Controls Modal
    'session.hostModalTitle': 'Host Administration',
    'session.hostModalDesc': 'Enter your secret Host Admin Key to start the draw.',
    'session.hostKeyLabel': 'Host Admin Key',
    'session.hostKeyPlaceholder': 'Paste your secret admin key...',
    'session.hostKeyHint': 'This key was shown only once when creating this exchange room.',
    'session.startDrawBtn': 'Start Secret Santa Draw 🎅',
    'session.drawingBtn': 'Drawing Matches & Dispatching Emails...',
    'session.drawAlreadyCompleted': 'Draw Already Completed (Room Locked)',
    'session.needMoreElves': 'Need at least 2 participants to start draw (currently: {count})',
    'session.close': 'Close',

    // Confirm Draw Modal
    'session.confirmTitle': 'Confirm Secret Santa Draw',
    'session.confirmDesc':
      'Are you sure you want to start the draw now? Once started, submissions will lock permanently and secret assignment emails will be sent immediately to all {count} participants.',
    'session.confirmYes': 'Yes, Start Secret Santa Now! 🎁',
    'session.confirmCancel': 'Cancel',

    // Footer
    'footer.cheer': 'Made with festive cheer',
    'footer.free': 'Free & Zero-Cost',
    'footer.privacy': '100% Privacy',
    'footer.note': 'No participant emails are ever made public or sold. Santa’s elves only deliver matches straight to individual inboxes!',
  },
  ru: {
    // Navbar
    'nav.brand': 'Тайный Санта',
    'nav.year': '🎅 2026',
    'nav.subtitle': 'Новогодний обмен подарками',
    'nav.home': 'Главная',
    'nav.newExchange': 'Создать обмен',
    'nav.langSwitch': 'EN',

    // Hero
    'hero.word1': 'Организуйте',
    'hero.word2': 'Тайного',
    'hero.word3': 'Санту',
    'hero.unwrapHint': '🎁 Нажмите, чтобы открыть и создать',
    'hero.createCta': 'Создать комнату',
    'hero.joinCta': 'Войти в комнату',

    // Quick Join Card
    'quickJoin.title': 'Войти в комнату',
    'quickJoin.subtitle': 'Вас уже пригласили? Введите ID комнаты или ссылку:',
    'quickJoin.placeholder': 'Вставьте ID или ссылку на комнату...',
    'quickJoin.button': 'Перейти в комнату',
    'quickJoin.errorEmpty': 'Пожалуйста, введите ID или ссылку на комнату',

    // Create Form Card
    'create.cardTitle': 'Создайте комнату Тайного Санты',
    'create.cardDesc': 'Настройка за 10 секунд. Вы получите ссылку для участников и секретный ключ организатора.',
    'create.titleLabel': 'Название обмена',
    'create.titlePlaceholder': 'например, Семья 2026 или Коллеги по офису',
    'create.budgetLabel': 'Лимит бюджета (необязательно)',
    'create.budgetPlaceholder': 'например, 20 €, 30 €, 50 €',
    'create.budgetHint': 'Используется для подсказок подарков',
    'create.dateLabel': 'Дата обмена (необязательно)',
    'create.showAdvanced': 'Показать дополнительные настройки',
    'create.hideAdvanced': 'Скрыть дополнительные настройки',
    'create.passwordLabel': 'Пароль комнаты (необязательно)',
    'create.passwordPlaceholder': 'Защитить комнату от посторонних',
    'create.passwordHint': 'Если задан, участникам нужно ввести пароль для просмотра и регистрации.',
    'create.adminKeyLabel': 'Свой ключ администратора (необязательно)',
    'create.adminKeyPlaceholder': 'Оставьте пустым для автогенерации',
    'create.adminKeyHint': 'Секретный ключ для запуска жеребьёвки. Сохраните его!',
    'create.submitBtn': 'Создать комнату Тайного Санты 🎁',
    'create.submittingBtn': 'Создание комнаты...',
    'create.titleRequired': 'Пожалуйста, укажите название обмена',

    // Created Modal
    'createdModal.title': 'Комната создана!',
    'createdModal.desc': 'Ваша комната готова принимать участников.',
    'createdModal.step1': '1. Отправьте эту ссылку участникам:',
    'createdModal.copy': 'Копировать',
    'createdModal.copied': 'Скопировано!',
    'createdModal.adminWarningTitle': 'Сохраните ключ администратора!',
    'createdModal.adminWarningDesc': 'Этот ключ нужен вам, чтобы запустить жеребьёвку. НЕ отправляйте его участникам!',
    'createdModal.saved': 'Сохранено!',
    'createdModal.enterRoom': 'Перейти в комнату',

    // Session Page
    'session.loading': 'Загрузка мастерской Санты...',
    'session.notFound': 'Комната не найдена',
    'session.backHome': 'На главную',
    'session.statusOpen': 'Приём заявок',
    'session.statusLocked': 'Жеребьёвка проведена • Закрыто',
    'session.passwordProtected': 'Защищено паролем',
    'session.budget': 'Бюджет:',
    'session.exchangeDate': 'Обмен:',
    'session.elvesJoined': '{count} участников',
    'session.oneElfJoined': '1 участник',
    'session.hostControls': 'Управление организатора',
    'session.refresh': 'Обновить список',
    'session.shareBarLabel': 'Ссылка-приглашение для вашей группы:',
    'session.copyLink': 'Копировать ссылку',
    'session.copied': 'Скопировано!',

    // Locked Banner
    'session.lockedBannerTitle': 'Приём заявок завершён! Жеребьёвка Тайного Санты проведена 🎅',
    'session.lockedBannerDesc':
      'Мастерская Санты распределила всех участников в тайный круг подарков. Проверьте почту — там имя вашего получателя, праздничный стих и идеи подарков!',

    // Join Form
    'session.joinTitle': 'Присоединиться к Тайному Санте',
    'session.joinDesc': 'Заполните форму ниже для участия в жеребьёвке',
    'session.firstName': 'Имя',
    'session.firstNamePlaceholder': 'например, Анна',
    'session.lastName': 'Фамилия',
    'session.lastNamePlaceholder': 'например, Иванова',
    'session.email': 'Email адрес',
    'session.emailPlaceholder': 'anna@example.com',
    'session.emailPrivacyBadge': 'Не отображается публично',
    'session.emailPrivacyHint': 'Ваш email используется только для отправки результата жеребьёвки.',
    'session.wishlist': 'Список желаний / Пожелания (необязательно)',
    'session.wishlistPlaceholder': 'например, тёплые носки, кофе в зёрнах, книги в жанре фэнтези...',
    'session.wishlistAiBadge': 'Используется ИИ Санты',
    'session.hobbies': 'Хобби / Интересы (необязательно)',
    'session.hobbiesPlaceholder': 'например, настолки, походы, кулинария, фотография...',
    'session.hobbiesHint': 'Поможет вашему Санте выбрать душевный подарок!',
    'session.joinBtn': 'Участвовать в игре 🎄',
    'session.joiningBtn': 'Запись в список Санты...',
    'session.joinSuccess': 'Вы успешно зарегистрированы! Ожидайте письмо, когда организатор запустит жеребьёвку.',

    // Locked Summary Block
    'session.summaryTitle': 'Итоги жеребьёвки',
    'session.summaryDesc': 'Жеребьёвка закрыта. В обмене участвуют {count} чел. Каждому отправлено секретное письмо с именем получателя.',
    'session.totalPairs': 'Всего пар:',
    'session.matchingMode': 'Алгоритм:',
    'session.matchingModeVal': 'Циклический беспорядок (без самоподарков)',
    'session.exchangeDay': 'День обмена:',

    // Workshop Roster
    'session.rosterTitle': 'Список участников',
    'session.rosterSubtitle': 'Публичный список (email скрыты)',
    'session.emptyRoster': 'Пока никого нет. Станьте первым участником!',
    'session.privacyFooter': 'Строгая приватность email: Email адреса хранятся в безопасности на сервере и никогда не отображаются в списке.',
    'session.removeParticipant': 'Удалить участника',
    'session.confirmRemoveParticipant': 'Вы уверены, что хотите удалить {name} из обмена?',
    'session.participantRemoved': 'Участник успешно удалён',
    'session.enterAdminKeyToManage': 'Введите ключ администратора для управления участниками:',

    // Password Gate Modal
    'session.gateTitle': 'Комната защищена паролем',
    'session.gateDesc': 'Организатор закрыл комнату паролем. Введите пароль для входа и регистрации.',
    'session.gatePlaceholder': 'Введите пароль комнаты...',
    'session.gateUnlockBtn': 'Войти в комнату',
    'session.gateCheckingBtn': 'Проверка пароля...',

    // Host Controls Modal
    'session.hostModalTitle': 'Панель организатора',
    'session.hostModalDesc': 'Введите секретный ключ администратора для запуска жеребьёвки.',
    'session.hostKeyLabel': 'Ключ администратора',
    'session.hostKeyPlaceholder': 'Вставьте ваш ключ администратора...',
    'session.hostKeyHint': 'Этот ключ был показан один раз при создании комнаты.',
    'session.startDrawBtn': 'Запустить жеребьёвку 🎅',
    'session.drawingBtn': 'Жеребьёвка и отправка писем...',
    'session.drawAlreadyCompleted': 'Жеребьёвка уже проведена (комната закрыта)',
    'session.needMoreElves': 'Для запуска нужно минимум 2 участника (сейчас: {count})',
    'session.close': 'Закрыть',

    // Confirm Draw Modal
    'session.confirmTitle': 'Подтвердить запуск жеребьёвки',
    'session.confirmDesc':
      'Вы уверены? После запуска приём заявок закроется навсегда, а письма с назначениями будут немедленно отправлены всем {count} участникам.',
    'session.confirmYes': 'Да, провести жеребьёвку сейчас! 🎁',
    'session.confirmCancel': 'Отмена',

    // Footer
    'footer.cheer': 'Сделано с праздничным настроением',
    'footer.free': 'Бесплатно и без затрат',
    'footer.privacy': '100% Приватность',
    'footer.note': 'Email адреса участников никогда не передаются посторонним. Письма доставляются строго лично в руки!',
  },
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('santa_locale') as Locale | null;
      if (saved === 'ru' || saved === 'en') {
        setLocaleState(saved);
      } else {
        const browserLang = navigator.language?.toLowerCase() || '';
        if (browserLang.startsWith('ru') || browserLang.startsWith('be') || browserLang.startsWith('uk')) {
          setLocaleState('ru');
        }
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('santa_locale', newLocale);
    } catch {
      // Ignore
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ru' : 'en');
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    let str = translations[locale]?.[key] || translations['en']?.[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
