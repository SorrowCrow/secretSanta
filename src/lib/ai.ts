import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Curated holiday rhyme templates for robust deterministic offline fallback (English).
 * Addressed to the giver and revealing the receiver.
 */
const POEM_TEMPLATES_EN = [
  (giver: string, receiver: string) =>
    `The snow is softly falling and the Christmas bells ring clear,\n` +
    `Dear ${giver}, a secret duty arrives this time of year!\n` +
    `A gift wrapped up with ribbons and merry holiday glee,\n` +
    `For ${receiver}, waiting warmly beneath the lighted tree.`,

  (giver: string, receiver: string) =>
    `Twinkling lights upon the pine and frost upon the pane,\n` +
    `${giver}, Santa’s whispering your special match again!\n` +
    `Pick out a thoughtful treasure to make the season bright,\n` +
    `And bring a smile to ${receiver} on Secret Santa night.`,

  (giver: string, receiver: string) =>
    `Jingle bells and candy canes, the hearth is burning bright,\n` +
    `A secret mission, ${giver}, has arrived for you tonight!\n` +
    `Wrap up a dash of wonder, a sprinkle of holiday cheer,\n` +
    `To celebrate ${receiver} at the jolliest time of year.`,

  (giver: string, receiver: string) =>
    `The stockings hang in festive rows with evergreen and snow,\n` +
    `Dear ${giver}, there is a secret friend you ought to know!\n` +
    `Prepare a lovely present, tied up with ribbon green,\n` +
    `For ${receiver}, the kindest soul this holiday has seen.`,

  (giver: string, receiver: string) =>
    `North Pole winds are humming tunes of joyous Christmas song,\n` +
    `${giver}, here is the happy news you've waited for so long:\n` +
    `Become a Secret Santa and spread your festive care,\n` +
    `By giving ${receiver} a gift beyond compare!`,

  (giver: string, receiver: string) =>
    `Hark! The winter stars align above the snowy ground,\n` +
    `Dear ${giver}, your secret holiday assignment has been found!\n` +
    `Craft a moment of delight with ribbons and goodwill,\n` +
    `For ${receiver}, whose Christmas heart you are about to fill.`,
];

/**
 * Curated holiday rhyme templates for robust deterministic offline fallback (Russian).
 * Addressed to the giver and revealing the receiver.
 */
const POEM_TEMPLATES_RU = [
  (giver: string, receiver: string) =>
    `Кружится за окном пушистый белый снег,\n` +
    `${giver}, порадовать спеши ты человека!\n` +
    `Тайный Санта шепчет свой секрет лесной:\n` +
    `Для ${receiver} подарок приготовь с душой!`,

  (giver: string, receiver: string) =>
    `Сверкает ёлка яркими огнями в тишине,\n` +
    `${giver}, выпал жребий праздничный тебе!\n` +
    `Сюрприз красивый с лентой смастери,\n` +
    `И радость ${receiver} на праздник подари!`,

  (giver: string, receiver: string) =>
    `Звенят колокольчики, праздник у ворот,\n` +
    `Для ${giver} задание на этот Новый год!\n` +
    `Стань Тайным Сантой, чудо сотвори,\n` +
    `И ${receiver} улыбку и подарок подари!`,

  (giver: string, receiver: string) =>
    `Мороз рисует сказку на ночном стекле,\n` +
    `${giver}, узнай, кому нести тепло в руке!\n` +
    `Мечту заветную в коробку положи,\n` +
    `И ${receiver} от сердца празднично вручи!`,

  (giver: string, receiver: string) =>
    `Метель поёт за окнами весёлый свой мотив,\n` +
    `${giver}, неси в подарок добрый позитив!\n` +
    `Тайная миссия пришла к тебе сейчас:\n` +
    `${receiver} ждёт подарок в этот звёздный час!`,

  (giver: string, receiver: string) =>
    `Хрустит морозный снег под мягким фонарём,\n` +
    `Для ${giver} секрет мы праздничный откроем:\n` +
    `С любовью упакуй сюрприз среди зимы,\n` +
    `Ведь для ${receiver} Сантой стал сегодня ты!`,
];

/**
 * Deterministic hash utility to select consistent templates for given pairings.
 */
