function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

export async function sendReportEmail(input: {
  to: string;
  reporterEmail: string;
  fileName: string;
  uploaderName: string;
  reason: string;
  viewUrl: string;
  downloadUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) throw new Error('Configurazione email segnalazioni mancante');

  const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#111827">
      <h2>Nuova segnalazione documento — NoteHub</h2>
      <p>Un utente ha segnalato un documento sulla piattaforma.</p>
      <p><strong>Documento:</strong> ${escapeHtml(input.fileName)}</p>
      <p><strong>Pubblicato da:</strong> ${escapeHtml(input.uploaderName || 'Nome non disponibile')}</p>
      <p><strong>Segnalato da:</strong> ${escapeHtml(input.reporterEmail)}</p>
      <p><strong>Motivo:</strong><br/>${escapeHtml(input.reason)}</p>
      <p><a href="${escapeHtml(input.viewUrl)}">Apri il documento</a></p>
      <p><a href="${escapeHtml(input.downloadUrl)}">Scarica il documento</a></p>
      <p><a href="${escapeHtml(appUrl + '/admin')}">Apri area Admin</a></p>
    </div>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: `Segnalazione documento: ${input.fileName}`,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Invio email fallito: ${response.status} ${detail.slice(0, 300)}`);
  }
}
