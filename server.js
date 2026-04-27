const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { pipeline } = require("stream/promises");

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(ROOT, "storage");
const UPLOADS_DIR = path.join(STORAGE_DIR, "uploads");
const DB_FILE = path.join(STORAGE_DIR, "db.json");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const SESSION_COOKIE = "liceo_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const ADMIN_CODE = process.env.ADMIN_CODE || "LiceoAdmin2026!";
const SESSION_SECRET = process.env.SESSION_SECRET || "liceo-drive-session-secret";

const MAX_JSON_BODY = 1024 * 1024;
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".zip": "application/zip",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const DEFAULT_SUBJECTS = [
  { id: "italiano", name: "Italiano", color: "#ef4444", order: 0 },
  { id: "matematica", name: "Matematica", color: "#2563eb", order: 1 },
  { id: "storia", name: "Storia", color: "#f59e0b", order: 2 },
  { id: "inglese", name: "Inglese", color: "#14b8a6", order: 3 },
  { id: "scienze", name: "Scienze", color: "#22c55e", order: 4 },
  { id: "fisica", name: "Fisica", color: "#8b5cf6", order: 5 },
  { id: "latino", name: "Latino", color: "#ec4899", order: 6 },
];

const DEFAULT_DB = {
  subjects: DEFAULT_SUBJECTS,
  files: [],
  metrics: {},
};

const uploadSessions = new Map();

async function ensureStorage() {
  await fsp.mkdir(PUBLIC_DIR, { recursive: true });
  await fsp.mkdir(STORAGE_DIR, { recursive: true });
  await fsp.mkdir(UPLOADS_DIR, { recursive: true });

  if (!fs.existsSync(DB_FILE)) {
    await writeDb(DEFAULT_DB);
  }
}

function normalizeSubject(subject, index) {
  return {
    id: sanitizeText(subject?.id, 64) || createSlug(subject?.name || `materia-${index + 1}`),
    name: sanitizeText(subject?.name, 60) || `Materia ${index + 1}`,
    color: /^#[0-9a-f]{6}$/i.test(String(subject?.color || "")) ? subject.color : "#0f766e",
    order: Number.isInteger(subject?.order) ? subject.order : index,
  };
}

function normalizeFile(file) {
  const id = sanitizeText(file?.id, 64) || createId("file");
  const originalName = sanitizeText(file?.originalName || file?.name, 180) || "file";
  const storedName = sanitizeText(file?.storedName, 220);
  const mimeType = sanitizeText(file?.mimeType, 120) || getMimeType(originalName);
  const subjectId = sanitizeText(file?.subjectId, 64);

  return {
    id,
    title: sanitizeText(file?.title, 120) || originalName,
    description: sanitizeText(file?.description, 280),
    originalName,
    storedName,
    mimeType,
    subjectId,
    size: Number.isFinite(Number(file?.size)) ? Number(file.size) : 0,
    uploadedAt: sanitizeText(file?.uploadedAt, 80) || new Date().toISOString(),
  };
}

async function readDb() {
  try {
    const raw = await fsp.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const subjectsSource = Array.isArray(parsed.subjects) && parsed.subjects.length ? parsed.subjects : DEFAULT_SUBJECTS;
    const filesSource = Array.isArray(parsed.files) ? parsed.files : [];

    return {
      subjects: subjectsSource.map(normalizeSubject).sort((a, b) => a.order - b.order),
      files: filesSource.map(normalizeFile).filter((file) => file.storedName),
      metrics: parsed.metrics && typeof parsed.metrics === "object" ? parsed.metrics : {},
    };
  } catch (error) {
    await writeDb(DEFAULT_DB);
    return structuredClone(DEFAULT_DB);
  }
}

async function writeDb(db) {
  const normalized = {
    subjects: [...db.subjects].map(normalizeSubject).sort((a, b) => a.order - b.order),
    files: [...db.files].map(normalizeFile),
    metrics: db.metrics || {},
  };
  await fsp.writeFile(DB_FILE, JSON.stringify(normalized, null, 2), "utf8");
}

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || `materia-${crypto.randomUUID().slice(0, 4)}`;
}