function hashPair(giver: string, receiver: string): number {
  const combined = `${giver.trim().toLowerCase()}->${receiver.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates a festive, heartwarming 4-line rhyming Christmas poem
 * addressed to the giver revealing their gift recipient.
 * Supports English ('en') and Russian ('ru').
 */
export async function generateSantaPoem(
  giverName: string,
  receiverName: string,
  locale: 'en' | 'ru' = 'en'
): Promise<string> {
  const safeGiver = giverName.trim() || (locale === 'ru' ? 'Тайный друг' : 'Holiday Friend');
  const safeReceiver = receiverName.trim() || (locale === 'ru' ? 'Твой подопечный' : 'Special Someone');

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt =
        locale === 'ru'
          ? `Ты — Тайный Санта. Напиши праздничное, доброе 4-строчное новогоднее стихотворение на русском языке для ${safeGiver}, в котором раскрывается, что его тайный подопечный — ${safeReceiver}.
Строгие правила:
- Ровно 4 строки рифмованного стихотворения на русском языке.
- Праздничное зимнее настроение, добрый ритм.
- НЕ упоминай никаких других людей.
- Верни ТОЛЬКО 4 строки стиха без кавычек, заголовков и пояснений.`
          : `You are Santa Claus writing a Secret Santa match poem.
Write a festive, heartwarming 4-line rhyming Christmas poem addressed to ${safeGiver} revealing that ${safeReceiver} is their Secret Santa recipient.
Strict rules:
- Exactly 4 lines of rhyming poetry.
- Holiday warmth, festive Christmas spirit, joyful rhythm.
- Do NOT mention any other person or external details.
- Return ONLY the 4 lines of poetry without title, quotation marks, markdown headings, or explanation.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text()?.trim();

      if (text) {
        // Clean out possible code fences or surrounding quotes
        const cleaned = text
          .replace(/^```[a-z]*\n?/gi, '')
          .replace(/\n?```$/gi, '')
          .replace(/^["']|["']$/g, '')
          .trim();

        const lines = cleaned
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length >= 3 && lines.length <= 6) {
          return lines.slice(0, 4).join('\n');
        }
      }
    } catch (err) {
      console.warn(
        `[Santa AI] Gemini poem generation failed (${(err as Error).message}). Using festive fallback.`
      );
    }
  }

  // Deterministic holiday fallback
  const templates = locale === 'ru' ? POEM_TEMPLATES_RU : POEM_TEMPLATES_EN;
  const index = hashPair(safeGiver, safeReceiver) % templates.length;
  return templates[index](safeGiver, safeReceiver);
}

/**
 * Topic categories and curated gift suggestions for offline fallback.
 */
interface HobbyPattern {
  keywords: string[];
  suggestionsEn: string[];
  suggestionsRu: string[];
}

