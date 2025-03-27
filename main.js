const { app, BrowserWindow, BrowserView, ipcMain, session, Tray, Menu } = require("electron");
const path = require("node:path");
const { ElectronBlocker } = require("@ghostery/adblocker-electron");
const fetch = require("cross-fetch");
const { autoUpdater } = require("electron-updater");

let mainWindow;
let view = null;
let updateWindow;
let tray = null;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
        }
    });
}

const adjustViewBounds = () => {
    if (mainWindow && !mainWindow.isDestroyed() && view) {
        const { width, height } = mainWindow.getBounds();
        view.setBounds({ x: 0, y: 50, width: width, height: height - 50 });
        view.setAutoResize({ width: true, height: true, horizontal: false, vertical: false });
    }
};

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 615,
        zoomFactor: 1.0,
        icon: path.join(__dirname, "icon.ico"),
        frame: false,
        titleBarStyle: "hidden",
        backgroundColor: "#1E1E1E",
        resizable: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "src", "javascript", "preload.js"),
            contextIsolation: false,
            nodeIntegration: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, "src", "html", "UI.html")).then(() => {
        view = new BrowserView({
            webPreferences: {
                preload: path.join(__dirname, "src", "javascript", "preload.js"),
                contextIsolation: true,
                nodeIntegration: false,
                enableRemoteModule: false,
                sandbox: true,
            },
        });
        mainWindow.setBrowserView(view);
        adjustViewBounds();
        view.webContents.setWindowOpenHandler(({ url }) => {
            view.webContents.loadURL(url);
            return { action: 'deny' };
        });
        view.webContents.loadURL(`file://${path.join(__dirname, "src", "html", "index.html")}`);
        mainWindow.maximize();
        mainWindow.show();
    }).catch(err => {
        console.error("Falha ao carregar conteúdo:", err);
    });

    setupTray();
    setupIpcHandlers();
};

const setupTray = () => {
    tray = new Tray(path.join(__dirname, "icon.ico"));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Abrir",
            click: () => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    if (mainWindow.isMinimized()) mainWindow.restore();
                    mainWindow.show();
                }
            },
        },
        {
            label: "Sair",
            click: () => {
                app.isQuiting = true;
                app.quit();
            },
        },
    ]);

    tray.setToolTip("HoYoverse Aplications");
    tray.setContextMenu(contextMenu);

    mainWindow.on("close", (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    tray.on("click", () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
        }
    });
};

const setupIpcHandlers = () => {
    ipcMain.on("minimize-app", () => {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize();
    });

    ipcMain.on("maximize-app", () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
                mainWindow.webContents.send("update-maximize-icon", "maximize");
            } else {
                mainWindow.maximize();
                mainWindow.webContents.send("update-maximize-icon", "restore");
            }
        }
    });

    ipcMain.on("close-app", () => {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide();
    });

    ipcMain.on("reload-app", () => {
        if (view) {
            view.webContents.reload();
        }
    });

    ipcMain.on("go-home", () => {
        if (view) {
            view.webContents.loadURL(`file://${path.join(__dirname, "src", "html", "index.html")}`);
        }
    });

    ipcMain.on("go-back", () => {
        if (view && view.webContents.navigationHistory.canGoBack()) {
            view.webContents.navigationHistory.goBack();
        }
    });

    ipcMain.on("go-forward", () => {
        if (view && view.webContents.navigationHistory.canGoForward()) {
            view.webContents.navigationHistory.goForward();
        }
    });

    mainWindow.on("maximize", adjustViewBounds);
    mainWindow.on("unmaximize", adjustViewBounds);
    mainWindow.on("resize", adjustViewBounds);
};

const createUpdateWindow = () => {
    updateWindow = new BrowserWindow({
        width: 400,
        height: 250,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    updateWindow.loadFile(path.join(__dirname, "src", "html", "update.html"));
};

const checkForUpdates = () => {
    if (!app.isPackaged) {
        createMainWindow();
        return;
    }

    console.log("🔍 Verificando atualizações...");
    autoUpdater.checkForUpdates().catch(err => {
        console.error("Erro ao verificar atualizações:", err);
        createMainWindow(); // Se falhar, abre a janela principal
    });
};

// Configuração do Auto Updater
autoUpdater.autoDownload = true;
autoUpdater.allowPrerelease = true;
autoUpdater.forceDevUpdateConfig = false;

// Eventos do Auto Updater
autoUpdater.on("update-available", () => {
    console.log("🎉 Nova atualização detectada! Baixando...");
    createUpdateWindow();
});

autoUpdater.on("download-progress", (progress) => {
    console.log(`📥 Progresso do download: ${progress.percent.toFixed(2)}%`);
    if (updateWindow && !updateWindow.isDestroyed()) {
        updateWindow.webContents.send("update-progress", progress.percent);
    }
});

autoUpdater.on("update-downloaded", () => {
    console.log("✅ Download concluído! Aguardando 5 segundos antes de reiniciar...");
    if (updateWindow && !updateWindow.isDestroyed()) {
        updateWindow.webContents.send("update-complete");
    }
    setTimeout(() => {
        console.log("🔄 Fechando tudo e reiniciando...");
        if (updateWindow && !updateWindow.isDestroyed()) updateWindow.close();
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.destroy();
        app.quit();
        autoUpdater.quitAndInstall();
    }, 10000);
});

autoUpdater.on("update-not-available", () => {
    console.log("✅ Nenhuma atualização disponível.");
    createMainWindow();
});

autoUpdater.on("error", (error) => {
    console.error("❌ Erro no auto updater:", error);
    createMainWindow(); // Se der erro, abre a janela principal
});

app.whenReady().then(async () => {
    const blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);
    blocker.enableBlockingInSession(session.defaultSession);

    // Primeiro verifica atualizações
    checkForUpdates();
});

app.commandLine.appendSwitch("ignore-certificate-errors", "true");