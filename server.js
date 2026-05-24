// wa-sender — personal WhatsApp file dispatcher.
// Drives YOUR WhatsApp account via WhatsApp Web (whatsapp-web.js).
// Scan the QR once with your phone, then send files to chosen contacts
// from a local dashboard. Sends are deliberately paced to stay human-like.
//
// Runs on YOUR machine only. Needs a real Chromium (whatsapp-web.js installs
// one via puppeteer). Not runnable in a headless sandbox without a session.

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const qrcode = require("qrcode");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

const app = express();
const PORT = 3000;

// ---- simple JSON contact store (no database needed for a personal tool) ----
const DATA_DIR = path.join(__dirname, "data");
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json");
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(path.join(__dirname, "uploads"), { recursive: true });

function loadContacts() {
  try { return JSON.parse(fs.readFileSync(CONTACTS_FILE, "utf8")); }
  catch { return []; }
}
function saveContacts(list) {
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(list, null, 2));
}

// ---- safety pacing ----
// Random delay between each send so the pattern looks human, not like a bot
// firing in bursts. This is the main thing protecting your number — do NOT
// remove it or set it to zero.
const MIN_DELAY_MS = 4000;   // 4s
const MAX_DELAY_MS = 9000;   // 9s
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const randDelay = () => MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));

// ---- WhatsApp client ----
let waStatus = "starting";   // starting | qr | authenticated | ready | disconnected
let lastQrDataUrl = null;

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(DATA_DIR, "session") }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", async (qr) => {
  waStatus = "qr";
  lastQrDataUrl = await qrcode.toDataURL(qr);
  console.log("\n[wa-sender] Scan the QR in your browser at http://localhost:" + PORT + "\n");
});
client.on("authenticated", () => { waStatus = "authenticated"; lastQrDataUrl = null; });
client.on("ready", () => { waStatus = "ready"; console.log("[wa-sender] WhatsApp is READY. You can send now."); });
client.on("disconnected", () => { waStatus = "disconnected"; });
client.on("auth_failure", () => { waStatus = "disconnected"; });

client.initialize().catch((e) => console.error("[wa-sender] init error:", e.message));

// ---- middleware ----
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
const upload = multer({
  dest: path.join(__dirname, "uploads"),
  limits: { fileSize: 64 * 1024 * 1024 }, // 64MB — WhatsApp doc limit is ~100MB
});

// ---- routes ----

// login / status
app.get("/api/status", (req, res) => {
  res.json({ status: waStatus, qr: waStatus === "qr" ? lastQrDataUrl : null });
});

// log out (clears the saved session so you can link a different number)
app.post("/api/logout", async (req, res) => {
  try { await client.logout(); } catch {}
  waStatus = "disconnected";
  res.json({ ok: true });
});

// contacts
app.get("/api/contacts", (req, res) => res.json(loadContacts()));

app.post("/api/contacts", (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: "name and phone required" });
  const contacts = loadContacts();
  const cleaned = String(phone).replace(/[^\d]/g, ""); // digits only, country code included
  contacts.push({ id: Date.now().toString(), name, phone: cleaned });
  saveContacts(contacts);
  res.json({ ok: true, contacts });
});

app.delete("/api/contacts/:id", (req, res) => {
  saveContacts(loadContacts().filter((c) => c.id !== req.params.id));
  res.json({ ok: true });
});

// send a file (or text) to selected contacts, paced
app.post("/api/send", upload.single("file"), async (req, res) => {
  if (waStatus !== "ready") {
    return res.status(409).json({ error: "WhatsApp not ready. Scan the QR first." });
  }
  let ids;
  try { ids = JSON.parse(req.body.contactIds || "[]"); } catch { ids = []; }
  const message = (req.body.message || "").trim();
  const file = req.file;

  if (!ids.length) return res.status(400).json({ error: "no recipients selected" });
  if (!file && !message) return res.status(400).json({ error: "attach a file or type a message" });

  const contacts = loadContacts();
  const targets = contacts.filter((c) => ids.includes(c.id));

  // Build media explicitly. multer saves the upload with a random,
  // EXTENSION-LESS temp name, so MessageMedia.fromFilePath() can't detect the
  // type and mislabels it. Instead we hand WhatsApp the real mimetype, the
  // real filename, and the raw bytes as base64 — so type + name are correct.
  let media = null;
  const isImage = file ? /^image\//.test(file.mimetype) : false;
  if (file) {
    const base64 = fs.readFileSync(file.path).toString("base64");
    media = new MessageMedia(file.mimetype, base64, file.originalname);
  }

  const results = [];
  for (let i = 0; i < targets.length; i++) {
    const c = targets[i];
    const chatId = c.phone + "@c.us";
    try {
      if (media) {
        await client.sendMessage(chatId, media, {
          caption: message || undefined,
          // Force documents (PDF, docx, xlsx, etc.) to arrive as proper
          // downloadable files rather than being rendered inline. Real images
          // are left as normal photos.
          sendMediaAsDocument: !isImage,
        });
      } else {
        await client.sendMessage(chatId, message);
      }
      results.push({ name: c.name, phone: c.phone, status: "sent" });
    } catch (err) {
      results.push({ name: c.name, phone: c.phone, status: "failed", error: err.message });
    }
    // pace between sends (skip the wait after the last one)
    if (i < targets.length - 1) await delay(randDelay());
  }

  // clean up the uploaded temp file
  if (file) fs.unlink(file.path, () => {});

  res.json({ sent: results.filter((r) => r.status === "sent").length, total: targets.length, results });
});

app.listen(PORT, () => {
  console.log(`[wa-sender] Dashboard: http://localhost:${PORT}`);
});