const HOBBY_PATTERNS: HobbyPattern[] = [
  {
    keywords: ['coffee', 'tea', 'espresso', 'brew', 'latte', 'caffeine', 'mug', 'matcha', 'кофе', 'чай', 'кружк', 'матча'],
    suggestionsEn: [
      'Artisan winter coffee roast sampler or holiday loose-leaf tea tin with a stainless infuser',
      'Ceramic insulated double-walled travel mug with splash-proof lid for chilly mornings',
      'Gourmet winter syrup trio (spiced cinnamon, gingerbread, salted caramel) for home lattes',
    ],
    suggestionsRu: [
      'Набор премиального зимнего кофе или праздничный листовой чай в жестяной баночке с ситечком',
      'Керамическая термокружка с двойными стенками для уютных зимних утр',
      'Трио праздничных сиропов (корица, имбирный пряник, солёная карамель) для домашнего латте',
    ],
  },
  {
    keywords: ['read', 'book', 'novel', 'fiction', 'literature', 'author', 'manga', 'reading', 'книг', 'чтен', 'роман', 'литератур', 'манга'],
    suggestionsEn: [
      'Rechargeable warm-amber LED neck reading light with adjustable brightness',
      'Handcrafted brass or leather holiday bookmark paired with a festive hot cocoa pack',
      'A bestselling holiday paperback or cozy mystery book in their favorite genre',
    ],
    suggestionsRu: [
      'Перезаряжаемый светодиодный фонарик на шею с тёплым янтарным светом для чтения книг',
      'Кожаная или латунная праздничная закладка для книг в комплекте с горячим какао',
      'Уютная книга-бестселлер в любимом жанре получателя',
    ],
  },
  {
    keywords: ['tech', 'code', 'coding', 'gaming', 'game', 'gamer', 'pc', 'gadget', 'computer', 'игры', 'гейм', 'компьютер', 'код', 'программир'],
    suggestionsEn: [
      'Desktop USB braided cable organizer dock with high-speed multi-charging cable',
      'Warm ambient LED monitor back-light strip or minimalist geometric desk lamp',
      'Retro novelty gaming silicone coaster set or mechanical keyboard novelty keycap',
    ],
    suggestionsRu: [
      'Настольный органайзер кабелей с плетёным мульти-кабелем быстрой зарядки',
      'Фоновая подсветка для монитора или минималистичный геометрический светильник',
      'Праздничный кейкап для механической клавиатуры или подставки для кружки в стиле ретро-игр',
    ],
  },
  {
    keywords: ['cook', 'baking', 'bake', 'chef', 'food', 'culinary', 'kitchen', 'spices', 'кулинар', 'готовк', 'выпеч', 'кухн', 'специ'],
    suggestionsEn: [
      'Artisan infused hot sauce set or gourmet holiday culinary spice rub collection',
      'Festive holiday cookie baking kit with copper snowflake and gingerbread cookie cutters',
      'Engraved bamboo cutting board with heat-resistant silicone holiday spatula set',
    ],
    suggestionsRu: [
      'Набор авторских пряных специй или праздничных соусов для гурманов',
      'Новогодний набор формочек для выпечки имбирного печенья в виде снежинок и ёлочек',
      'Бамбуковая разделочная доска в комплекте с термостойкими силиконовыми лопатками',
    ],
  },
  {
    keywords: ['gym', 'fitness', 'run', 'running', 'workout', 'yoga', 'sport', 'hike', 'hiking', 'outdoor', 'спорт', 'фитнес', 'бег', 'йога', 'поход'],
    suggestionsEn: [
      'Vacuum-insulated stainless steel cold-water flask with holiday carabiner clip',
      'Touchscreen-friendly thermal running gloves and reflective winter running beanie',
      'Compact exercise loop resistance bands set with quick-dry microfiber gym towel',
    ],
    suggestionsRu: [
      'Вакуумная термобутылка из нержавеющей стали с карабином для активного отдыха',
      'Тёплые сенсорные перчатки для пробежек и зимняя шапка со светоотражателем',
      'Компактный набор фитнес-резинок и быстросохнущее спортивное полотенце',
    ],
  },
  {
    keywords: ['art', 'draw', 'drawing', 'paint', 'painting', 'craft', 'design', 'sketch', 'knit', 'рисова', 'арт', 'скетч', 'краск', 'дизайн', 'вязани'],
    suggestionsEn: [
      'Hardbound mixed-media art sketch journal with archival micro-fineliner pen set',
      'DIY holiday soy candle crafting kit or wool needle-felting ornament starter set',
      'Pocket watercolor pan set with water-refillable detail brush pen',
    ],
    suggestionsRu: [
      'Качественный скетчбук в твёрдом переплёте с набором профессиональных лайнеров',
      'Набор для создания соевых праздничных свечей своими руками',
      'Карманный набор акварельных красок с кистью-резервуаром для воды',
    ],
  },
];

const DEFAULT_HOLIDAY_GIFTS_EN = [
  'Festive insulated holiday travel tumbler with gourmet winter cocoa assortment',
  'Cozy waffle-knit winter beanie paired with warm merino wool blend cabin socks',
  'Hand-poured cinnamon & winter pine crackling wooden-wick scented soy candle',
];

const DEFAULT_HOLIDAY_GIFTS_RU = [
  'Праздничный термостакан с набором премиального зимнего какао и маршмеллоу',
  'Уютная тёплая зимняя шапка крупной вязки и мягкие шерстяные носки',
  'Ароматическая соевая свеча ручной работы с ароматом зимней хвои и корицы с деревянным фитилём',
];

function parseWishlistItems(wishlist?: string | null): string[] {
  if (!wishlist) return [];
  return wishlist
    .split(/[,;\n•\r]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && !/^(none|nothing|n\/a|anything|нет|ничего)$/i.test(s));
}

/**
 * Deterministic fallback generator for 3 curated holiday gift ideas.
 */
