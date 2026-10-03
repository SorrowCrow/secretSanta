import { Resend } from 'resend';

export interface SendSecretSantaMatchEmailParams {
  giverEmail: string;
  giverName: string;
  receiverName: string;
  receiverSurname: string;
  receiverWishlist?: string | null;
  receiverHobbies?: string | null;
  sessionTitle: string;
  budget?: string | null;
  exchangeDate?: string | null;
  festivePoem?: string | null;
  giftIdeas?: string[] | null;
  locale?: 'en' | 'ru';
}

export interface SendEmailResult {
  success: boolean;
  mocked?: boolean;
  id?: string;
  error?: string;
}

/**
 * Builds a festive, mobile-responsive HTML email template for Secret Santa match reveal.
 * Supports English ('en') and Russian ('ru').
 */
export function buildSecretSantaEmailHtml(params: SendSecretSantaMatchEmailParams): string {
  const {
    giverName,
    receiverName,
    receiverSurname,
    receiverWishlist,
    receiverHobbies,
    sessionTitle,
    budget,
    exchangeDate,
    festivePoem,
    giftIdeas,
    locale = 'en',
  } = params;

  const isRu = locale === 'ru';
  const fullReceiverName = `${receiverName} ${receiverSurname}`.trim();
  const formattedPoem = festivePoem
    ? festivePoem
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join('<br />')
    : null;

  const giftItemsHtml =
    giftIdeas && giftIdeas.length > 0
      ? giftIdeas
          .map(
            (idea) => `
              <li style="margin-bottom: 8px; color: #166534; font-size: 14px; line-height: 1.5;">
                <span style="display: inline-block; margin-right: 6px;">🎁</span>
                <strong>${escapeHtml(idea)}</strong>
              </li>`
          )
          .join('')
      : '';

  const subjectTitle = isRu
    ? `🎅 Ваш подопечный в Тайном Санте для ${escapeHtml(sessionTitle)}`
    : `🎅 Your Secret Santa Match for ${escapeHtml(sessionTitle)}`;

  const headerTitle = isRu ? 'Жеребьёвка Тайного Санты!' : 'Secret Santa Match Reveal!';

  const greetingText = isRu
    ? `Хо-хо-хо, <strong>${escapeHtml(giverName)}</strong>! 🎄<br />Праздничные эльфы завершили жеребьёвку, и твоё секретное задание готово!`
    : `Ho Ho Ho, <strong>${escapeHtml(giverName)}</strong>! 🎄<br />The holiday elves have worked their magic, and your Secret Santa assignment is officially in!`;

  const badgeText = isRu ? 'ТЫ ТАЙНЫЙ САНТА ДЛЯ' : 'YOU ARE THE SECRET SANTA FOR';

  const budgetLabel = isRu ? '💰 Лимит бюджета' : '💰 Budget Limit';
  const budgetVal = escapeHtml(budget?.trim() || (isRu ? 'Не указан' : 'No limit specified'));

  const dateLabel = isRu ? '📅 Дата обмена' : '📅 Exchange Date';
  const dateVal = escapeHtml(exchangeDate?.trim() || (isRu ? 'Будет объявлена' : 'To be announced'));

  const prefTitle = isRu
    ? `🎯 Предпочтения ${escapeHtml(receiverName)}`
    : `🎯 ${escapeHtml(receiverName)}'s Preferences`;

  const wishlistLabel = isRu ? '📝 Список желаний:' : '📝 Wishlist:';
  const hobbiesLabel = isRu ? '🎨 Увлечения:' : '🎨 Hobbies:';

  const poemTitle = isRu ? '📜 Новогодний стих от Санты' : "📜 Santa's Festive Rhyme";
  const ideasTitle = isRu ? '💡 Идеи подарков' : '💡 Curated Gift Inspiration';

  const ruleText = isRu
    ? '<strong>🤫 Секретное правило Санты:</strong> Сохраняй своего подопечного в строжайшей тайне до дня обмена подарками! Не выдавай секрет заранее.'
    : '<strong>🤫 Top Secret Santa Rule:</strong> Keep your recipient a secret until gift exchange day! Do not reveal or spoil the surprise.';

  const footerText1 = isRu
    ? 'Тайный Санта • Дарите праздничное настроение 🎄'
    : 'Secret Santa • Spread the Holiday Cheer 🎄';

  const footerText2 = isRu
    ? `Вы получили это письмо, потому что участвуете в «${escapeHtml(sessionTitle)}».`
    : `You received this email because you are participating in <em>${escapeHtml(sessionTitle)}</em>.`;

  return `<!DOCTYPE html>
<html lang="${isRu ? 'ru' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subjectTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1329; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Outer Table Wrapper -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b1329; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container (max-width 600px) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);">
          
          <!-- Festive Header with Solid Red & Snow Stars -->
          <tr>
            <td style="background-color: #991b1b; padding: 36px 24px 28px 24px; text-align: center; color: #ffffff;">
              <div style="font-size: 32px; line-height: 1; margin-bottom: 12px;">
                ✨ ❄️ 🎅 🎄 ❄️ ✨
              </div>
              <h1 style="margin: 0 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                ${headerTitle}
              </h1>
              <p style="margin: 0; font-size: 15px; color: #fecaca; font-weight: 500;">
                ${escapeHtml(sessionTitle)}
              </p>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 28px 24px 24px 24px; background-color: #ffffff;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #334155;">
                ${greetingText}
              </p>

              <!-- Big Reveal Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #fef2f2; border: 2px dashed #dc2626; border-radius: 16px; text-align: center;">
                <tr>
                  <td style="padding: 24px 16px;">
                    <span style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 10px;">
                      ${badgeText}
                    </span>
                    <h2 style="margin: 6px 0 0 0; font-size: 28px; font-weight: 900; color: #991b1b; letter-spacing: -0.5px;">
                      🎁 ${escapeHtml(fullReceiverName)} 🎁
                    </h2>
                  </td>
                </tr>
              </table>

              <!-- Event Details Pill Grid -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
                <tr>
                  <td width="50%" style="padding: 14px 16px; border-right: 1px solid #e2e8f0; vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px;">
                      ${budgetLabel}
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: #0f172a;">
                      ${budgetVal}
                    </div>
                  </td>
                  <td width="50%" style="padding: 14px 16px; vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px;">
                      ${dateLabel}
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: #0f172a;">
                      ${dateVal}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Recipient Wishlist & Hobbies Section (if provided) -->
              ${
                receiverWishlist || receiverHobbies
                  ? `
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px;">
                    <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #166534; letter-spacing: 0.5px; margin-bottom: 8px;">
                      ${prefTitle}
                    </div>
                    ${
                      receiverWishlist
                        ? `<p style="margin: 0 0 6px 0; font-size: 14px; line-height: 1.5; color: #14532d;">
                            <strong>${wishlistLabel}</strong> ${escapeHtml(receiverWishlist)}
                          </p>`
                        : ''
                    }
                    ${
                      receiverHobbies
                        ? `<p style="margin: 0; font-size: 14px; line-height: 1.5; color: #14532d;">
                            <strong>${hobbiesLabel}</strong> ${escapeHtml(receiverHobbies)}
                          </p>`
                        : ''
                    }
                  </td>
                </tr>
              </table>`
                  : ''
              }

              <!-- Santa AI Festive Rhyme Section (Parchment Card) -->
              ${
                formattedPoem
                  ? `
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #fffbeb; border: 1px dashed #d97706; border-radius: 12px;">
                <tr>
                  <td style="padding: 18px 20px; text-align: center;">
                    <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #b45309; letter-spacing: 1px; margin-bottom: 8px;">
                      ${poemTitle}
                    </div>
                    <blockquote style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 15px; line-height: 1.7; color: #78350f;">
                      ${formattedPoem}
                    </blockquote>
                  </td>
                </tr>
              </table>`
                  : ''
              }

              <!-- Santa AI Gift Suggestions Section -->
              ${
                giftItemsHtml
                  ? `
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #334155; letter-spacing: 1px; margin-bottom: 12px;">
                      ${ideasTitle}
                    </div>
                    <ul style="margin: 0; padding-left: 0; list-style: none;">
                      ${giftItemsHtml}
                    </ul>
                  </td>
                </tr>
              </table>`
                  : ''
              }

              <!-- Top Secret Reminder Callout -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fee2e2; border-left: 4px solid #dc2626; border-radius: 8px; margin-bottom: 12px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #991b1b;">
                      ${ruleText}
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; color: #e2e8f0; font-weight: 600; font-size: 13px;">
                ${footerText1}
              </p>
              <p style="margin: 0; color: #64748b;">
                ${footerText2}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Builds a clean, festive plain-text representation for email clients without HTML.
 */
export function buildSecretSantaPlainText(params: SendSecretSantaMatchEmailParams): string {
  const {
    giverName,
    receiverName,
    receiverSurname,
    receiverWishlist,
    receiverHobbies,
    sessionTitle,
    budget,
    exchangeDate,
    festivePoem,
    giftIdeas,
    locale = 'en',
  } = params;

  const isRu = locale === 'ru';
  const fullReceiverName = `${receiverName} ${receiverSurname}`.trim();

  let text = isRu
    ? `🎅 ИТОГИ ЖЕРЕБЬЁВКИ ТАЙНОГО САНТЫ: ${sessionTitle}\n\nХо-хо-хо, ${giverName}!\n\n🎁 ВЫ ТАЙНЫЙ САНТА ДЛЯ: ${fullReceiverName}\n\n`
    : `🎅 SECRET SANTA MATCH REVEAL: ${sessionTitle}\n\nHo Ho Ho, ${giverName}!\n\n🎁 YOU ARE THE SECRET SANTA FOR: ${fullReceiverName}\n\n`;

  text += `--------------------------------------------------\n`;
  text += isRu
    ? `💰 Бюджет:        ${budget?.trim() || 'Не указан'}\n📅 Дата обмена:  ${exchangeDate?.trim() || 'Будет объявлена'}\n`
    : `💰 Budget:        ${budget?.trim() || 'Not specified'}\n📅 Exchange Date: ${exchangeDate?.trim() || 'To be announced'}\n`;
  text += `--------------------------------------------------\n\n`;

  if (receiverWishlist || receiverHobbies) {
    text += isRu ? `🎯 Предпочтения ${receiverName}:\n` : `🎯 ${receiverName}'s Preferences:\n`;
    if (receiverWishlist) text += isRu ? `• Список желаний: ${receiverWishlist}\n` : `• Wishlist: ${receiverWishlist}\n`;
    if (receiverHobbies) text += isRu ? `• Хобби:          ${receiverHobbies}\n` : `• Hobbies:  ${receiverHobbies}\n`;
    text += `\n`;
  }

  if (festivePoem) {
    text += isRu
      ? `📜 Новогодний стих от Санты:\n${festivePoem}\n\n`
      : `📜 Santa's Festive Rhyme:\n${festivePoem}\n\n`;
  }

  if (giftIdeas && giftIdeas.length > 0) {
    text += isRu ? `💡 Идеи подарков:\n` : `💡 Curated Gift Inspiration:\n`;
    giftIdeas.forEach((idea) => {
      text += `• ${idea}\n`;
    });
    text += `\n`;
  }

  text += isRu
    ? `🤫 Секретное правило Санты: Сохраняйте в тайне до дня обмена подарками! 🎄\n`
    : `🤫 Top Secret Santa Rule: Keep it a secret until gift exchange day! 🎄\n`;

  return text;
}

