# WA Sender

A personal dashboard to send a file (or message) to several of your WhatsApp
contacts at once — from your own number — without opening WhatsApp and doing it
by hand. Runs entirely on your own computer.

---

## ⚠️ Read this first

This drives **your own WhatsApp account** through WhatsApp Web automation
(`whatsapp-web.js`). That is **against WhatsApp's Terms of Service**, and a
number that behaves like a spammer can get **banned**.

You accepted this risk — here's how to stay on the safe side of it:

- Only send to people who **have your number saved** / know you.
- Keep volume **low** (a handful of people, not hundreds).
- The app already **paces sends 4–9 seconds apart** — do not remove that.
- If losing the number would hurt, **use a spare number**, not your main one.
- Never point this at strangers or bought lists. That's what gets numbers killed.

---

## How to run it (about 5 minutes)

You need **Node.js 18+** installed. Check with `node --version`.

1. Open a terminal in this folder.

2. Install dependencies (this also downloads a Chromium browser the first time,
   so it may take a minute or two):
   ```
   npm install
   ```

3. Start it:
   ```
   npm start
   ```

4. Open your browser at **http://localhost:3000**

5. A **QR code** appears. On your phone: open WhatsApp →
   **Settings → Linked Devices → Link a Device** → scan the QR.
   (Exactly like logging into WhatsApp Web. You only do this once — the session
   is saved.)

6. Once it says **connected**, you'll see the dashboard. Add a few contacts,
   pick a file, tick who to send to, and hit send.

---

## How to use it

- **Add contacts**: name + phone. Phone is **country code + number, digits only**
  — e.g. a UAE number is `971501234567` (no `+`, no spaces, no dashes).
- **Pick a file** (any type — PDF, image, doc, etc.) and/or type a caption.
- **Tick recipients**, then **Send**. Watch the results appear per person.

Contacts are saved in `data/contacts.json`. Your WhatsApp login is saved in
`data/session/` so you don't re-scan every time.

---

## If something breaks

- **QR won't scan / keeps refreshing** → make sure your phone has internet and
  you're on the latest WhatsApp. Restart `npm start`.
- **"WhatsApp not ready"** → wait until the dot is green (it loads your chats
  after scanning, takes a few seconds).
- **Want to switch numbers** → delete the `data/session/` folder and restart.
- **`npm install` fails on Chromium** → you may need system libraries; on most
  machines it just works. Search the exact error — `whatsapp-web.js puppeteer`
  + your OS usually has the fix.

---

## What this is NOT

- Not a bulk-marketing blaster (that gets you banned — and isn't what you built).
- Not the WhatsApp Business API (no opt-in, no templates, no per-message cost —
  it's just automating your own account).
- Not running on a server somewhere — it's a local tool on your machine.

Built as a personal project. Use it responsibly. — your mentor