function generateFallbackGiftIdeas(
  receiverName: string,
  wishlist?: string | null,
  hobbies?: string | null,
  budget?: string | null,
  locale: 'en' | 'ru' = 'en'
): string[] {
  const budgetPrefix = budget?.trim()
    ? locale === 'ru'
      ? ` (в пределах ${budget.trim()})`
      : ` (within ${budget.trim()} budget)`
    : '';

  const wishlistItems = parseWishlistItems(wishlist);
  const hobbiesText = (hobbies || '').toLowerCase();

  const results: string[] = [];

  // 1. Incorporate wishlist items if provided
  if (wishlistItems.length > 0) {
    for (const item of wishlistItems.slice(0, 2)) {
      const prefix = locale === 'ru' ? `Из списка желаний ${receiverName}:` : `From ${receiverName}'s Wishlist:`;
      results.push(`${prefix} ${item}${budgetPrefix}`);
    }
  }

  // 2. Incorporate hobby matches if provided
  if (hobbiesText) {
    for (const pattern of HOBBY_PATTERNS) {
      if (pattern.keywords.some((k) => hobbiesText.includes(k))) {
        const suggestions = locale === 'ru' ? pattern.suggestionsRu : pattern.suggestionsEn;
        for (const suggestion of suggestions) {
          if (!results.includes(suggestion) && results.length < 3) {
            results.push(`${suggestion}${budgetPrefix}`);
          }
        }
      }
      if (results.length >= 3) break;
    }
  }

  // 3. Fill remaining slots with delightful universal holiday favorites
  const defaultList = locale === 'ru' ? DEFAULT_HOLIDAY_GIFTS_RU : DEFAULT_HOLIDAY_GIFTS_EN;
  for (const defaultGift of defaultList) {
    if (results.length >= 3) break;
    const itemWithBudget = `${defaultGift}${budgetPrefix}`;
    if (!results.includes(itemWithBudget)) {
      results.push(itemWithBudget);
    }
  }

  return results.slice(0, 3);
}

/**
 * Generates 3 creative, thoughtful, budget-friendly gift ideas tailored
 * to the recipient's wishlist/hobbies and session budget.
 */
export async function generateGiftIdeas(
  receiverName: string,
  wishlist?: string | null,
  hobbies?: string | null,
  budget?: string | null,
  locale: 'en' | 'ru' = 'en'
): Promise<string[]> {
  const safeReceiver = receiverName.trim() || (locale === 'ru' ? 'твой подопечный' : 'your match');
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt =
        locale === 'ru'
          ? `Ты — главный новогодний советник по подаркам Тайного Санты.
Предложи ровно 3 креативных, душевных и подходящих по бюджету подарка для ${safeReceiver}.
Лимит бюджета: ${budget?.trim() || 'Около 20 € - 30 €'}
Список желаний: ${wishlist?.trim() || 'Не указан'}
Увлечения / интересы: ${hobbies?.trim() || 'Уютные зимние вещи, сладости'}

Правила:
- Предложи ровно 3 отдельных подарка на русском языке.
- Опирайся на список желаний и увлечения, если они указаны.
- Строго придерживайся лимита бюджета (только в евро €).
- Верни ТОЛЬКО JSON-массив из 3 строк, например:
["Подарок 1 с кратким пояснением", "Подарок 2 с кратким пояснением", "Подарок 3 с кратким пояснением"]
- Не пиши ничего вне JSON массива.`
          : `You are Santa's top gift advisor.
Suggest exactly 3 creative, thoughtful, and budget-friendly Secret Santa gift ideas for ${safeReceiver}.
Budget Limit: ${budget?.trim() || 'Around €20 - €30'}
Recipient's Wishlist: ${wishlist?.trim() || 'None provided'}
Recipient's Hobbies / Interests: ${hobbies?.trim() || 'Cozy winter items, festive holiday treats'}

Rules:
- Suggest exactly 3 distinct items.
- Tailor suggestions directly to their wishlist and hobbies whenever provided.
- Strictly adhere to the budget limit (in Euros €).
- Return ONLY a JSON array of 3 strings, e.g.:
["Item 1 with brief reason", "Item 2 with brief reason", "Item 3 with brief reason"]
- Do not output any markdown code blocks, backticks, or other text outside the JSON array.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text()?.trim();

      if (text) {
        // Strip possible markdown fences
        const jsonText = text
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        const parsed = JSON.parse(jsonText);
        if (
          Array.isArray(parsed) &&
          parsed.length >= 3 &&
          parsed.every((item) => typeof item === 'string' && item.trim().length > 0)
        ) {
          return parsed.slice(0, 3).map((item: string) => item.trim());
        }
      }
    } catch (err) {
      console.warn(
        `[Santa AI] Gemini gift ideas generation failed (${(err as Error).message}). Using curated fallback.`
      );
    }
  }

  // Deterministic curated fallback
  return generateFallbackGiftIdeas(safeReceiver, wishlist, hobbies, budget, locale);
}