function sanitizeFileComponent(value, maxLength = 160) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function buildStoredFileName(title, fallbackName) {
  const extension = path.extname(fallbackName || "").toLowerCase();
  const baseName =
    sanitizeFileComponent(title, 120).replace(/\.[a-z0-9]{1,8}$/i, "") ||
    sanitizeFileComponent(path.basename(fallbackName || "", extension), 120) ||
    `file-${crypto.randomUUID().slice(0, 6)}`;

  return extension && !baseName.toLowerCase().endsWith(extension) ? `${baseName}${extension}` : baseName;
}

function getMimeType(filename) {
  const extension = path.extname(filename).toLowerCase();
  return MIME_TYPES[extension] || "application/octet-stream";
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((accumulator, pair) => {
      const separator = pair.indexOf("=");
      if (separator === -1) {
        return accumulator;
      }

      const name = pair.slice(0, separator);
      const value = pair.slice(separator + 1);
      accumulator[name] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

function signSession(base) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(base).digest("base64url");
}

function createSessionToken() {
  const payload = {
    exp: Date.now() + SESSION_TTL_MS,
    nonce: crypto.randomUUID(),
  };
  const base = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${base}.${signSession(base)}`;
}

function verifySessionToken(token) {
  if (!token || !token.includes(".")) {
    return false;
  }

  const [base, signature] = token.split(".");
  if (!base || !signature) {
    return false;
  }

  const expected = signSession(base);
  const safeSignature = Buffer.from(signature);
  const safeExpected = Buffer.from(expected);

  if (safeSignature.length !== safeExpected.length || !crypto.timingSafeEqual(safeSignature, safeExpected)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(base, "base64url").toString("utf8"));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch (error) {
    return false;
  }
}

function isAdminRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  return verifySessionToken(cookies[SESSION_COOKIE]);
}

function send(res, statusCode, payload, headers = {}) {
  const isBuffer = Buffer.isBuffer(payload);
  const defaultHeaders = {
    "Cache-Control": "no-store",
    ...headers,
  };

  if (!defaultHeaders["Content-Type"] && !isBuffer) {
    defaultHeaders["Content-Type"] = "text/plain; charset=utf-8";
  }

  res.writeHead(statusCode, defaultHeaders);
  res.end(payload);
}

function sendJson(res, statusCode, data, headers = {}) {
  send(res, statusCode, JSON.stringify(data), {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
}

function notFound(res) {
  sendJson(res, 404, { error: "Risorsa non trovata." });
}

function sanitizeText(value, maxLength = 180) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function getPreviewType(file) {
  const extension = path.extname(file.originalName).toLowerCase();
  if (file.mimeType === "application/pdf" || extension === ".pdf") {
    return "pdf";
  }
  if (file.mimeType.startsWith("image/")) {
    return "image";
  }
  if (file.mimeType.startsWith("text/") || extension === ".md") {
    return "text";
  }
  return "download";
}

function getMetric(db, fileId) {
  return db.metrics[fileId] || { downloadCount: 0 };
}

function incrementDownloadMetric(db, fileId) {
  const current = getMetric(db, fileId);
  db.metrics[fileId] = {
    ...current,
    downloadCount: (current.downloadCount || 0) + 1,
  };
}

function subjectStats(subjects, filesBySubject) {
  return subjects
    .sort((a, b) => a.order - b.order)
    .map((subject) => {
      const files = filesBySubject.get(subject.id) || [];
      const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
      return {
        ...subject,
        fileCount: files.length,
        totalBytes,
        totalSizeLabel: formatBytes(totalBytes),
      };
    });
}

function publicFileShape(db, subject, file) {
  const metric = getMetric(db, file.id);

  return {
    id: file.id,
    title: file.title,
    description: file.description || "",
    originalName: file.originalName,
    mimeType: file.mimeType || getMimeType(file.originalName),
    subjectId: subject.id,
    subjectName: subject.name,
    subjectColor: subject.color,
    size: Number(file.size || 0),
    sizeLabel: formatBytes(Number(file.size || 0)),
    uploadedAt: file.uploadedAt || new Date().toISOString(),
    downloadCount: metric.downloadCount || 0,
    previewType: getPreviewType(file),
    shareUrl: `/share/${file.id}`,
    downloadUrl: `/download/${file.id}`,
    viewUrl: `/view/${file.id}`,
    storageLabel: "Archivio interno",
  };
}

async function readJsonBody(req, maxLength = MAX_JSON_BODY) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxLength) {
      throw new Error("BODY_TOO_LARGE");
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function serveFile(res, absolutePath, headers = {}) {
  try {
    const stat = await fsp.stat(absolutePath);
    const contentType = getMimeType(absolutePath);
    send(res, 200, await fsp.readFile(absolutePath), {
      "Content-Type": contentType,
      "Content-Length": stat.size,
      ...headers,
    });
  } catch (error) {
    notFound(res);
  }
}

async function handleStatic(res, url) {
  const filePath = path.join(PUBLIC_DIR, url.pathname.replace(/^\/assets\//, ""));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    notFound(res);
    return;
  }

  await serveFile(res, filePath, {
    "Cache-Control": "public, max-age=300",
  });
}

async function handleIndex(res) {
  await serveFile(res, path.join(PUBLIC_DIR, "index.html"));
}

async function handleSharePage(res) {
  await serveFile(res, path.join(PUBLIC_DIR, "share.html"));
}

function requireAdmin(req, res) {
  if (!isAdminRequest(req)) {
    sendJson(res, 403, { error: "Serve l'accesso admin per questa operazione." });
    return false;
  }
  return true;
}

function routeMatcher(pattern, pathname) {
  const names = [];
  const regex = new RegExp(
    "^" +
      pattern
        .replace(/\//g, "\\/")
        .replace(/:([A-Za-z0-9_]+)/g, (_, name) => {
          names.push(name);
          return "([^\\/]+)";
        }) +
      "$"
  );

  const match = pathname.match(regex);
  if (!match) {
    return null;
  }

  return names.reduce((params, name, index) => {
    params[name] = decodeURIComponent(match[index + 1]);
    return params;
  }, {});
}

async function collectFilesForBootstrap(db) {
  const filesBySubject = new Map();
  db.subjects.forEach((subject) => filesBySubject.set(subject.id, []));

  const allFiles = db.files
    .map((file) => {
      const subject =
        db.subjects.find((entry) => entry.id === file.subjectId) || {
          id: "unknown",
          name: "Archivio",
          color: "#64748b",
          order: 999,
        };
      const shaped = publicFileShape(db, subject, file);
      const list = filesBySubject.get(subject.id) || [];
      list.push(shaped);
      filesBySubject.set(subject.id, list);
      return shaped;
    })
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  return { filesBySubject, allFiles };
}

async function handleBootstrap(req, res) {
  const db = await readDb();
  const { filesBySubject, allFiles } = await collectFilesForBootstrap(db);
  const totalBytes = allFiles.reduce((sum, file) => sum + (file.size || 0), 0);

  sendJson(res, 200, {
    isAdmin: isAdminRequest(req),
    limits: {
      maxFileSize: MAX_UPLOAD_BYTES,
      maxFileSizeLabel: `Fino a ${formatBytes(MAX_UPLOAD_BYTES)} per file`,
    },
    stats: {
      totalFiles: allFiles.length,
      totalSubjects: db.subjects.length,
      totalBytes,
      totalSizeLabel: formatBytes(totalBytes),
    },
    subjects: subjectStats(db.subjects, filesBySubject),
    files: allFiles,
  });
}

async function resolveFileReference(db, fileId) {
  const file = db.files.find((entry) => entry.id === fileId);
  if (!file) {
    throw new Error("FILE_NOT_FOUND");
  }

  const subject =
    db.subjects.find((entry) => entry.id === file.subjectId) || {
      id: "unknown",
      name: "Archivio",
      color: "#64748b",
      order: 999,
    };

  return {
    file,
    subject,
    publicFile: publicFileShape(db, subject, file),
  };
}

function absoluteUploadPath(storedName) {
  const absolutePath = path.join(UPLOADS_DIR, storedName);
  if (!absolutePath.startsWith(UPLOADS_DIR)) {
    throw new Error("INVALID_UPLOAD_PATH");
  }
  return absolutePath;
}

async function handleFileDetail(res, fileId) {
  const db = await readDb();
  try {
    const resolved = await resolveFileReference(db, fileId);
    sendJson(res, 200, resolved.publicFile);
  } catch (error) {
    notFound(res);
  }
}

async function handleFileDownload(res, fileId, inline = false) {
  const db = await readDb();
  try {
    const resolved = await resolveFileReference(db, fileId);
    const absolutePath = absoluteUploadPath(resolved.file.storedName);
    const stat = await fsp.stat(absolutePath);

    if (!inline) {
      incrementDownloadMetric(db, fileId);
      await writeDb(db);
    }

    const headers = {
      "Content-Type": resolved.file.mimeType || "application/octet-stream",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${encodeURIComponent(resolved.file.originalName)}"`,
      "Content-Length": stat.size,
      "Cache-Control": "no-store",
    };

    res.writeHead(200, headers);
    fs.createReadStream(absolutePath).pipe(res);
  } catch (error) {
    notFound(res);
  }
}

