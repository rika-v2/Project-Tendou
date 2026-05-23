// --- Affix Management ---
const attributes = [];
// Attributes 10-340 (Always available)
for (let i = 10; i <= 340; i += 10) {
    const name = attributeNames[i] || `Stat_${i}`;
    attributes.push({ id: i, name: name, type: 'attribute' });
}

const skills = [350, 360, 370, 380].map(id => ({ id, name: `Skill: ${skillNames[id]}`, type: 'skill' }));

// --- UI Setup ---
const trekkerSearch = document.getElementById('trekkerSearch');
const trekkerDropdown = document.getElementById('trekkerDropdown');
const charIdInput = document.getElementById('charId');
const substatContainer = document.getElementById('substatContainer');
const substatContainer2 = document.getElementById('substatContainer2');
const saveBtn = document.getElementById('saveBtn');
const commandOutput = document.getElementById('commandOutput');
const copyBtn = document.getElementById('copyBtn');

const generateSlotHTML = (index) => `
    <div class="substat-row flex gap-2 items-end p-2 bg-slate-800/30 rounded-lg">
        <div class="flex-1">
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Substat ${index}</label>
            <select class="substat-select w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all">
                <option value="">None</option>
            </select>
        </div>
        <div class="w-20">
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Lvl</label>
            <select class="level-select w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all">
                <option value="1">1</option>
            </select>
        </div>
    </div>`;

substatContainer.innerHTML = generateSlotHTML(1) + generateSlotHTML(2);
substatContainer2.innerHTML = generateSlotHTML(3) + generateSlotHTML(4);

function updateLevelDropdown(row) {
    const substatSelect = row.querySelector('.substat-select');
    const levelSelect = row.querySelector('.level-select');
    const selectedOption = substatSelect.options[substatSelect.selectedIndex];
    const type = selectedOption ? selectedOption.dataset.type : null;
    const currentLvl = levelSelect.value;

    let optionsHtml = '';
    if (type === 'attribute') {
        const labels = { 1: 'Green', 2: 'Blue', 3: 'Gold', 4: 'Rainbow' };
        for (let i = 1; i <= 4; i++) optionsHtml += `<option value="${i}">${labels[i]}</option>`;
    } else if (type === 'skill' || type === 'potential') {
        for (let i = 1; i <= 3; i++) optionsHtml += `<option value="${i}">+${i}</option>`;
    } else {
        optionsHtml = `<option value="1">1</option>`;
    }
    levelSelect.innerHTML = optionsHtml;
    levelSelect.value = Array.from(levelSelect.options).some(o => o.value === currentLvl) ? currentLvl : "1";
}

function populateSubstatOptions() {
    const selectedCharId = charIdInput.value;
    const selectedSlot = document.getElementById('slot').value;

    // Generate Potential objects (390-590) dynamically based on selected character
    const potentialsPool = [];
    const charPotentials = trekkerSpecificPotentials[selectedCharId];

    for (let id = 390; id <= 590; id += 10) {
        let rawName = `Potential: Core_${id}`;
        let isGeneric = true;
        
        // Look for character-specific name, then global name
        if (charPotentials && charPotentials[id]) {
            rawName = charPotentials[id];
            isGeneric = false;
        } else if (uniquePotentialNames[id]) {
            rawName = uniquePotentialNames[id];
        }

        // Determine category and rarity
        let tag = "";
        if (id <= 470) tag = isGeneric ? "[G-Main]" : "[Main]";
        else if (id <= 560) tag = isGeneric ? "[G-Supp]" : "[Supp]";
        else tag = isGeneric ? "[G-Ult]" : "[Ult]";

        const isRare = rarePotentialNames.includes(rawName);
        const displayName = isRare ? `✦ ${tag} ${rawName}` : `${tag} ${rawName}`;
        
        potentialsPool.push({ id, name: displayName, type: 'potential', isRare });
    }

    // Rule-based filtering for Slots
    let allAvailable = [];
    if (selectedSlot === "1") {
        allAvailable = [...attributes];
    } else if (selectedSlot === "2") {
        allAvailable = [...attributes, ...skills];
    } else if (selectedSlot === "3") {
        allAvailable = [...attributes, ...potentialsPool];
    } else {
        allAvailable = [...attributes];
    }

    const optionsHtml = `<option value="">None</option>` + 
        allAvailable.map(a => {
            const style = a.isRare ? ' style="color: #fbbf24; font-weight: bold;"' : '';
            return `<option value="${a.id}" data-type="${a.type}"${style}>${a.name}</option>`;
        }).join('');

    document.querySelectorAll('.substat-select').forEach(select => {
        const currentVal = select.value;
        select.innerHTML = optionsHtml;
        // Keep selection if it's still valid (e.g. Attributes/Skills or an allowed potential)
        if ([...allAvailable.map(a => a.id.toString())].includes(currentVal)) {
            select.value = currentVal;
        } else {
            select.value = "";
        }
        updateLevelDropdown(select.closest('.substat-row'));
    });
}

