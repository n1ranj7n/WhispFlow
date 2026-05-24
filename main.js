// Electron main process.
// This turns the web app into a desktop program: it starts the existing
// Express server in the background, then opens a native window pointing at it.
// The employee never sees a terminal or a browser — just an app window.

const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");

// Start the Express server (server.js exports nothing, it just listens on 3000).
// We require it here so it runs inside the Electron process.
let serverStarted = false;
function startServer() {
  if (serverStarted) return;
  try {
    require(path.join(__dirname, "server.js"));
    serverStarted = true;
  } catch (e) {
    dialog.showErrorBox("Startup error", "Could not start the app:\n" + e.message);
  }
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 620,
    title: "Whispflow",
    icon: path.join(__dirname, "assets", process.platform === "win32" ? "icon.ico" : "icon.png"),
    backgroundColor: "#0e1014",
    webPreferences: {
      // The dashboard is local HTML served by our own server; no node access needed in it.
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Give the server a moment to bind to the port, then load the dashboard.
  const tryLoad = (attempt = 0) => {
    mainWindow.loadURL("http://localhost:3000").catch(() => {
      if (attempt < 20) setTimeout(() => tryLoad(attempt + 1), 400);
      else dialog.showErrorBox("Startup error", "The dashboard did not start. Please reopen the app.");
    });
  };
  tryLoad();

  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// On Windows/Linux, quitting all windows quits the app. On Mac, apps usually
// stay open until Cmd+Q — but for a simple tool, quitting on close is clearer.
app.on("window-all-closed", () => {
  app.quit();
});