async function handleAdminLogin(req, res) {
  let payload;

  try {
    payload = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: "Richiesta non valida." });
    return;
  }

  if (sanitizeText(payload.code, 80) !== ADMIN_CODE) {
    sendJson(res, 401, { error: "Codice admin non corretto." });
    return;
  }

  const token = createSessionToken();
  sendJson(
    res,
    200,
    { ok: true },
    {
      "Set-Cookie": `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(
        SESSION_TTL_MS / 1000
      )}`,
    }
  );
}

function handleAdminLogout(res) {
  sendJson(
    res,
    200,
    { ok: true },
    {
      "Set-Cookie": `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
    }
  );
}

async function handleUploadSession(req, res) {
  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: "Dati upload non validi." });
    return;
  }

  const subjectId = sanitizeText(payload.subjectId, 64);
  const title = sanitizeText(payload.title, 120);
  const description = sanitizeText(payload.description, 280);
  const originalName = sanitizeText(payload.originalName, 180);
  const mimeType = sanitizeText(payload.mimeType, 120) || getMimeType(originalName);
  const size = Number(payload.size || 0);

  if (!subjectId || !title || !originalName || !Number.isFinite(size) || size <= 0) {
    sendJson(res, 400, { error: "Titolo, materia e file sono obbligatori." });
    return;
  }

  if (size > MAX_UPLOAD_BYTES) {
    sendJson(res, 400, { error: `Il file supera il limite di ${formatBytes(MAX_UPLOAD_BYTES)}.` });
    return;
  }

  const db = await readDb();
  const subject = db.subjects.find((entry) => entry.id === subjectId);
  if (!subject) {
    sendJson(res, 400, { error: "La materia selezionata non esiste." });
    return;
  }

  const fileId = createId("file");
  const storedName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${buildStoredFileName(title, originalName)}`;
  const sessionId = createId("upload");

  uploadSessions.set(sessionId, {
    fileId,
    title,
    description,
    originalName,
    mimeType,
    size,
    subjectId,
    storedName,
    createdAt: Date.now(),
  });

  sendJson(res, 200, {
    ok: true,
    uploadUrl: `/api/upload-session/${sessionId}`,
  });
}

async function handleUploadBinary(req, res, sessionId) {
  const session = uploadSessions.get(sessionId);
  if (!session) {
    notFound(res);
    return;
  }

  const contentLength = Number(req.headers["content-length"] || 0);
  if (!Number.isFinite(contentLength) || contentLength <= 0) {
    sendJson(res, 400, { error: "Dimensione upload non valida." });
    return;
  }

  if (contentLength !== session.size) {
    sendJson(res, 400, { error: "La dimensione del file non coincide con la sessione di upload." });
    return;
  }

  const tempPath = absoluteUploadPath(`${session.storedName}.part`);
  const finalPath = absoluteUploadPath(session.storedName);

  try {
    const writeStream = fs.createWriteStream(tempPath, { flags: "wx" });
    await pipeline(req, writeStream);

    const stat = await fsp.stat(tempPath);
    if (stat.size !== session.size) {
      throw new Error("SIZE_MISMATCH");
    }

    await fsp.rename(tempPath, finalPath);

    const db = await readDb();
    db.files.push({
      id: session.fileId,
      title: session.title,
      description: session.description,
      originalName: session.originalName,
      storedName: session.storedName,
      mimeType: session.mimeType,
      subjectId: session.subjectId,
      size: session.size,
      uploadedAt: new Date().toISOString(),
    });

    await writeDb(db);
    uploadSessions.delete(sessionId);
    sendJson(res, 200, { ok: true, fileId: session.fileId });
  } catch (error) {
    uploadSessions.delete(sessionId);
    await fsp.rm(tempPath, { force: true }).catch(() => {});
    sendJson(
      res,
      400,
      { error: error.message === "SIZE_MISMATCH" ? "Upload incompleto. Riprova." : "Impossibile salvare il file sul server." }
    );
  }
}

async function handleCreateSubject(req, res) {
  if (!requireAdmin(req, res)) {
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: "Dati della materia non validi." });
    return;
  }

  const name = sanitizeText(payload.name, 60);
  const color = /^#[0-9a-f]{6}$/i.test(String(payload.color || "")) ? payload.color : "#0f766e";

  if (!name) {
    sendJson(res, 400, { error: "Il nome della materia e' obbligatorio." });
    return;
  }

  const db = await readDb();
  const id = createSlug(name);
  const exists = db.subjects.some((subject) => subject.id === id);
  const subjectId = exists ? `${id}-${crypto.randomUUID().slice(0, 4)}` : id;

  db.subjects.push({
    id: subjectId,
    name,
    color,
    order: db.subjects.length,
  });

  await writeDb(db);
  sendJson(res, 201, { ok: true });
}