/**
 * Formats a holiday match box to stdout with an ASCII border.
 */
function logMockHolidayDispatch(params: SendSecretSantaMatchEmailParams, subject: string): void {
  const {
    giverEmail,
    giverName,
    receiverName,
    receiverSurname,
    receiverWishlist,
    receiverHobbies,
    sessionTitle,
    budget,
    exchangeDate,
    festivePoem,
    giftIdeas,
  } = params;

  const fullReceiverName = `${receiverName} ${receiverSurname}`.trim();
  const width = 74;

  const innerWidth = width - 4; // 70

  const padLine = (content: string): string => {
    const cleanContent = content.slice(0, innerWidth);
    const padding = ' '.repeat(Math.max(0, innerWidth - cleanContent.length));
    return `│ ${cleanContent}${padding} │`;
  };

  const wrapText = (text: string, maxLen: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';

    for (const w of words) {
      if ((current + ' ' + w).trim().length <= maxLen) {
        current = (current + ' ' + w).trim();
      } else {
        if (current) lines.push(current);
        current = w;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const addWrapped = (prefix: string, text: string) => {
    const available = innerWidth - prefix.length;
    const wrapped = wrapText(text, available);
    wrapped.forEach((line, i) => {
      if (i === 0) {
        lines.push(padLine(`${prefix}${line}`));
      } else {
        lines.push(padLine(`${' '.repeat(prefix.length)}${line}`));
      }
    });
  };

  const lines: string[] = [
    '',
    `┌${'─'.repeat(width - 2)}┐`,
    `│ 🎅 SECRET SANTA DISPATCH (SIMULATED / MOCK)                            │`,
    `├${'─'.repeat(width - 2)}┤`,
    padLine(`To:        ${giverEmail} (${giverName})`),
    padLine(`Session:   ${sessionTitle}`),
    padLine(`Subject:   ${subject}`),
    `├${'─'.repeat(width - 2)}┤`,
    padLine(`🎁 RECIPIENT:  ${fullReceiverName}`),
    padLine(`💰 BUDGET:     ${budget?.trim() || 'Not specified'}`),
    padLine(`📅 EXCHANGE:   ${exchangeDate?.trim() || 'To be announced'}`),
    padLine(''),
  ];

  if (receiverWishlist || receiverHobbies) {
    lines.push(padLine(`🎯 RECIPIENT PREFERENCES:`));
    if (receiverWishlist) addWrapped('• Wishlist:    ', receiverWishlist);
    if (receiverHobbies) addWrapped('• Hobbies:     ', receiverHobbies);
    lines.push(padLine(''));
  }

  if (festivePoem) {
    lines.push(padLine(`📜 SANTA'S FESTIVE RHYME:`));
    festivePoem
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((poemLine) => {
        addWrapped('  ', `"${poemLine.trim()}"`);
      });
    lines.push(padLine(''));
  }

  if (giftIdeas && giftIdeas.length > 0) {
    lines.push(padLine(`💡 AI GIFT INSPIRATION:`));
    giftIdeas.forEach((idea) => {
      addWrapped('🎁 ', idea);
    });
    lines.push(padLine(''));
  }

  lines.push(padLine(`🤫 RULE: Keep it a secret until exchange day! 🎄`));
  lines.push(`└${'─'.repeat(width - 2)}┘`);
  lines.push('');

  console.log(lines.join('\n'));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sends a Secret Santa match notification email via Resend if RESEND_API_KEY is configured,
 * or gracefully logs to stdout in simulated/mock mode. Never crashes.
 */
export async function sendSecretSantaMatchEmail(
  params: SendSecretSantaMatchEmailParams
): Promise<SendEmailResult> {
  const isRu = params.locale === 'ru';
  const subject = isRu
    ? `🎅 Ваш подопечный в Тайном Санте для ${params.sessionTitle}!`
    : `🎅 Your Secret Santa Match for ${params.sessionTitle}!`;

  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  // If Resend API Key is present, attempt real dispatch
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromAddress =
        process.env.EMAIL_FROM?.trim() || 'Secret Santa <onboarding@resend.dev>';

      const htmlContent = buildSecretSantaEmailHtml(params);
      const textContent = buildSecretSantaPlainText(params);

      const response = await resend.emails.send({
        from: fromAddress,
        to: params.giverEmail,
        subject,
        html: htmlContent,
        text: textContent,
      });

      if (response.error) {
        console.warn(
          `[Secret Santa Email] Resend API error (${response.error.name}: ${response.error.message}). Falling back to simulated log.`
        );
        logMockHolidayDispatch(params, subject);
        return { success: true, mocked: true, error: response.error.message };
      }

      return {
        success: true,
        mocked: false,
        id: response.data?.id,
      };
    } catch (err) {
      console.warn(
        `[Secret Santa Email] Exception while sending email (${(err as Error).message}). Falling back to simulated log.`
      );
      logMockHolidayDispatch(params, subject);
      return { success: true, mocked: true, error: (err as Error).message };
    }
  }

  // Fallback / Simulated mode: Log beautiful ASCII box and return success
  logMockHolidayDispatch(params, subject);
  return {
    success: true,
    mocked: true,
  };
}