// --- Event Listeners ---
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
        <div class="px-4 py-2 hover:bg-blue-600 cursor-pointer text-sm flex items-center gap-3" 
             onclick="selectTrekker(${t.id}, '${t.name.replace(/'/g, "\\'")}')">
            <img src="assets/trekkers/${t.id}.webp" class="w-8 h-8 rounded-md object-cover bg-slate-800" onerror="this.style.opacity='0'">
            <div class="flex flex-col">
                <span class="text-white font-medium">${t.name}</span>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold text-blue-400">ID: ${t.id}</span>
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
    populateSubstatOptions();
    generateCommand();
};

document.querySelectorAll('.substat-select').forEach(select => {
    select.addEventListener('change', (e) => {
        updateLevelDropdown(e.target.closest('.substat-row'));
        generateCommand();
    });
});

document.querySelectorAll('.level-select').forEach(select => {
    select.addEventListener('change', generateCommand);
});

function generateCommand() {
    const charId = charIdInput.value || '[CharID]';
    const slot = document.getElementById('slot').value;
    const uid = document.getElementById('uid').value || '[UID]';
    
    const subs = [];
    document.querySelectorAll('.substat-row').forEach(row => {
        const baseId = parseInt(row.querySelector('.substat-select').value);
        const level = parseInt(row.querySelector('.level-select').value);
        subs.push(!isNaN(baseId) ? (baseId * 10 + level) : 0);
    });

    // Ensure we always have 4 values for the command
    while(subs.length < 4) subs.push(0);

    commandOutput.innerText = `!emblem ${charId} ${slot} ${subs.join(' ')} @${uid}`;
}

// Global Change Listeners
document.getElementById('slot').addEventListener('change', () => {
    populateSubstatOptions();
    generateCommand();
});
document.getElementById('uid').addEventListener('input', generateCommand);

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(commandOutput.innerText).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'Copied!';
        copyBtn.classList.replace('bg-blue-600', 'bg-green-600');
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.classList.replace('bg-green-600', 'bg-blue-600');
        }, 2000);
    });
});

// --- Persistence Logic ---
saveBtn.addEventListener('click', () => {
    const state = {
        charId: charIdInput.value,
        charName: trekkerSearch.value,
        slot: document.getElementById('slot').value,
        uid: document.getElementById('uid').value,
        substats: Array.from(document.querySelectorAll('.substat-select')).map(s => s.value),
        levels: Array.from(document.querySelectorAll('.level-select')).map(s => s.value)
    };
    
    localStorage.setItem('postHasteEmblemState', JSON.stringify(state));
    
    const originalText = saveBtn.innerText;
    saveBtn.innerText = 'Saved!';
    saveBtn.classList.replace('text-slate-300', 'text-emerald-400');
    setTimeout(() => {
        saveBtn.innerText = originalText;
        saveBtn.classList.replace('text-emerald-400', 'text-slate-300');
    }, 2000);
});

function loadEmblemState() {
    const saved = localStorage.getItem('postHasteEmblemState');
    if (!saved) {
        populateSubstatOptions();
        generateCommand();
        return;
    }

    const state = JSON.parse(saved);
    
    // Load basic info
    charIdInput.value = state.charId || '';
    trekkerSearch.value = state.charName || '';
    document.getElementById('slot').value = state.slot || '1';
    document.getElementById('uid').value = state.uid || '';

    // Options depend on slot/char
    populateSubstatOptions();

    // Load substats
    const subSelects = document.querySelectorAll('.substat-select');
    const lvlSelects = document.querySelectorAll('.level-select');
    
    if (state.substats) {
        state.substats.forEach((val, i) => {
            if (subSelects[i]) {
                subSelects[i].value = val;
                updateLevelDropdown(subSelects[i].closest('.substat-row'));
            }
        });
    }
    
    if (state.levels) {
        state.levels.forEach((val, i) => {
            if (lvlSelects[i]) lvlSelects[i].value = val;
        });
    }

    generateCommand();
}

// Initialize
document.addEventListener('DOMContentLoaded', loadEmblemState);