async function handleUpdateSubject(req, res, subjectId) {
  if (!requireAdmin(req, res)) {
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: "Dati della materia non validi." });
    return;
  }

  const db = await readDb();
  const subject = db.subjects.find((entry) => entry.id === subjectId);
  if (!subject) {
    notFound(res);
    return;
  }

  const name = sanitizeText(payload.name, 60);
  const color = /^#[0-9a-f]{6}$/i.test(String(payload.color || "")) ? payload.color : subject.color;

  if (!name) {
    sendJson(res, 400, { error: "Il nome della materia non puo' essere vuoto." });
    return;
  }

  subject.name = name;
  subject.color = color;
  await writeDb(db);
  sendJson(res, 200, { ok: true });
}

async function handleMoveSubject(req, res, subjectId) {
  if (!requireAdmin(req, res)) {
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: "Ordine materia non valido." });
    return;
  }

  const direction = payload.direction === "down" ? "down" : "up";
  const db = await readDb();
  const subjects = db.subjects.sort((a, b) => a.order - b.order);
  const index = subjects.findIndex((entry) => entry.id === subjectId);

  if (index === -1) {
    notFound(res);
    return;
  }

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= subjects.length) {
    sendJson(res, 200, { ok: true });
    return;
  }

  [subjects[index], subjects[swapIndex]] = [subjects[swapIndex], subjects[index]];
  subjects.forEach((subject, order) => {
    subject.order = order;
  });

  await writeDb(db);
  sendJson(res, 200, { ok: true });
}

