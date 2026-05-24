# WhispFLow

A local dashboard to send a file (or message) to several of your WhatsApp
contacts at once — from your own number — without opening WhatsApp and doing it
by hand. Runs entirely on your own machine.

**Stack:** Node.js · Express · whatsapp-web.js · vanilla JS dashboard

---

## About / Why this approach

There are two ways to send WhatsApp messages programmatically, and choosing the
right one matters more than the code:

- **WhatsApp Business API** — built for companies messaging customers at scale.
  Requires business verification, recipient opt-in, pre-approved message
  templates, and charges per message. Powerful, but heavy overkill for sending
  a file to a few friends from your own number.
- **WhatsApp Web automation** (what this uses) — drives your *own* WhatsApp
  account through a real browser session, exactly as if you were clicking
  through WhatsApp Web yourself. No opt-in, no templates, no per-message cost.

For a personal, low-volume tool, Web automation is the correct fit. The
trade-off is that it runs against WhatsApp's Terms of Service, so the app is
built defensively: sends are **auto-paced 4–9 seconds apart** to behave like a
human rather than a bot, which is the main thing that keeps an account out of
trouble.

---

## Read this first!!!!!

This drives **your own WhatsApp account** through WhatsApp Web automation
(`whatsapp-web.js`), which is **against WhatsApp's Terms of Service**. A number
that behaves like a spammer can get **banned**. To stay on the safe side:

- Only send to people who **have your number saved** / know you.
- Keep volume **low** — a handful of people, not hundreds.
- The app already **paces sends 4–9 seconds apart**; don't remove that.
- If losing the number would hurt, **use a spare number**, not your main one.
- Never point this at strangers or bought lists.

---

## Run it (about 5 minutes)

You need **Node.js 18+** (`node --version` to check).

1. Open a terminal in this folder.
2. Install dependencies (downloads a Chromium browser the first time, so give
   it a minute):
   ```
   npm install
   ```
3. Start it:
   ```
   npm start
   ```
4. Open **http://localhost:3000** in your browser.
5. A **QR code** appears. On your phone: WhatsApp →
   **Settings → Linked Devices → Link a Device** → scan it. (One time only —
   the session is saved.)
6. Once the status dot is **green**, add contacts, pick a file, tick who to
   send to, and hit send.

---

## How to use it

- **Add contacts**: name + phone. Phone is **country code + number, digits
  only** — e.g. a UAE number is `971501234567` (no `+`, no spaces, no dashes).
- **Pick a file** (PDF, image, doc, anything) and/or type a caption.
- **Tick recipients**, then **Send**. Results appear per person.

Documents (PDF, Word, Excel) are sent as proper downloadable files; images are
sent as normal photos. Contacts live in `data/contacts.json`; your WhatsApp
login is saved in `data/session/` so you don't re-scan each time.

---

## Tech notes

- **Sending**: `whatsapp-web.js` holds a persistent browser session to your
  phone. Media is built explicitly from the file's real MIME type and original
  filename (not auto-detected) so files arrive correctly typed and named.
- **Pacing**: a randomized 4–9s delay between each send.
- **Storage**: simple JSON file for contacts — no database needed at this scale.
- **Why not serverless (Vercel etc.)**: this needs a long-lived process holding
  an open browser session, which serverless platforms shut down between
  requests. It's designed to run locally, or on an always-on host (Railway,
  Render, a VPS) if remote access is ever needed.

---

## Troubleshooting

- **QR keeps refreshing** → check your phone's internet and that WhatsApp is
  up to date; restart `npm start`.
- **"WhatsApp not ready"** → wait for the green dot (it loads your chats after
  scanning).
- **Switch numbers** → delete the `data/session/` folder and restart.
- **`npm install` fails on Chromium** → usually a missing system library;
  search the exact error plus `whatsapp-web.js puppeteer` and your OS.

---

## Author

**Niranjan Subash**

Built as a personal project — an exercise in browser automation, file handling,
and choosing the right tool for the constraints rather than the most powerful one.
