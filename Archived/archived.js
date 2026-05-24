const libraryGrid = document.getElementById("libraryGrid");
const chaptersList = document.getElementById("chaptersList");
const mangaTitle = document.getElementById("mangaTitle");
const mangaDescription = document.getElementById("mangaDescription");
const readerContainer = document.getElementById("readerContainer");
const readerTitle = document.getElementById("readerTitle");
const libraryView = document.getElementById("libraryView");
const chaptersView = document.getElementById("chaptersView");
const readerView = document.getElementById("readerView");
const backBtn = document.getElementById("backBtn");
const backFromReaderBtn = document.getElementById("backFromReaderBtn");

let currentManga = null;

function showView(view) {
  libraryView.classList.add("hidden");
  chaptersView.classList.add("hidden");
  readerView.classList.add("hidden");
  view.classList.remove("hidden");
  window.scrollTo(0, 0);
}

function renderLibrary() {
  libraryGrid.innerHTML = "";
  showView(libraryView);

  LIBRARY.forEach(manga => {
    const card = document.createElement("button");
    card.className = "manga-card cursor-pointer w-full text-left group";

    card.innerHTML = `
      <div class="relative bg-slate-800 rounded-lg overflow-hidden aspect-[3/4]">
        <img
          src="Contents/${encodeURIComponent(manga.title)}/cover.jpg"
          class="w-full h-full object-cover"
          alt="${manga.title}"
          onerror="this.style.display='none'"
        >
        <div class="manga-card-overlay">
          <h3 class="text-white font-bold text-sm leading-tight line-clamp-2">${manga.title}</h3>
          <p class="text-slate-300 text-xs mt-2">${manga.versions?.length || 0} version(s)</p>
        </div>
      </div>
      <div class="mt-3 px-1">
        <h3 class="font-semibold text-sm text-slate-100 line-clamp-2 group-hover:text-sky-400 transition">${manga.title}</h3>
      </div>
    `;

    card.addEventListener("click", () => {
      openManga(manga);
    });

    libraryGrid.appendChild(card);
  });
}

function openManga(manga) {
  currentManga = manga;
  mangaTitle.textContent = manga.title;
  mangaDescription.textContent = `${manga.versions?.length || 0} version(s) available`;
  chaptersList.innerHTML = "";
  showView(chaptersView);

  manga.versions.forEach((version, index) => {
    const btn = document.createElement("button");
    btn.className = `
      group relative p-4 rounded-lg
      bg-slate-900/50 hover:bg-slate-800/70
      border border-slate-800/50 hover:border-sky-500/50
      transition text-left
    `;

    btn.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-slate-100 group-hover:text-sky-400 transition">${version.name}</h3>
          <p class="text-sm text-slate-400 mt-1">${version.pages} pages</p>
        </div>
        <div class="text-slate-400 group-hover:text-sky-400 transition">→</div>
      </div>
    `;

    btn.addEventListener("click", () => {
      openVersion(manga, version);
    });

    chaptersList.appendChild(btn);
  });
}

function openVersion(manga, version) {
  readerContainer.innerHTML = "";
  readerTitle.textContent = `${manga.title} - ${version.name}`;
  showView(readerView);

  const progressBar = document.createElement("div");
  progressBar.className = "fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500 z-40";
  document.body.appendChild(progressBar);

  for (let i = 1; i <= version.pages; i++) {
    const pageWrapper = document.createElement("div");
    pageWrapper.className = "flex flex-col items-center py-6 px-4";

    // Try with leading/trailing spaces first (for Japanese version)
    const img = document.createElement("img");
    img.src = `Contents/${encodeURIComponent(manga.title)}/${encodeURIComponent(version.name)}/( ${i} ).jpg`;
    img.loading = "lazy";
    img.className = "w-full max-w-3xl object-contain rounded-lg shadow-2xl border border-slate-700/50 hover:shadow-sky-500/20 transition-shadow";
    img.alt = `Page ${i}`;
    
    // Fallback: try without spaces if the first doesn't load
    img.onerror = function() {
      img.src = `Contents/${encodeURIComponent(manga.title)}/${encodeURIComponent(version.name)}/(${i}).jpg`;
      img.onerror = function() {
        pageWrapper.style.display = "none";
      };
    };

    // Add page number indicator
    const pageNum = document.createElement("div");
    pageNum.className = "text-sm text-slate-400 mt-3";
    pageNum.textContent = `Page ${i} of ${version.pages}`;

    pageWrapper.appendChild(img);
    pageWrapper.appendChild(pageNum);
    readerContainer.appendChild(pageWrapper);
  }

  setTimeout(() => progressBar.remove(), 1500);
}

backBtn.addEventListener("click", () => {
  if (!readerView.classList.contains("hidden")) {
    openManga(currentManga);
    return;
  }
  renderLibrary();
});

backFromReaderBtn.addEventListener("click", () => {
  openManga(currentManga);
});

// Keyboard navigation in reader
document.addEventListener("keydown", (e) => {
  if (readerView.classList.contains("hidden")) return;
  
  if (e.key === "ArrowUp") {
    window.scrollBy(0, -200);
  } else if (e.key === "ArrowDown") {
    window.scrollBy(0, 200);
  } else if (e.key === "Escape") {
    openManga(currentManga);
  }
});

renderLibrary();