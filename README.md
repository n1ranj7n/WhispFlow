# Whispflow

**Send a file to several of your WhatsApp contacts at once — from a simple desktop app, using your own WhatsApp account.** No groups, no forwarding one by one.

🌐 **Website:** https://whispflow-contact-sender.lovable.app
⬇️ **Download:** [Latest release](https://github.com/n1ranj7n/whispflow/releases/latest)

> **Stack:** Electron · Node.js · Express · whatsapp-web.js · vanilla JS

---

## What it does

Whispflow is a cross-platform desktop app (Windows & Mac). You link your own WhatsApp by scanning a QR code once, pick a file and the contacts you want, and it sends the file to each of them — paced like a human, from your own number. Everything runs locally on your machine; no servers in the middle, no accounts to create.

## How it works

1. **Link your WhatsApp** — scan a QR code once to connect the app to your account (just like WhatsApp Web).
2. **Pick a file and contacts** — choose any file and select who to send it to.
3. **Hit send** — Whispflow delivers it to each contact one by one, with a short randomized delay between each.

---

## Design decisions (the interesting part)

This project went through several architectures before landing here. The reasoning matters more than the code:

### Why a desktop app, not a website?
The core engine (`whatsapp-web.js`) drives a real browser session linked to a phone. That session has to live somewhere persistent and per-user. A website can't do this: a browser tab can't hold the session, and hosting it on a server means **one shared session for all visitors** — the first person to scan would be the only "account," and everyone else would be sending as them. A desktop app is the only model where each person runs it locally with **their own** WhatsApp. (I actually deployed a web version first and watched it fail exactly this way — the QR never loads server-side because there's no per-user browser session.)

### Why each user's own number, not the WhatsApp Business API?
The Business API is the right tool for **one company number messaging many people at scale** — it's sanctioned, but needs business verification, pre-approved message templates, and per-message billing. Whispflow is the opposite use case: individuals sending files to their own known contacts. For that, automating each person's own WhatsApp Web session is lighter and needs zero setup. (If the goal were one shared company number at scale, the Business API would be the correct — and only ban-safe — choice. Different problem, different tool.)

### Why pace the sends?
Messages go out with a randomized 4–9 second gap. WhatsApp's anti-spam detection flags bursts of identical messages. Human-paced sending to known contacts stays in safe territory; bursting does not. The pacing isn't cosmetic — it's the main thing protecting the account.

### Packaging notes
Bundling Chromium (which `whatsapp-web.js` needs) into the installer was the trickiest part — the app works in dev but won't show a QR on a clean machine unless Chromium is downloaded into the project and unpacked from the asar archive. The app resolves the bundled Chromium path at runtime and logs it for debugging.

---

## Important: terms of service

Whispflow automates a **personal** WhatsApp account via WhatsApp Web, which is **against WhatsApp's Terms of Service**. For the intended use — sending files to your own known contacts at low volume — the risk is low, and the app is built to stay there (paced sends, your own number, your own contacts). But the risk isn't zero. Use responsibly:

- Only message contacts who know you.
- Keep volumes reasonable — it's a convenience tool, not a mass-marketing blaster.
- Consider a secondary number if a temporary restriction would disrupt you.

This is a personal/learning project, not an official WhatsApp product, and is not affiliated with or endorsed by WhatsApp or Meta.

---

## Running from source (for developers)

Most people should just [download the app](https://github.com/n1ranj7n/whispflow/releases/latest). To run from source:

```bash
npm install
npx puppeteer browsers install chrome   # downloads Chromium into .pcache
npm start                               # launches the Electron app
```

To build installers (build on the target OS — Windows builds on Windows, Mac on Mac):
```bash
npm run build:win    # produces dist/Whispflow-Setup-*.exe
npm run build:mac    # produces dist/Whispflow-*.dmg
```

> **Note:** Windows may show a SmartScreen warning because the app is unsigned. Click **More info → Run anyway**. On Mac, right-click the app → **Open** the first time.

---

## Author

**Niranjan Subash** — CS & Financial Technology student.

Built as a learning project exploring desktop app packaging, browser automation, and the real-world constraints of the WhatsApp platform.