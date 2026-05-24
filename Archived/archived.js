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

  for (let i = 1; i <= version.pages; i++) {
    const img = document.createElement("img");
    img.src = `Contents/${encodeURIComponent(manga.title)}/${encodeURIComponent(version.name)}/(${i}).jpg`;
    img.loading = "lazy";
    img.className = "w-full max-w-4xl object-contain rounded-lg";
    img.alt = `Page ${i}`;
    readerContainer.appendChild(img);
  }
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

renderLibrary();