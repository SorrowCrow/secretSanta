import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Curated holiday rhyme templates for robust deterministic offline fallback.
 * Addressed to the giver and revealing the receiver.
 */
const POEM_TEMPLATES = [
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
 *
 * Uses Gemini API if GEMINI_API_KEY is available; otherwise falls back
 * gracefully to rich, deterministic festive rhyming templates.
 */
export async function generateSantaPoem(
  giverName: string,
  receiverName: string
): Promise<string> {
  const safeGiver = giverName.trim() || 'Holiday Friend';
  const safeReceiver = receiverName.trim() || 'Special Someone';

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Safety rule: never pass other participant info, secret master lists, or private contacts.
      const prompt = `You are Santa Claus writing a Secret Santa match poem.
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
  const index = hashPair(safeGiver, safeReceiver) % POEM_TEMPLATES.length;
  return POEM_TEMPLATES[index](safeGiver, safeReceiver);
}

/**
 * Topic categories and curated gift suggestions for offline fallback.
 */
interface HobbyPattern {
  keywords: string[];
  suggestions: string[];
}

const HOBBY_PATTERNS: HobbyPattern[] = [
  {
    keywords: ['coffee', 'tea', 'espresso', 'brew', 'latte', 'caffeine', 'mug', 'matcha'],
    suggestions: [
      'Artisan winter coffee roast sampler or holiday loose-leaf tea tin with a stainless infuser',
      'Ceramic insulated double-walled travel mug with splash-proof lid for chilly mornings',
      'Gourmet winter syrup trio (spiced cinnamon, gingerbread, salted caramel) for home lattes',
    ],
  },
  {
    keywords: ['read', 'book', 'novel', 'fiction', 'literature', 'author', 'manga', 'reading'],
    suggestions: [
      'Rechargeable warm-amber LED neck reading light with adjustable brightness',
      'Handcrafted brass or leather holiday bookmark paired with a festive hot cocoa pack',
      'A bestselling holiday paperback or cozy mystery book in their favorite genre',
    ],
  },
  {
    keywords: ['tech', 'code', 'coding', 'gaming', 'game', 'gamer', 'pc', 'gadget', 'computer'],
    suggestions: [
      'Desktop USB braided cable organizer dock with high-speed multi-charging cable',
      'Warm ambient LED monitor back-light strip or minimalist geometric desk lamp',
      'Retro novelty gaming silicone coaster set or mechanical keyboard novelty keycap',
    ],
  },
  {
    keywords: ['cook', 'baking', 'bake', 'chef', 'food', 'culinary', 'kitchen', 'spices'],
    suggestions: [
      'Artisan infused hot sauce set or gourmet holiday culinary spice rub collection',
      'Festive holiday cookie baking kit with copper snowflake and gingerbread cookie cutters',
      'Engraved bamboo cutting board with heat-resistant silicone holiday spatula set',
    ],
  },
  {
    keywords: ['gym', 'fitness', 'run', 'running', 'workout', 'yoga', 'sport', 'hike', 'hiking', 'outdoor'],
    suggestions: [
      'Vacuum-insulated stainless steel cold-water flask with holiday carabiner clip',
      'Touchscreen-friendly thermal running gloves and reflective winter running beanie',
      'Compact exercise loop resistance bands set with quick-dry microfiber gym towel',
    ],
  },
  {
    keywords: ['art', 'draw', 'drawing', 'paint', 'painting', 'craft', 'design', 'sketch', 'knit'],
    suggestions: [
      'Hardbound mixed-media art sketch journal with archival micro-fineliner pen set',
      'DIY holiday soy candle crafting kit or wool needle-felting ornament starter set',
      'Pocket watercolor pan set with water-refillable detail brush pen',
    ],
  },
  {
    keywords: ['music', 'guitar', 'piano', 'vinyl', 'songs', 'concert', 'audio', 'sound'],
    suggestions: [
      'Vintage vinyl record cup coasters with miniature classic album center labels',
      'Waterproof compact Bluetooth speaker for festive holiday carols and podcasts',
      'Personalized wooden guitar pick box or musician cable management wraps',
    ],
  },
  {
    keywords: ['plant', 'garden', 'succulent', 'flower', 'botany', 'nature'],
    suggestions: [
      'Ceramic indoor mini succulent planter trio with natural bamboo drainage base',
      'Windowsill culinary herb garden kit with rosemary, basil, and mint seeds',
      'Vintage brass-finish misting spray bottle for indoor houseplants',
    ],
  },
  {
    keywords: ['cozy', 'relax', 'spa', 'candle', 'bath', 'wellness', 'sleep'],
    suggestions: [
      'Handcrafted winter pine & amber soy candle with natural crackling wood wick',
      'Aromatherapy eucalyptus and peppermint holiday shower steamers relaxation gift pack',
      'Ultra-soft plush holiday sherpa fleece throw blanket for festive movie nights',
    ],
  },
];

const DEFAULT_HOLIDAY_GIFTS = [
  'Ultra-soft festive holiday sherpa throw blanket or cozy merino wool socks',
  'Artisan hot cocoa kit with gourmet marshmallows, peppermint stirs, and a holiday mug',
  'Handcrafted natural soy candle infused with winter fir, cinnamon, and warm amber',
  'Gourmet holiday treat box featuring artisanal roasted nuts and Belgian chocolates',
  'Portable insulated stainless steel tumbler for keeping winter drinks piping hot',
];

/**
 * Extracts and cleans potential items from a user's wishlist string.
 */
function parseWishlistItems(wishlist?: string | null): string[] {
  if (!wishlist) return [];
  return wishlist
    .split(/[,;\n•\-\*]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && !/^(none|nothing|n\/a|anything)$/i.test(s));
}

/**
 * Deterministic fallback generator for 3 curated holiday gift ideas.
 */
function generateFallbackGiftIdeas(
  receiverName: string,
  wishlist?: string | null,
  hobbies?: string | null,
  budget?: string | null
): string[] {
  const budgetPrefix = budget?.trim() ? ` (within ${budget.trim()} budget)` : '';
  const wishlistItems = parseWishlistItems(wishlist);
  const hobbiesText = (hobbies || '').toLowerCase();

  const results: string[] = [];

  // 1. Incorporate wishlist items if provided
  if (wishlistItems.length > 0) {
    for (const item of wishlistItems.slice(0, 2)) {
      results.push(`From ${receiverName}'s Wishlist: ${item}${budgetPrefix}`);
    }
  }

  // 2. Incorporate hobby matches if provided
  if (hobbiesText) {
    for (const pattern of HOBBY_PATTERNS) {
      if (pattern.keywords.some((k) => hobbiesText.includes(k))) {
        for (const suggestion of pattern.suggestions) {
          if (!results.includes(suggestion) && results.length < 3) {
            results.push(`${suggestion}${budgetPrefix}`);
          }
        }
      }
      if (results.length >= 3) break;
    }
  }

  // 3. Fill remaining slots with delightful universal holiday favorites
  for (const defaultGift of DEFAULT_HOLIDAY_GIFTS) {
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
 *
 * Uses Gemini API if GEMINI_API_KEY is available; otherwise falls back
 * deterministically and intelligently based on wishlist & hobbies.
 */
export async function generateGiftIdeas(
  receiverName: string,
  wishlist?: string | null,
  hobbies?: string | null,
  budget?: string | null
): Promise<string[]> {
  const safeReceiver = receiverName.trim() || 'your match';
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are Santa's top gift advisor.
Suggest exactly 3 creative, thoughtful, and budget-friendly Secret Santa gift ideas for ${safeReceiver}.
Budget Limit: ${budget?.trim() || 'Around $20 - $30'}
Recipient's Wishlist: ${wishlist?.trim() || 'None provided'}
Recipient's Hobbies / Interests: ${hobbies?.trim() || 'Cozy winter items, festive holiday treats'}

Rules:
- Suggest exactly 3 distinct items.
- Tailor suggestions directly to their wishlist and hobbies whenever provided.
- Strictly adhere to the budget limit.
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
  return generateFallbackGiftIdeas(safeReceiver, wishlist, hobbies, budget);
}