async function handleDeleteSubject(req, res, subjectId) {
  if (!requireAdmin(req, res)) {
    return;
  }

  const db = await readDb();
  const inUse = db.files.some((file) => file.subjectId === subjectId);
  if (inUse) {
    sendJson(res, 400, { error: "Sposta o elimina prima i file presenti in questa materia." });
    return;
  }

  const nextSubjects = db.subjects.filter((subject) => subject.id !== subjectId);
  if (nextSubjects.length === db.subjects.length) {
    notFound(res);
    return;
  }

  nextSubjects.forEach((subject, index) => {
    subject.order = index;
  });

  db.subjects = nextSubjects;
  await writeDb(db);
  sendJson(res, 200, { ok: true });
}

async function handleUpdateFile(req, res, fileId) {
  if (!requireAdmin(req, res)) {
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: "Dati del file non validi." });
    return;
  }

  const db = await readDb();
  const file = db.files.find((entry) => entry.id === fileId);
  if (!file) {
    notFound(res);
    return;
  }

  const title = sanitizeText(payload.title, 120);
  const description = sanitizeText(payload.description, 280);
  const subjectId = sanitizeText(payload.subjectId, 64);
  const targetSubject = db.subjects.find((subject) => subject.id === subjectId);

  if (!title || !targetSubject) {
    sendJson(res, 400, { error: "Titolo o materia non validi." });
    return;
  }

  const nextStoredName = `${path.parse(file.storedName).name}-${buildStoredFileName(title, file.originalName)}`;
  const currentPath = absoluteUploadPath(file.storedName);
  const nextPath = absoluteUploadPath(nextStoredName);

  try {
    if (file.storedName !== nextStoredName && fs.existsSync(currentPath)) {
      await fsp.rename(currentPath, nextPath);
      file.storedName = nextStoredName;
    }

    file.title = title;
    file.description = description;
    file.subjectId = subjectId;
    await writeDb(db);
    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 400, { error: "Aggiornamento file non riuscito." });
  }
}

