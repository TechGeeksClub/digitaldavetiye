import cors from "cors";
import express from "express";
import multer from "multer";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const uploadsDir = path.join(rootDir, "uploads");
const dbPath = path.join(dataDir, "local.sqlite");
const port = Number(process.env.API_PORT || 4174);

await mkdir(dataDir, { recursive: true });
await mkdir(uploadsDir, { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invitation_slug TEXT NOT NULL,
    name TEXT NOT NULL,
    guest_count INTEGER NOT NULL,
    status TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(invitation_slug) REFERENCES invitations(slug)
  );

  CREATE TABLE IF NOT EXISTS media_uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invitation_slug TEXT NOT NULL,
    original_name TEXT NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(invitation_slug) REFERENCES invitations(slug)
  );
`);

async function seedInvitations() {
  const seedPath = path.join(dataDir, "seed-invitations.json");
  const seed = JSON.parse(await readFile(seedPath, "utf8"));
  const upsert = db.prepare(`
    INSERT INTO invitations (slug, data)
    VALUES (?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      data = excluded.data,
      updated_at = CURRENT_TIMESTAMP
  `);

  for (const invitation of seed.invitations || []) {
    upsert.run(invitation.slug, JSON.stringify(invitation));
  }
}

await seedInvitations();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadsDir),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase || "media"}${extension}`;
    callback(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      callback(null, true);
      return;
    }
    callback(new Error("Sadece fotoğraf veya video yüklenebilir."));
  }
});

function getInvitation(slug) {
  const row = db.prepare("SELECT slug, data FROM invitations WHERE slug = ?").get(slug);
  if (!row) {
    return null;
  }
  return JSON.parse(row.data);
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/invitations/:slug", (req, res) => {
  const invitation = getInvitation(req.params.slug);
  if (!invitation) {
    res.status(404).json({ error: "Davetiye bulunamadı." });
    return;
  }

  res.json({ invitation });
});

app.post("/api/invitations/:slug/rsvps", (req, res) => {
  const invitation = getInvitation(req.params.slug);
  if (!invitation) {
    res.status(404).json({ error: "Davetiye bulunamadı." });
    return;
  }

  const name = normalizeString(req.body.name);
  const note = normalizeString(req.body.note).slice(0, 500);
  const status = normalizeString(req.body.status);
  const guestCount = Number(req.body.guestCount);

  if (!name) {
    res.status(400).json({ error: "Ad soyad zorunludur." });
    return;
  }

  if (!["yes", "no", "maybe"].includes(status)) {
    res.status(400).json({ error: "Katılım durumu geçersiz." });
    return;
  }

  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
    res.status(400).json({ error: "Kişi sayısı 1-20 arasında olmalıdır." });
    return;
  }

  const result = db
    .prepare(
      "INSERT INTO rsvps (invitation_slug, name, guest_count, status, note) VALUES (?, ?, ?, ?, ?)"
    )
    .run(req.params.slug, name, guestCount, status, note);

  res.status(201).json({
    rsvp: {
      id: result.lastInsertRowid,
      invitationSlug: req.params.slug,
      name,
      guestCount,
      status,
      note
    }
  });
});

app.get("/api/invitations/:slug/media", (req, res) => {
  const invitation = getInvitation(req.params.slug);
  if (!invitation) {
    res.status(404).json({ error: "Davetiye bulunamadı." });
    return;
  }

  const media = db
    .prepare(
      `SELECT id, original_name AS originalName, filename, mime_type AS mimeType,
              size_bytes AS sizeBytes, file_url AS fileUrl, created_at AS createdAt
       FROM media_uploads
       WHERE invitation_slug = ?
       ORDER BY created_at DESC`
    )
    .all(req.params.slug);

  res.json({ media });
});

app.post("/api/invitations/:slug/media", upload.single("media"), (req, res) => {
  const invitation = getInvitation(req.params.slug);
  if (!invitation) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(404).json({ error: "Davetiye bulunamadı." });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "Yüklenecek dosya seçilmedi." });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const result = db
    .prepare(
      `INSERT INTO media_uploads
       (invitation_slug, original_name, filename, mime_type, size_bytes, file_url)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.params.slug,
      req.file.originalname,
      req.file.filename,
      req.file.mimetype,
      req.file.size,
      fileUrl
    );

  res.status(201).json({
    media: {
      id: result.lastInsertRowid,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      fileUrl
    }
  });
});

app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || "Beklenmeyen hata." });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
