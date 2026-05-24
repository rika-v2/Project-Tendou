const libraryGrid = document.getElementById("libraryGrid");
const chaptersList = document.getElementById("chaptersList");
const mangaTitle = document.getElementById("mangaTitle");
const mangaDescription = document.getElementById("mangaDescription");
const libraryView = document.getElementById("libraryView");
const chaptersView = document.getElementById("chaptersView");
const readerView = document.getElementById("readerView");
const backBtn = document.getElementById("backBtn");
const backFromReaderBtn = document.getElementById("backFromReaderBtn");
const pageIndicator = document.getElementById("pageIndicator");
const pageDisplay = document.getElementById("pageDisplay");
const pageInput = document.getElementById("pageInput");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const modeToggle = document.getElementById("modeToggle");
const leftPageImg = document.getElementById("leftPageImg");
const rightPageImg = document.getElementById("rightPageImg");
const leftPageLoading = document.getElementById("leftPageLoading");
const rightPageLoading = document.getElementById("rightPageLoading");
const readerTitle = document.getElementById("readerTitle");

let currentManga = null;
let currentVersion = null;
let currentPage = 1;
let isBookMode = true;
const pages = {};

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

function loadPage(pageNum) {
  if (pageNum < 1 || pageNum > currentVersion.pages) return;
  
  currentPage = pageNum;
  pageInput.value = pageNum;
  pageDisplay.textContent = `Page ${pageNum}`;
  pageIndicator.textContent = `${pageNum}/${currentVersion.pages}`;

  if (isBookMode) {
    // Book mode: show two pages side by side
    loadPageImage(leftPageImg, leftPageLoading, pageNum);
    if (pageNum + 1 <= currentVersion.pages) {
      loadPageImage(rightPageImg, rightPageLoading, pageNum + 1);
    } else {
      rightPageImg.src = "";
      rightPageLoading.style.display = "flex";
    }
  } else {
    // Scroll mode: show single page
    loadPageImage(leftPageImg, leftPageLoading, pageNum);
    rightPageImg.src = "";
  }
}

function loadPageImage(imgElement, loadingElement, pageNum) {
  const cacheKey = `${currentManga.title}-${currentVersion.name}-${pageNum}`;
  
  if (pages[cacheKey]) {
    imgElement.src = pages[cacheKey];
    loadingElement.style.display = "none";
    return;
  }

  imgElement.src = `Contents/${encodeURIComponent(currentManga.title)}/${encodeURIComponent(currentVersion.name)}/( ${pageNum} ).jpg`;
  loadingElement.style.display = "flex";

  imgElement.onload = function() {
    loadingElement.style.display = "none";
    pages[cacheKey] = imgElement.src;
  };

  imgElement.onerror = function() {
    // Fallback: try without spaces
    imgElement.src = `Contents/${encodeURIComponent(currentManga.title)}/${encodeURIComponent(currentVersion.name)}/(${pageNum}).jpg`;
    
    imgElement.onerror = function() {
      loadingElement.textContent = "Page not found";
    };
  };
}

function openVersion(manga, version) {
  currentManga = manga;
  currentVersion = version;
  currentPage = 1;
  readerTitle.textContent = `${manga.title} - ${version.name}`;
  pageInput.max = version.pages;
  showView(readerView);
  loadPage(1);
}

function toggleMode() {
  isBookMode = !isBookMode;
  
  if (isBookMode) {
    document.getElementById("rightPageContainer").parentElement.classList.remove("hidden");
    modeToggle.textContent = "📖 Book Mode";
  } else {
    document.getElementById("rightPageContainer").parentElement.classList.add("hidden");
    modeToggle.textContent = "📜 Scroll Mode";
  }
  
  loadPage(currentPage);
}

// Event Listeners
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

prevBtn.addEventListener("click", () => {
  const newPage = isBookMode ? currentPage - 2 : currentPage - 1;
  loadPage(Math.max(1, newPage));
});

nextBtn.addEventListener("click", () => {
  const newPage = isBookMode ? currentPage + 2 : currentPage + 1;
  loadPage(Math.min(currentVersion.pages, newPage));
});

pageInput.addEventListener("input", (e) => {
  loadPage(parseInt(e.target.value));
});

modeToggle.addEventListener("click", toggleMode);

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (readerView.classList.contains("hidden")) return;
  
  if (e.key === "ArrowLeft") {
    prevBtn.click();
  } else if (e.key === "ArrowRight") {
    nextBtn.click();
  } else if (e.key === "Escape") {
    backFromReaderBtn.click();
  }
});

// Click on image to navigate
leftPageImg.addEventListener("click", (e) => {
  if (e.clientX < leftPageImg.offsetWidth / 2) {
    prevBtn.click();
  } else {
    nextBtn.click();
  }
});

rightPageImg.addEventListener("click", (e) => {
  nextBtn.click();
});

renderLibrary();