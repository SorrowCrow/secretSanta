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
}

export interface SendEmailResult {
  success: boolean;
  mocked?: boolean;
  id?: string;
  error?: string;
}

/**
 * Builds a festive, mobile-responsive HTML email template for Secret Santa match reveal.
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
  } = params;

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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🎅 Your Secret Santa Match for ${escapeHtml(sessionTitle)}</title>
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
                Secret Santa Match Reveal!
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
                Ho Ho Ho, <strong>${escapeHtml(giverName)}</strong>! 🎄<br />
                The holiday elves have worked their magic, and your Secret Santa assignment is officially in!
              </p>

              <!-- Big Reveal Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #fef2f2; border: 2px dashed #dc2626; border-radius: 16px; text-align: center;">
                <tr>
                  <td style="padding: 24px 16px;">
                    <span style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 10px;">
                      YOU ARE THE SECRET SANTA FOR
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
                      💰 Budget Limit
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: #0f172a;">
                      ${escapeHtml(budget?.trim() || 'No limit specified')}
                    </div>
                  </td>
                  <td width="50%" style="padding: 14px 16px; vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px;">
                      📅 Exchange Date
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: #0f172a;">
                      ${escapeHtml(exchangeDate?.trim() || 'To be announced')}
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
                      🎯 ${escapeHtml(receiverName)}'s Preferences
                    </div>
                    ${
                      receiverWishlist
                        ? `<p style="margin: 0 0 6px 0; font-size: 14px; line-height: 1.5; color: #14532d;">
                            <strong>📝 Wishlist:</strong> ${escapeHtml(receiverWishlist)}
                          </p>`
                        : ''
                    }
                    ${
                      receiverHobbies
                        ? `<p style="margin: 0; font-size: 14px; line-height: 1.5; color: #14532d;">
                            <strong>🎨 Hobbies:</strong> ${escapeHtml(receiverHobbies)}
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
                      📜 Santa's Festive Rhyme
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
                      💡 Curated Gift Inspiration
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
                      <strong>🤫 Top Secret Santa Rule:</strong> Keep your recipient a secret until gift exchange day! Do not reveal or spoil the surprise.
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
                Secret Santa • Spread the Holiday Cheer 🎄
              </p>
              <p style="margin: 0; color: #64748b;">
                You received this email because you are participating in <em>${escapeHtml(sessionTitle)}</em>.
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
  } = params;

  const fullReceiverName = `${receiverName} ${receiverSurname}`.trim();

  let text = `🎅 SECRET SANTA MATCH REVEAL: ${sessionTitle}\n\n`;
  text += `Ho Ho Ho, ${giverName}!\n\n`;
  text += `🎁 YOU ARE THE SECRET SANTA FOR: ${fullReceiverName}\n\n`;
  text += `--------------------------------------------------\n`;
  text += `💰 Budget:        ${budget?.trim() || 'Not specified'}\n`;
  text += `📅 Exchange Date: ${exchangeDate?.trim() || 'To be announced'}\n`;
  text += `--------------------------------------------------\n\n`;

  if (receiverWishlist || receiverHobbies) {
    text += `🎯 ${receiverName}'s Preferences:\n`;
    if (receiverWishlist) text += `• Wishlist: ${receiverWishlist}\n`;
    if (receiverHobbies) text += `• Hobbies:  ${receiverHobbies}\n`;
    text += `\n`;
  }

  if (festivePoem) {
    text += `📜 Santa's Festive Rhyme:\n${festivePoem}\n\n`;
  }

  if (giftIdeas && giftIdeas.length > 0) {
    text += `💡 Curated Gift Inspiration:\n`;
    giftIdeas.forEach((idea) => {
      text += `• ${idea}\n`;
    });
    text += `\n`;
  }

  text += `🤫 Top Secret Santa Rule: Keep it a secret until gift exchange day! 🎄\n`;
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
    const result: string[] = [];
    let current = '';

    for (const word of words) {
      if (!current) {
        current = word;
      } else if (current.length + 1 + word.length <= maxLen) {
        current += ' ' + word;
      } else {
        result.push(current);
        current = word;
      }
    }
    if (current) result.push(current);
    return result.length > 0 ? result : [text];
  };

  const addWrapped = (prefix: string, content: string): void => {
    const maxContentLen = innerWidth - prefix.length;
    const wrapped = wrapText(content, Math.max(maxContentLen, 20));
    wrapped.forEach((line, idx) => {
      if (idx === 0) {
        lines.push(padLine(`${prefix}${line}`));
      } else {
        lines.push(padLine(`${' '.repeat(prefix.length)}${line}`));
      }
    });
  };

  const hr = '├' + '─'.repeat(width - 2) + '┤';
  const top = '┌' + '─'.repeat(width - 2) + '┐';
  const bot = '└' + '─'.repeat(width - 2) + '┘';

  const lines: string[] = [
    top,
    padLine('🎅 SECRET SANTA DISPATCH (SIMULATED / MOCK)'),
    hr,
    padLine(`To:        ${giverEmail} (${giverName})`),
    padLine(`Session:   ${sessionTitle}`),
    padLine(`Subject:   ${subject}`),
    hr,
    padLine(`🎁 RECIPIENT:  ${fullReceiverName}`),
    padLine(`💰 BUDGET:     ${budget?.trim() || 'Not specified'}`),
    padLine(`📅 EXCHANGE:   ${exchangeDate?.trim() || 'To be announced'}`),
  ];

  if (receiverWishlist || receiverHobbies) {
    lines.push(padLine(''));
    lines.push(padLine(`🎯 RECIPIENT PREFERENCES:`));
    if (receiverWishlist) addWrapped('• Wishlist:    ', receiverWishlist);
    if (receiverHobbies) addWrapped('• Hobbies:     ', receiverHobbies);
  }

  if (festivePoem) {
    lines.push(padLine(''));
    lines.push(padLine(`📜 SANTA'S FESTIVE RHYME:`));
    for (const poemLine of festivePoem.split('\n')) {
      if (poemLine.trim()) {
        addWrapped('  ', `"${poemLine.trim()}"`);
      }
    }
  }

  if (giftIdeas && giftIdeas.length > 0) {
    lines.push(padLine(''));
    lines.push(padLine(`💡 AI GIFT INSPIRATION:`));
    for (const idea of giftIdeas) {
      addWrapped('🎁 ', idea);
    }
  }

  lines.push(padLine(''));
  lines.push(padLine('🤫 RULE: Keep it a secret until exchange day! 🎄'));
  lines.push(bot);

  console.log('\n' + lines.join('\n') + '\n');
}

/**
 * Escapes HTML characters for safe template rendering.
 */
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
  const subject = `🎅 Your Secret Santa Match for ${params.sessionTitle}!`;
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
