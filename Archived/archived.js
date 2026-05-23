const libraryGrid =
  document.getElementById("libraryGrid");

const chaptersList =
  document.getElementById("chaptersList");

const mangaTitle =
  document.getElementById("mangaTitle");

const readerContainer =
  document.getElementById("readerContainer");

const libraryView =
  document.getElementById("libraryView");

const chaptersView =
  document.getElementById("chaptersView");

const readerView =
  document.getElementById("readerView");

const backBtn =
  document.getElementById("backBtn");

let currentManga = null;

function showView(view) {

  libraryView.classList.add("hidden");
  chaptersView.classList.add("hidden");
  readerView.classList.add("hidden");

  view.classList.remove("hidden");
}

function renderLibrary() {

  libraryGrid.innerHTML = "";

  showView(libraryView);

  backBtn.classList.add("hidden");

  LIBRARY.forEach(manga => {

    const card = document.createElement("button");

    card.className = `
      bg-zinc-900
      hover:bg-zinc-800
      border border-zinc-800
      rounded-xl
      overflow-hidden
      transition
      text-left
    `;

    card.innerHTML = `
      <img
        src="Contents/${manga.title}/cover.jpg"
        class="aspect-[3/4] w-full object-cover"
        onerror="this.style.display='none'"
      >

      <div class="p-3 font-semibold">
        ${manga.title}
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

  chaptersList.innerHTML = "";

  showView(chaptersView);

  backBtn.classList.remove("hidden");

  manga.versions.forEach(version => {

    const btn = document.createElement("button");

    btn.className = `
      bg-zinc-900
      hover:bg-zinc-800
      border border-zinc-800
      rounded-xl
      px-4 py-3
      text-left
      w-full
      mb-2
    `;

    btn.textContent = version.name;

    btn.addEventListener("click", () => {

      openVersion(manga, version);
    });

    chaptersList.appendChild(btn);
  });
}

function openVersion(manga, version) {

  readerContainer.innerHTML = "";

  showView(readerView);

  for (
    let i = 1;
    i <= version.pages;
    i++
  ) {

    const img =
      document.createElement("img");

    img.src = `
      Contents/${
        encodeURIComponent(manga.title)
      }/${
        encodeURIComponent(version.name)
      }/(${i}).jpg
    `.replace(/\n/g, "");

    img.loading = "lazy";

    img.className = `
      w-full
      max-w-5xl
      object-contain
    `;

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

renderLibrary();