// --- Team Selection Logic ---
document.querySelectorAll('.trekker-search').forEach(input => {
    input.addEventListener('focus', function() {
        const slot = this.dataset.slot;
        renderDropdown(trekkers, slot);
        document.getElementById(`dropdown-${slot}`).classList.add('show');
    });

    input.addEventListener('input', function() {
        const slot = this.dataset.slot;
        const val = this.value.toLowerCase();
        const filtered = trekkers.filter(t => 
            t.name.toLowerCase().includes(val) || t.id.toString().includes(val)
        );
        renderDropdown(filtered, slot);
    });
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
        document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
    }
});

function renderDropdown(list, slot) {
    const dropdown = document.getElementById(`dropdown-${slot}`);
    dropdown.innerHTML = list.map(t => {
        const element = trekkerElements[t.id] || 'Unknown';
        const color = elementColors[element] || 'text-slate-400';
        // Escape names with single quotes
        const safeName = t.name.replace(/'/g, "\\'");
        return `
        <div class="px-4 py-3 hover:bg-indigo-600 cursor-pointer text-sm transition-colors border-b border-slate-700 last:border-0 flex justify-between items-center gap-3" 
             onclick="selectTrekkerForSlot(${t.id}, '${safeName}', ${slot})">
            <div class="flex items-center gap-3">
                <img src="assets/trekkers/${t.id}.webp" class="w-8 h-8 rounded-md object-cover bg-slate-800" onerror="this.style.opacity='0'">
                <div class="flex flex-col">
                    <span class="text-white font-medium">${t.name}</span>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold text-indigo-300">ID: ${t.id}</span>
                        <span class="text-[10px] ${t.stars === 5 ? 'text-amber-400' : 'text-purple-400'}">${'★'.repeat(t.stars)}</span>
                    </div>
                </div>
            </div>
            <span class="text-[10px] font-bold uppercase ${color}">${element}</span>
        </div>`;
    }).join('');
}

window.selectTrekkerForSlot = (id, name, slot) => {
    const input = document.querySelector(`.trekker-search[data-slot="${slot}"]`);
    const preview = document.getElementById(`preview-${slot}`);
    const nameDisplay = document.getElementById(`name-${slot}`);

    const element = trekkerElements[id] || 'Unknown';
    const color = elementColors[element] || 'text-slate-400';

    input.value = name;
    input.dataset.selectedId = id;
    
    const rawPots = trekkerSpecificPotentials[id] || {};
    const seenNames = new Set();
    const uniquePots = [];

    // Extract unique potentials, prioritizing standard IDs for consistency in grouping
    Object.entries(rawPots)
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .forEach(([pid, pname]) => {
            if (!seenNames.has(pname)) {
                seenNames.add(pname);
                uniquePots.push({ pid, pname });
            }
        });

    const baseCoreId = `5${id}`;
    const c1Ids = [`${baseCoreId}01`, `${baseCoreId}02`].map(String);
    const c2Ids = [`${baseCoreId}03`, `${baseCoreId}04`].map(String);

    const core1 = uniquePots.filter(p => c1Ids.includes(p.pid));
    const core2 = uniquePots.filter(p => c2Ids.includes(p.pid));
    const pool = uniquePots.filter(p => !c1Ids.includes(p.pid) && !c2Ids.includes(p.pid));

    const rares = pool.filter(p => rarePotentialNames.includes(p.pname));
    const commons = pool.filter(p => !rarePotentialNames.includes(p.pname));

    const getRow = (cores) => {
        const row = [...cores];
        row.push(...rares.splice(0, 2));
        row.push(...commons.splice(0, 5 - row.length));
        return row;
    };

    const row1Items = getRow(core1);
    const row2Items = getRow(core2);
    const others = [...rares, ...commons];

    const renderPotItem = (p) => {
        const isRare = rarePotentialNames.includes(p.pname);
        return `
            <div class="flex flex-col items-center group/pot relative">
                <div class="w-12 h-12 rounded-xl bg-slate-900 border ${isRare ? 'border-amber-500/40 shadow-[0_0_10px_rgba(251,191,36,0.1)]' : 'border-slate-800'} flex items-center justify-center p-1 mb-1 transition-all group-hover/pot:border-indigo-500/50">
                    <img src="assets/trekker-pots/${id}/${p.pid}.webp" class="w-full h-full object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                    <div class="hidden text-[8px] text-slate-600 font-bold">N/A</div>
                </div>
                <div class="text-[8px] leading-[1] text-center ${isRare ? 'text-amber-400 font-bold' : 'text-slate-500'} w-full line-clamp-2 px-0.5">
                    ${p.pname}
                </div>
                <!-- Tooltip on hover -->
                <div class="absolute bottom-full mb-2 hidden group-hover/pot:block z-[100] bg-slate-950 border border-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-2xl">
                    ${p.pname} (${p.pid})
                </div>
            </div>
        `;
    };

    const renderRow = (row) => row.length > 0 ? `<div class="grid grid-cols-5 gap-2 mb-4">${row.map(renderPotItem).join('')}</div>` : '';

    let potsHtml = '';
    potsHtml += renderRow(row1Items);
    potsHtml += renderRow(row2Items);
    if (others.length > 0) {
        potsHtml += `<div class="grid grid-cols-5 gap-2 gap-y-4">${others.map(renderPotItem).join('')}</div>`;
    }

    nameDisplay.innerHTML = `
        <div class="flex flex-col items-center">
            <img src="assets/trekkers/${id}.webp" class="w-32 h-32 rounded-2xl object-cover mb-4 shadow-2xl bg-slate-900 border border-slate-800" onerror="this.style.display='none'">
            <div class="text-[10px] font-black uppercase mb-1 ${color}">${element}</div>
            <div class="text-white font-bold mb-4">${name}</div>
            <div class="w-full space-y-1 text-left">
                <div class="text-[9px] uppercase tracking-[0.2em] text-slate-600 font-black mb-4 text-center border-b border-slate-800 pb-2">Capabilities</div>
                ${potsHtml}
            </div>
        </div>
    `;
    nameDisplay.classList.remove('text-slate-500');
    
    preview.classList.remove('bg-slate-950/50', 'border-dashed', 'border-slate-800');
    preview.classList.add('bg-indigo-500/5', 'border-solid', 'border-indigo-500/30', 'shadow-lg', 'shadow-indigo-500/5');
    
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
};

// --- Persistence Logic ---
document.getElementById('saveTeam').addEventListener('click', () => {
    const team = {};
    for (let slot = 1; slot <= 3; slot++) {
        const input = document.querySelector(`.trekker-search[data-slot="${slot}"]`);
        if (input.dataset.selectedId) {
            team[slot] = {
                id: input.dataset.selectedId,
                name: input.value
            };
        }
    }
    localStorage.setItem('postHasteTeam', JSON.stringify(team));
    
    const btn = document.getElementById('saveTeam');
    const originalText = btn.innerText;
    btn.innerText = 'Composition Saved!';
    btn.classList.replace('bg-indigo-600', 'bg-emerald-600');
    setTimeout(() => {
        btn.innerText = originalText;
        btn.classList.replace('bg-emerald-600', 'bg-indigo-600');
    }, 2000);
});

function loadSavedTeam() {
    const saved = localStorage.getItem('postHasteTeam');
    if (saved) {
        const team = JSON.parse(saved);
        Object.keys(team).forEach(slot => {
            const trekker = team[slot];
            selectTrekkerForSlot(trekker.id, trekker.name, slot);
        });
    }
}

document.getElementById('resetTeam').addEventListener('click', () => {
    localStorage.removeItem('postHasteTeam');
    window.location.reload();
});

document.addEventListener('DOMContentLoaded', loadSavedTeam);