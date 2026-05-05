/**
 * Magic Bytes Validation - Verifica il contenuto reale del file
 * Previene l'upload di file mascherati (es. exe travestiti da PDF)
 */

import { fileTypeFromBuffer } from 'file-type';

// MIME types consentiti per il caricamento
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
]);

export interface FileValidationResult {
  valid: boolean;
  mimeType?: string;
  detectedMimeType?: string;
  error?: string;
  mismatch?: boolean; // true se dichiarato e rilevato non corrispondono
}

/**
 * Valida il contenuto reale di un file tramite magic bytes
 * @param buffer Buffer del file da validare
 * @param declaredMimeType MIME type dichiarato dal client
 * @returns Risultato della validazione con dettagli
 */
export async function validateFileMagicBytes(
  buffer: Buffer,
  declaredMimeType: string
): Promise<FileValidationResult> {
  try {
    if (!buffer || buffer.length === 0) {
      return {
        valid: false,
        error: 'File vuoto',
      };
    }

    // Rileva il tipo reale dal contenuto
    const detected = await fileTypeFromBuffer(buffer);

    if (!detected) {
      // Se non riusciamo a rilevare il tipo, permettiamo solo se è text/plain
      if (declaredMimeType === 'text/plain') {
        return {
          valid: true,
          mimeType: declaredMimeType,
          detectedMimeType: 'unknown (possibly text)',
        };
      }
      return {
        valid: false,
        error: 'Impossibile rilevare il tipo di file (magic bytes non riconosciuti)',
      };
    }

    const detectedMimeType = detected.mime;

    // Verifica che il MIME type rilevato sia nella whitelist
    if (!ALLOWED_UPLOAD_MIME_TYPES.has(detectedMimeType)) {
      return {
        valid: false,
        detectedMimeType,
        error: `Tipo di file non consentito: ${detectedMimeType}`,
      };
    }

    // Controlla se il tipo dichiarato corrisponde a quello rilevato
    const mimesMismatch =
      declaredMimeType !== detectedMimeType &&
      !areRelatedMimeTypes(declaredMimeType, detectedMimeType);

    if (mimesMismatch) {
      return {
        valid: false,
        mimeType: declaredMimeType,
        detectedMimeType,
        mismatch: true,
        error: `Tipo di file dichiarato (${declaredMimeType}) non corrisponde al contenuto effettivo (${detectedMimeType}). File potrebbe essere mascherato.`,
      };
    }

    return {
      valid: true,
      mimeType: declaredMimeType,
      detectedMimeType,
    };
  } catch (err) {
    console.error('[magic-bytes] Validation error:', err);
    return {
      valid: false,
      error: 'Errore nella validazione del file',
    };
  }
}

/**
 * Verifica se due MIME types sono correlati/compatibili
 * (es. docx può essere rilevato come zip, Word usa ZIP internamente)
 */
function areRelatedMimeTypes(declaredType: string, detectedType: string): boolean {
  const relatedPairs = [
    // Office documents sono ZIP internamente
    [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
    ],
    [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
    ],
    // JPEG può essere rilevato come JFIF
    ['image/jpeg', 'image/jfif'],
  ];

  return relatedPairs.some(
    ([a, b]) => (declaredType === a && detectedType === b) || 
                (declaredType === b && detectedType === a)
  );
}

export { ALLOWED_UPLOAD_MIME_TYPES };
