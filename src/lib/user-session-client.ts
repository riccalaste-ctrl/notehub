export function buildInstitutionDisclaimer(supportEmail?: string) {
  const fallbackEmail = supportEmail || 'support@liceoscacchibari.it';
  return `Gli amministratori non sono responsabili dei file caricati ma si impegnano a rimuovere contenuti vietati segnalati alla mail ${fallbackEmail}.`;
}