async function handleDeleteFile(req, res, fileId) {
  if (!requireAdmin(req, res)) {
    return;
  }

  const db = await readDb();
  const file = db.files.find((entry) => entry.id === fileId);
  if (!file) {
    notFound(res);
    return;
  }

  try {
    await fsp.rm(absoluteUploadPath(file.storedName), { force: true });
    db.files = db.files.filter((entry) => entry.id !== fileId);
    delete db.metrics[fileId];
    await writeDb(db);
    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 400, { error: "Eliminazione file non riuscita." });
  }
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (req.method === "GET" && url.pathname === "/") {
    await handleIndex(res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/bootstrap") {
    await handleBootstrap(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/assets/")) {
    await handleStatic(res, url);
    return;
  }

  if (req.method === "GET" && routeMatcher("/share/:fileId", url.pathname)) {
    await handleSharePage(res);
    return;
  }

  const detailParams = routeMatcher("/api/files/:fileId", url.pathname);
  if (req.method === "GET" && detailParams) {
    await handleFileDetail(res, detailParams.fileId);
    return;
  }

  const downloadParams = routeMatcher("/download/:fileId", url.pathname);
  if (req.method === "GET" && downloadParams) {
    await handleFileDownload(res, downloadParams.fileId, false);
    return;
  }

  const viewParams = routeMatcher("/view/:fileId", url.pathname);
  if (req.method === "GET" && viewParams) {
    await handleFileDownload(res, viewParams.fileId, true);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/upload-session") {
    await handleUploadSession(req, res);
    return;
  }

  const uploadSessionParams = routeMatcher("/api/upload-session/:sessionId", url.pathname);
  if (req.method === "PUT" && uploadSessionParams) {
    await handleUploadBinary(req, res, uploadSessionParams.sessionId);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/login") {
    await handleAdminLogin(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/logout") {
    handleAdminLogout(res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/subjects") {
    await handleCreateSubject(req, res);
    return;
  }

  const subjectParams = routeMatcher("/api/subjects/:subjectId", url.pathname);
  if (req.method === "PATCH" && subjectParams) {
    await handleUpdateSubject(req, res, subjectParams.subjectId);
    return;
  }

  const subjectMoveParams = routeMatcher("/api/subjects/:subjectId/move", url.pathname);
  if (req.method === "POST" && subjectMoveParams) {
    await handleMoveSubject(req, res, subjectMoveParams.subjectId);
    return;
  }

  if (req.method === "DELETE" && subjectParams) {
    await handleDeleteSubject(req, res, subjectParams.subjectId);
    return;
  }

  const fileParams = routeMatcher("/api/files/:fileId/manage", url.pathname);
  if (req.method === "PATCH" && fileParams) {
    await handleUpdateFile(req, res, fileParams.fileId);
    return;
  }

  if (req.method === "DELETE" && fileParams) {
    await handleDeleteFile(req, res, fileParams.fileId);
    return;
  }

  notFound(res);
}

async function bootstrap() {
  await ensureStorage();

  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      console.error(error);
      sendJson(res, 500, { error: "Errore interno del server." });
    });
  });

  server.listen(PORT, HOST, () => {
    console.log(`Archivio liceo attivo su http://${HOST}:${PORT}`);
    console.log(`Codice admin attuale: ${ADMIN_CODE}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
