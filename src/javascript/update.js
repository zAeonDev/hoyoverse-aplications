const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
    const updateStatus = document.getElementById("update-status");
    const progressFill = document.getElementById("progress-fill");
    const progressText = document.getElementById("progress-text");

    // Função para animar o progresso suavemente
    function animateProgress(targetPercent) {
        let currentPercent = parseFloat(progressFill.style.width) || 0;

        const interval = setInterval(() => {
            if (currentPercent >= targetPercent) {
                clearInterval(interval);
                return;
            }
            currentPercent += 1; // Incremento suave
            progressFill.style.width = `${currentPercent}%`;
            progressText.innerText = `${currentPercent}%`;
        }, 30); // Velocidade da animação
    }

    // Atualizar a barra de progresso e a porcentagem dentro dela
    ipcRenderer.on("update-progress", (_, percent) => {
        const roundedPercent = Math.round(percent);
        updateStatus.innerText = `Baixando atualização... ${roundedPercent}%`;
        animateProgress(roundedPercent);
    });

    // Quando o download for concluído, exibir mensagem e aguardar 5s antes de reiniciar
    ipcRenderer.on("update-complete", () => {
        updateStatus.innerText = "Download concluído! Reiniciando em breve.";
        animateProgress(100);
    });
});