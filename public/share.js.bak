function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(isoString) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

async function copyShareLink() {
  await navigator.clipboard.writeText(window.location.href);
}

function previewMarkup(file, textContent = "") {
  if (file.previewType === "pdf") {
    return `<iframe title="${escapeHtml(file.title)}" src="${escapeHtml(file.viewUrl)}"></iframe>`;
  }
  if (file.previewType === "image") {
    return `<img alt="${escapeHtml(file.title)}" src="${escapeHtml(file.viewUrl)}" />`;
  }
  if (file.previewType === "text") {
    return `<pre>${escapeHtml(textContent)}</pre>`;
  }
  return `<div class="preview-placeholder"><p>Questo formato non ha anteprima integrata. Il download resta disponibile qui sopra.</p></div>`;
}

async function init() {
  const fileId = window.location.pathname.split("/").pop();
  const card = document.querySelector("#share-card");
  const errorCard = document.querySelector("#share-error");

  try {
    const response = await fetch(`/api/files/${fileId}`);
    if (!response.ok) {
      throw new Error("File non trovato");
    }
    const file = await response.json();

    let textContent = "";
    if (file.previewType === "text") {
      const textResponse = await fetch(file.viewUrl);
      textContent = await textResponse.text();
    }

    document.title = `${file.title} · Drive Materie`;
    document.querySelector("#share-subject").textContent = file.subjectName;
    document.querySelector("#share-subject").style.background = `${file.subjectColor}18`;
    document.querySelector("#share-subject").style.color = file.subjectColor;
    document.querySelector("#share-title").textContent = file.title;
    document.querySelector("#share-description").textContent = file.description || "Nessuna descrizione aggiunta.";
    document.querySelector("#share-name").textContent = file.originalName;
    document.querySelector("#share-size").textContent = file.sizeLabel;
    document.querySelector("#share-date").textContent = formatDate(file.uploadedAt);
    document.querySelector("#share-download-count").textContent = String(file.downloadCount);
    document.querySelector("#share-download").href = file.downloadUrl;
    document.querySelector("#share-preview").innerHTML = previewMarkup(file, textContent);
    document.querySelector("#share-copy").addEventListener("click", async () => {
      await copyShareLink();
      const button = document.querySelector("#share-copy");
      const previous = button.textContent;
      button.textContent = "Link copiato";
      setTimeout(() => {
        button.textContent = previous;
      }, 1800);
    });

    card.classList.remove("hidden");
  } catch (error) {
    console.error(error);
    errorCard.classList.remove("hidden");
  }
}

init();
