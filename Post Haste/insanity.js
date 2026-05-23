// --- UI Setup ---
const trekkerSearch = document.getElementById('trekkerSearch');
const trekkerDropdown = document.getElementById('trekkerDropdown');
const charIdInput = document.getElementById('charId');
const uidInput = document.getElementById('uid');
const generateBtn = document.getElementById('generateBtn');
const commandOutput = document.getElementById('commandOutput');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const copyBtn = document.getElementById('copyBtn');

// --- Trekker Search Logic (Shared Logic Copy) ---
trekkerSearch.addEventListener('focus', () => {
    renderTrekkerDropdown(trekkers);
    trekkerDropdown.classList.add('show');
});

trekkerSearch.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = trekkers.filter(t => t.name.toLowerCase().includes(val) || t.id.toString().includes(val));
    renderTrekkerDropdown(filtered);
});

document.addEventListener('click', (e) => {
    if (!trekkerSearch.contains(e.target) && !trekkerDropdown.contains(e.target)) {
        trekkerDropdown.classList.remove('show');
    }
});

function renderTrekkerDropdown(list) {
    trekkerDropdown.innerHTML = list.map(t => `
        <div class="px-4 py-2 hover:bg-red-600 cursor-pointer text-sm flex items-center gap-3" 
             onclick="selectTrekker(${t.id}, '${t.name.replace(/'/g, "\\'")}')">
            <img src="assets/trekkers/${t.id}.webp" class="w-8 h-8 rounded-md object-cover bg-slate-800" onerror="this.style.opacity='0'">
            <div class="flex flex-col">
                <span class="text-white font-medium">${t.name}</span>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold text-red-400">ID: ${t.id}</span>
                    <span class="text-[10px] ${t.stars === 5 ? 'text-amber-400' : 'text-purple-400'}">${'★'.repeat(t.stars)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

window.selectTrekker = (id, name) => {
    charIdInput.value = id;
    trekkerSearch.value = name;
    trekkerDropdown.classList.remove('show');
};

// --- Bulk Generation Logic ---
generateBtn.addEventListener('click', () => {
    const charId = charIdInput.value;
    const uid = uidInput.value.trim();

    if (!charId || !uid) {
        alert("Please select a Trekker and enter a Target UID.");
        return;
    }

    const potIds = [];
    // Loop from 390 to 580, appending Lv 3 suffix to match provided setup
    for (let id = 390; id <= 580; id += 10) {
        potIds.push(id * 10 + 3);
    }

    const commands = [];

    // Group potential IDs into chunks of 4
    for (let i = 0; i < potIds.length; i += 4) {
        const group = potIds.slice(i, i + 4);
        
        // Pad with 0 if group is less than 4
        while (group.length < 4) {
            group.push(0);
        }

        commands.push(`!emblem ${charId} 3 ${group.join(' ')} @${uid}`);
    }

    commandOutput.innerText = commands.join('\n');
});

// --- Copy All Logic ---
copyBtn.addEventListener('click', () => {
    const content = commandOutput.innerText;
    if (content.includes("Select a Trekker")) return;

    navigator.clipboard.writeText(content).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'Copied All!';
        copyBtn.style.backgroundColor = '#166534'; // emerald-800
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.backgroundColor = '';
        }, 2000);
    });
});