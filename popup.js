let harvest_keyscounter = 1;
let sections = [];          // [{id, name, isLinkSource, linkSourceField, targetSectionId}]
let activeSectionId = 1;
let sectionCounter = 2;

// ------------------------------------------------------------------
// DOM building)
// ------------------------------------------------------------------
function addInput(sectionId) {
    const elem = document.getElementById(`inputs-container-${sectionId}`);
    const id = harvest_keyscounter;
    const newnode = `
        <div style="display: flex; flex-direction: column; gap: 8px">
            <div class="input-row" id="input-row-${id}">
                <div class="input-container">
                    <label class="input-label">Key name</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" class="input-key" />
                        <button class="btn-delrow"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg></button>
                    </div>
                </div>
                <div class="textarea-container">
                    <label class="input-label">Rule</label>
                    <div class="lastrule-container">
                        <textarea class="input-rule"></textarea>
                        <select class="select-rule" name="ruletype">
                            <option value="CSS">CSS Selector</option>
                            <option value="Attribute">Attribute</option>
                            <option value="Index">Index</option>
                            <option value="ActualLink">Actual Link</option>
                            <option value="TextContent">Text Content</option>
                            <option value="Regex">Regex</option>
                            <option value="AutoLink">Auto Link</option>
                        </select>
                        <button class="btn-addrule"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg></button>
                        <button class="btn-autoharvest" id="btn-autoharvest-${id}" style="display:none;">▶</button>
                    </div>
                </div>
            </div>
            <p class="result-area" id="result-area-${id}"><span class="result-counter" id="result-counter-${id}"></span><button class="btn-copyresult" id="btn-copyresult-${id}" title="Copy"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-icon lucide-clipboard"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg></button></p>
        </div>
    `;
    harvest_keyscounter++;
    elem.insertAdjacentHTML('beforeend', newnode);
}

function handleButtonsClick(e) {
    if (e.target.classList.contains("btn-addrule")) {
        const textareaContainer = e.target.closest(".textarea-container");
        const lastRuleContainer = e.target.closest(".lastrule-container") ? e.target.closest(".lastrule-container") : textareaContainer.querySelector(".lastrule-container");

        const newNode = `
                <div class="lastrule-container">
                    <textarea class="input-rule"></textarea>
                    <select class="select-rule" name="ruletype">
                        <option value="CSS">CSS Selector</option>
                        <option value="Attribute">Attribute</option>
                        <option value="Index">Index</option>
                        <option value="ActualLink">Actual Link</option>
                        <option value="TextContent">Text Content</option>
                        <option value="Regex">Regex</option>
                        <option value="AutoLink">Auto Link</option>
                    </select>
                    <button class="btn-addrule"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg></button>
                    <button class="btn-delrule"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </div>
        `;
        lastRuleContainer.insertAdjacentHTML('afterend', newNode);
    } else if (e.target.classList.contains("btn-delrule")) {
        const containerToRemove = e.target.closest(".lastrule-container");
        containerToRemove.remove();
    } else if (e.target.classList.contains("btn-delrow")) {
        const rowWrapper = e.target.closest(".input-row").parentElement;
        rowWrapper.remove();
    }
}

// ------------------------------------------------------------------
// Sections (abas)
// ------------------------------------------------------------------
function createSectionDOM(section) {
    const wrap = document.getElementById('sections-content');

    const config = document.createElement('div');
    config.className = 'section-config';
    config.dataset.sectionId = section.id;
    config.innerHTML = `
        <label><input type="checkbox" class="chk-linksource" /> Process data using field </label>
        <select class="select-linkfield"></select>
        <span class="linksource-label-to">in tab </span>
        <select class="select-targetsection"></select>
        <button class="btn-processlinks" title="Processar todos os links agora (sem paginação)">▶ Process links</button>
        <button class="btn-delsection">Remove Tab</button>
    `;
    wrap.appendChild(config);

    const container = document.createElement('div');
    container.className = 'inputs-container section-inputs';
    container.id = `inputs-container-${section.id}`;
    container.dataset.sectionId = section.id;
    wrap.appendChild(container);
}

function renderSectionsBar() {
    const bar = document.getElementById('sections-bar');
    bar.querySelectorAll('.section-tab').forEach(el => el.remove());
    const addBtn = document.getElementById('btn-addsection');

    sections.forEach(s => {
        const tab = document.createElement('button');
        tab.className = 'section-tab' + (s.id === activeSectionId ? ' active' : '');
        tab.dataset.sectionId = s.id;
        tab.textContent = s.name;
        bar.insertBefore(tab, addBtn);
    });
}

function switchSection(sectionId) {
    activeSectionId = sectionId;

    document.querySelectorAll('.section-inputs').forEach(el => {
        el.style.display = (parseInt(el.dataset.sectionId, 10) === sectionId) ? 'flex' : 'none';
    });
    document.querySelectorAll('.section-config').forEach(el => {
        el.style.display = (parseInt(el.dataset.sectionId, 10) === sectionId) ? 'flex' : 'none';
    });

    renderSectionsBar();
}

function populateSectionDropdowns(sectionId) {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const config = document.querySelector(`.section-config[data-section-id="${sectionId}"]`);
    if (!config) return;

    const fieldSelect = config.querySelector('.select-linkfield');
    const targetSelect = config.querySelector('.select-targetsection');

    const container = document.getElementById(`inputs-container-${sectionId}`);
    const rowNames = Array.from(container.querySelectorAll('.input-key')).map(inp => inp.value.trim()).filter(Boolean);

    const prevField = fieldSelect.value;
    fieldSelect.innerHTML = rowNames.map(n => `<option value="${n}">${n}</option>`).join('');
    if (rowNames.includes(section.linkSourceField)) fieldSelect.value = section.linkSourceField;
    else if (rowNames.includes(prevField)) fieldSelect.value = prevField;

    const prevTarget = targetSelect.value;
    targetSelect.innerHTML = sections.filter(s => s.id !== sectionId)
        .map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    if (sections.some(s => s.id === section.targetSectionId)) targetSelect.value = section.targetSectionId;
    else if (prevTarget) targetSelect.value = prevTarget;

    config.querySelector('.chk-linksource').checked = section.isLinkSource;
    config.classList.toggle('hidden-fields', !section.isLinkSource);
    section.linkSourceField = fieldSelect.value || '';
    section.targetSectionId = targetSelect.value ? parseInt(targetSelect.value, 10) : null;
}

// ------------------------------------------------------------------
// Estado (save/restore)
// ------------------------------------------------------------------
function getSectionRows(sectionId) {
    const container = document.getElementById(`inputs-container-${sectionId}`);
    if (!container) return [];
    return Array.from(container.querySelectorAll('.input-row')).map(row => ({
        name: row.querySelector('.input-key')?.value || '',
        rules: Array.from(row.querySelectorAll('.lastrule-container')).map(c => ({
            rule: c.querySelector('.input-rule')?.value || '',
            type: c.querySelector('.select-rule')?.value || 'CSS'
        }))
    }));
}

function getFullState() {
    return {
        sections: sections.map(s => ({
            id: s.id,
            name: s.name,
            isLinkSource: s.isLinkSource,
            linkSourceField: s.linkSourceField,
            targetSectionId: s.targetSectionId,
            rows: getSectionRows(s.id)
        })),
        activeSectionId
    };
}

function saveFormState() {
    const state = getFullState();
    console.log("harvestFormState: ", JSON.stringify(state));
    browser.storage.local.set({ harvestFormState: state });
}

function restoreFormState(state) {
    document.getElementById('sections-content').innerHTML = '';
    sections = [];
    harvest_keyscounter = 1;

    let sectionsData;
    let restoredActiveId = null;

    if (!state) {
        sectionsData = [{ id: 1, name: 'Listagem', isLinkSource: false, linkSourceField: '', targetSectionId: null, rows: [] }];
    } else if (Array.isArray(state)) {
        sectionsData = [{ id: 1, name: 'Listagem', isLinkSource: false, linkSourceField: '', targetSectionId: null, rows: state }];
    } else {
        sectionsData = state.sections && state.sections.length ? state.sections : [{ id: 1, name: 'Listagem', isLinkSource: false, linkSourceField: '', targetSectionId: null, rows: [] }];
        restoredActiveId = state.activeSectionId;
    }

    sectionCounter = Math.max(1, ...sectionsData.map(s => s.id)) + 1;
    activeSectionId = restoredActiveId && sectionsData.some(s => s.id === restoredActiveId) ? restoredActiveId : sectionsData[0].id;

    sectionsData.forEach(sData => {
        const section = {
            id: sData.id,
            name: sData.name || `Aba ${sData.id}`,
            isLinkSource: !!sData.isLinkSource,
            linkSourceField: sData.linkSourceField || '',
            targetSectionId: sData.targetSectionId || null
        };
        sections.push(section);
        createSectionDOM(section);

        (sData.rows || []).forEach(rowData => {
            addInput(section.id);
            const id = harvest_keyscounter - 1;
            const row = document.getElementById(`input-row-${id}`);
            row.querySelector('.input-key').value = rowData.name;
            rowData.rules.forEach((ruleData, i) => {
                if (i > 0) {
                    const prevContainers = row.querySelectorAll('.lastrule-container');
                    const addBtn = prevContainers[i - 1].querySelector('.btn-addrule');
                    handleButtonsClick({ target: addBtn });
                }
                const containers = row.querySelectorAll('.lastrule-container');
                const container = containers[i];
                container.querySelector('.select-rule').value = ruleData.type;
                container.querySelector('.input-rule').value = ruleData.rule;
            });
        });
    });

    sections.forEach(s => populateSectionDropdowns(s.id));
    switchSection(activeSectionId);
}

// ------------------------------------------------------------------
// Harvest
// ------------------------------------------------------------------

// Roda as regras de UMA aba na página atual e devolve {rowName: [valores]}
// Atualiza a UI de resultado só se for a aba visível no momento.
async function harvestSectionRaw(sectionId) {
    const container = document.getElementById(`inputs-container-${sectionId}`);
    if (!container) return {};
    const rows = Array.from(container.querySelectorAll('.input-row'));

    updateAutoLinkButtonsVisibility(rows);

    const rulesArray = rows.map(row => ({
        name: row.querySelector('.input-key')?.value.trim(),
        rules: Array.from(row.querySelectorAll('.lastrule-container')).map(c => ({
            rule: c.querySelector('.input-rule')?.value || '',
            type: c.querySelector('.select-rule')?.value || 'CSS'
        }))
    }));

    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]?.id) return {};

    let responseArray;
    try {
        responseArray = await browser.tabs.sendMessage(tabs[0].id, { action: "HARVEST", rules: rulesArray });
    } catch (e) {
        console.log("Error: ", e);
        return {};
    }

    const summary = {};
    Object.entries(responseArray.data || {}).forEach(([key, stepRules]) => {
        const allValues = stepRules.length ? (stepRules[stepRules.length - 1].values || []) : [];
        summary[key] = allValues;
    });

    if (sectionId === activeSectionId) {
        rows.forEach(row => {
            const key = row.querySelector('.input-key')?.value.trim();
            const rowId = row.id.replace('input-row-', '');
            const allValues = summary[key] || [];
            const resultCounter = document.querySelector(`#result-counter-${rowId}`);
            const resultArea = document.querySelector(`#result-area-${rowId}`);
            const copyBtn = document.querySelector(`#btn-copyresult-${rowId}`);
            if (resultArea) {
                resultArea.textContent = allValues.map((v, i) => `${i + 1} | ${v}`).join('\n');
                if (resultCounter) resultArea.prepend(resultCounter);
                if (copyBtn) resultArea.appendChild(copyBtn);
            }
            if (resultCounter) resultCounter.textContent = allValues.length;
        });
    }

    return summary;
}

// Faz o harvest de uma aba; se ela estiver configurada como "link source", visita cada
// link achado, harvesta a aba de destino, e salva uma linha combinada por item.
async function harvestSectionWithDetails(sectionId, save, isActiveFn = () => true) {
    const section = sections.find(s => s.id === sectionId);
    const listSummary = await harvestSectionRaw(sectionId);

    if (!section || !section.isLinkSource || !section.targetSectionId || !section.linkSourceField) {
        if (save) {
            const total = await appendToAccumulatedData(listSummary);
            updateAllResultCounter(total);
        }
        return listSummary;
    }

    const links = (listSummary[section.linkSourceField] || []).filter(Boolean);

    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0]?.id;
    const originalUrl = tabs[0]?.url;
    if (!tabId) return listSummary;

    for (const link of links) {
        if (!isActiveFn()) break;

        await navigateAndWait(tabId, link);
        const detailSummary = await harvestSectionWithRetry(section.targetSectionId);

        const combinedRow = {};
        Object.entries(detailSummary).forEach(([k, arr]) => {
            combinedRow[k] = arr[0] !== undefined ? arr[0] : "";
        });

        if (save) {
            const total = await appendSingleRow(combinedRow);
            updateAllResultCounter(total);
        }
    }

    if (originalUrl && isActiveFn()) {
        await navigateAndWait(tabId, originalUrl);
    }

    return listSummary;
}


function harvestPage(save) {
    return harvestSectionWithDetails(activeSectionId, save);
}

// ------------------------------------------------------------------
// Accumulated data
// ------------------------------------------------------------------
function updateAllResultCounter(total) {
    const el = document.querySelector("#allresults-area");
    if (el) el.textContent = `Accumulated: ${total} entries.`;
}

// Zipa múltiplos campos (arrays paralelos) em N linhas — usado quando uma
// aba não tem link source
function appendToAccumulatedData(harvestedData) {
    const keys = Object.keys(harvestedData);
    if (!keys.length) return Promise.resolve(0);

    const maxItems = Math.max(...keys.map(k => harvestedData[k].length));
    const newRows = [];

    for (let i = 0; i < maxItems; i++) {
        const row = {};
        keys.forEach(key => {
            row[key] = harvestedData[key][i] !== undefined ? harvestedData[key][i] : "";
        });
        newRows.push(row);
    }

    return browser.storage.local.get("accumulatedHarvestData").then(result => {
        const currentData = result.accumulatedHarvestData || [];
        const updatedData = [...currentData, ...newRows];

        return browser.storage.local.set({ accumulatedHarvestData: updatedData }).then(() => {
            return updatedData.length;
        });
    });
}

async function appendSingleRow(row) {
    pendingRowsBuffer.push(row);
    await getAccumulatedTotal();
    accumulatedTotalCount++;

    if (pendingRowsBuffer.length < FLUSH_EVERY) {
        return accumulatedTotalCount;
    }

    return flushPendingRows();
}

async function flushPendingRows() {
    if (!pendingRowsBuffer.length) {
        return await getAccumulatedTotal();
    }

    const result = await browser.storage.local.get("accumulatedHarvestData");
    const currentData = result.accumulatedHarvestData || [];
    const updatedData = [...currentData, ...pendingRowsBuffer];
    pendingRowsBuffer = [];

    await browser.storage.local.set({ accumulatedHarvestData: updatedData });
    accumulatedTotalCount = updatedData.length;
    return accumulatedTotalCount;
}

async function downloadCSV() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const domain = tabs[0]?.url ? new URL(tabs[0].url).hostname.replace(/\./g, "_") : '';

    browser.storage.local.get("accumulatedHarvestData").then(result => {
        const data = result.accumulatedHarvestData || [];
        if (!data.length) {
            alert("Nenhum dado acumulado para exportar.");
            return;
        }

        const headers = Object.keys(data[0]);
        const csvLines = [];
        csvLines.push(headers.join(";"));

        data.forEach(row => {
            const line = headers.map(header => {
                let val = (row[header] || "").toString();
                val = val.replace(/\r?\n|\r/g, " ").replace(/"/g, '""');
                return `${val}`;
            }).join(";");
            csvLines.push(line);
        });

        const csvContent = "\uFEFF" + csvLines.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `harvest_export_${domain}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

async function saveRulesAsJSON() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const domain = tabs[0]?.url ? new URL(tabs[0].url).hostname : '';

    const state = { domain, ...getFullState() };
    const jsonContent = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `harvest_rules_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function loadRulesFromJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(e.target.result);
            restoreFormState(parsed);
            saveFormState();
            harvestSectionRaw(activeSectionId);
        } catch (err) {
            alert("Arquivo JSON inválido.");
            console.log("Error: ", err);
        }
    };
    reader.readAsText(file);
}

function clearAccumulatedData() {
    if (confirm("Deseja realmente apagar todos os dados acumulados?")) {
        browser.storage.local.remove("accumulatedHarvestData").then(() => {
            accumulatedTotalCount = 0;
            pendingRowsBuffer = [];
            updateAllResultCounter(0);
        });
    }
}

// ------------------------------------------------------------------
// Auto harvest (paginação)
// ------------------------------------------------------------------
let autoHarvestActive = false;
let autoHarvestRowId = null;
let autoHarvestSectionId = null;
let pendingRowsBuffer = [];
const FLUSH_EVERY = 50;
let accumulatedTotalCount = null; // evita ler o storage a cada item adicionado
let processLinksActive = false;
let processLinksSectionId = null;

async function getAccumulatedTotal() {
    if (accumulatedTotalCount === null) {
        const result = await browser.storage.local.get("accumulatedHarvestData");
        accumulatedTotalCount = (result.accumulatedHarvestData || []).length;
    }
    return accumulatedTotalCount;
}

function rowHasAutoLink(row) {
    return Array.from(row.querySelectorAll('.select-rule')).some(sel => sel.value === 'AutoLink');
}

function updateAutoLinkButtonsVisibility(rows) {
    rows.forEach(row => {
        const btn = row.querySelector('.btn-autoharvest');
        if (!btn) return;
        btn.style.display = rowHasAutoLink(row) ? 'inline-flex' : 'none';
    });
}

function updateAutoHarvestButtonUI() {
    document.querySelectorAll('.btn-autoharvest').forEach(btn => {
        btn.textContent = (autoHarvestActive && btn.id === `btn-autoharvest-${autoHarvestRowId}`) ? "⏹" : "▶";
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Espera até o harvest da seção retornar algo não-vazio, ou desiste após maxAttempts
async function harvestSectionWithRetry(sectionId, maxAttempts = 5, intervalMs = 5000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const summary = await harvestSectionRaw(sectionId);
        const hasContent = Object.values(summary).some(arr => arr.some(v => v));
        if (hasContent) return summary;
        await delay(intervalMs);
    }
    return await harvestSectionRaw(sectionId); // última tentativa, mesmo vazia
}

function navigateAndWait(tabId, url) {
    return new Promise((resolve) => {
        function listener(updatedTabId, changeInfo) {
            if (updatedTabId === tabId && changeInfo.status === "complete") {
                browser.tabs.onUpdated.removeListener(listener);
                resolve();
            }
        }
        browser.tabs.onUpdated.addListener(listener);
        browser.tabs.update(tabId, { url });
    });
}

const AUTO_HARVEST_MAX_PAGES = 10000; // TODO: mover para página de configurações

async function autoHarvestLoop() {
    let pageCount = 0;
    while (autoHarvestActive) {
        if (pageCount >= AUTO_HARVEST_MAX_PAGES) {
            alert(`Limite de segurança atingido (${AUTO_HARVEST_MAX_PAGES} páginas).`);
            stopAutoHarvest();
            break;
        }
        pageCount++;

        const listSummary = await harvestSectionWithDetails(autoHarvestSectionId, true);

        const row = document.getElementById(`input-row-${autoHarvestRowId}`);
        const key = row?.querySelector('.input-key')?.value.trim();
        const href = listSummary?.[key]?.[0];

        if (!href) {
            stopAutoHarvest();
            break;
        }

        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const tabId = tabs[0]?.id;
        if (!tabId) { stopAutoHarvest(); break; }

        await navigateAndWait(tabId, href);
        if (!autoHarvestActive) break;
    }
}

function startAutoHarvest(rowId) {
    const row = document.getElementById(`input-row-${rowId}`);
    const container = row?.closest('.section-inputs');
    if (!container) return;

    autoHarvestActive = true;
    autoHarvestRowId = rowId;
    autoHarvestSectionId = parseInt(container.dataset.sectionId, 10);
    updateAutoHarvestButtonUI();
    autoHarvestLoop();
}

function stopAutoHarvest() {
    autoHarvestActive = false;
    autoHarvestRowId = null;
    autoHarvestSectionId = null;
    updateAutoHarvestButtonUI();
    // Garante que o buffer não fique perdido ao parar o harvest
    flushPendingRows().then(total => updateAllResultCounter(total));
}

function updateProcessLinksButtonUI() {
    document.querySelectorAll('.btn-processlinks').forEach(btn => {
        const config = btn.closest('.section-config');
        const sectionId = parseInt(config.dataset.sectionId, 10);
        btn.textContent = (processLinksActive && sectionId === processLinksSectionId) ? "⏹ Parar" : "▶ Process links";
    });
}

async function startProcessLinks(sectionId) {
    processLinksActive = true;
    processLinksSectionId = sectionId;
    updateProcessLinksButtonUI();

    await harvestSectionWithDetails(sectionId, true, () => processLinksActive);

    processLinksActive = false;
    processLinksSectionId = null;
    updateProcessLinksButtonUI();
    flushPendingRows().then(total => updateAllResultCounter(total));
}

function stopProcessLinks() {
    processLinksActive = false;
    processLinksSectionId = null;
    updateProcessLinksButtonUI();
}

function deleteSection(sectionId) {
    if (sections.length <= 1) {
        alert("Precisa ter pelo menos uma aba.");
        return;
    }
    if (!confirm("Remover esta aba e todas as suas regras?")) return;

    sections.forEach(s => {
        if (s.targetSectionId === sectionId) {
            s.targetSectionId = null;
            s.isLinkSource = false;
        }
    });

    sections = sections.filter(s => s.id !== sectionId);

    document.querySelector(`.section-config[data-section-id="${sectionId}"]`)?.remove();
    document.getElementById(`inputs-container-${sectionId}`)?.remove();

    if (activeSectionId === sectionId) {
        activeSectionId = sections[0].id;
    }

    sections.forEach(s => populateSectionDropdowns(s.id));
    switchSection(activeSectionId);
    saveFormState();
}

// ------------------------------------------------------------------
// Events
// ------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("btn-addinput").addEventListener("click", () => {
        addInput(activeSectionId);
        populateSectionDropdowns(activeSectionId);
        saveFormState();
        harvestSectionRaw(activeSectionId);
    });

    document.getElementById("btn-harvest").addEventListener("click", () => {
        harvestPage(true);
    });

    document.getElementById("btn-addsection").addEventListener("click", () => {
        const id = sectionCounter++;
        const section = { id, name: `Aba ${id}`, isLinkSource: false, linkSourceField: '', targetSectionId: null };
        sections.push(section);
        createSectionDOM(section);
        addInput(id);
        sections.forEach(s => populateSectionDropdowns(s.id));
        switchSection(id);
        harvestSectionRaw(id)
        saveFormState();
    });

    document.getElementById("sections-bar").addEventListener("click", (e) => {
        const tab = e.target.closest('.section-tab');
        if (!tab) return;
        switchSection(parseInt(tab.dataset.sectionId, 10));
        saveFormState();
    });

    let lastTabClick = { id: null, time: 0 };

    document.getElementById("sections-bar").addEventListener("click", (e) => {
        const tab = e.target.closest('.section-tab');
        if (!tab) return;

        const sectionId = parseInt(tab.dataset.sectionId, 10);
        const now = Date.now();

        if (lastTabClick.id === sectionId && (now - lastTabClick.time) < 400) {
            lastTabClick = { id: null, time: 0 };
            const section = sections.find(s => s.id === sectionId);
            const newName = prompt('Nome da aba:', section.name);
            if (newName && newName.trim()) {
                section.name = newName.trim();
                renderSectionsBar();
                sections.forEach(s => populateSectionDropdowns(s.id));
                harvestSectionRaw(activeSectionId);
                saveFormState();
            }
            return;
        }

        lastTabClick = { id: sectionId, time: now };
        switchSection(sectionId);
        harvestSectionRaw(activeSectionId);
        saveFormState();
    });

    document.getElementById("sections-content").addEventListener("click", (e) => {

        const copyBtn = e.target.closest(".btn-copyresult");
        if (copyBtn) {
            const rowId = copyBtn.id.replace('btn-copyresult-', '');
            const resultArea = document.querySelector(`#result-area-${rowId}`);
            const counter = resultArea.querySelector('.result-counter');
            const copyButton = resultArea.querySelector('.btn-copyresult');
            const text = resultArea.textContent
            .replace(counter?.textContent || '', '')
            .trim();
            navigator.clipboard.writeText(text).then(() => {
                copyButton.style.color = 'green';
                setTimeout(() => { copyButton.style.color = ''; }, 1000);
            }).catch(err => {
                console.log("Erro ao copiar: ", err);
                alert("Não foi possível copiar: " + err.message);
            });
            return;
        }

        if (e.target.closest(".result-area")) return;
        const autoBtn = e.target.closest(".btn-autoharvest");

        if (autoBtn) {
            const rowId = autoBtn.id.replace('btn-autoharvest-', '');
            if (autoHarvestActive) {
                stopAutoHarvest();
            } else {
                startAutoHarvest(rowId);
            }
            return;
        }

        const delSectionBtn = e.target.closest(".btn-delsection");
        if (delSectionBtn) {
            const config = delSectionBtn.closest('.section-config');
            deleteSection(parseInt(config.dataset.sectionId, 10));
            return;
        }

        const processLinksBtn = e.target.closest(".btn-processlinks");
        if (processLinksBtn) {
            const config = processLinksBtn.closest('.section-config');
            const sectionId = parseInt(config.dataset.sectionId, 10);

            if (processLinksActive) {
                stopProcessLinks();
            } else {
                startProcessLinks(sectionId);
            }
            return;
        }

        handleButtonsClick(e);
        saveFormState();
        harvestSectionRaw(activeSectionId);
    });

    let harvestDebounce;
    document.getElementById("sections-content").addEventListener("input", (e) => {
        if (e.target.classList.contains("input-key")) {
            const container = e.target.closest('.section-inputs');
            if (container) populateSectionDropdowns(parseInt(container.dataset.sectionId, 10));
        }
        if (e.target.classList.contains("input-rule") || e.target.classList.contains("input-key")) {
            saveFormState();
            clearTimeout(harvestDebounce);
            harvestDebounce = setTimeout(() => harvestSectionRaw(activeSectionId), 200);
        }
    });

    document.getElementById("sections-content").addEventListener("change", (e) => {
        if (e.target.classList.contains("select-rule")) {
            saveFormState();
            harvestSectionRaw(activeSectionId);
            return;
        }
        if (e.target.classList.contains("chk-linksource")) {
            const config = e.target.closest('.section-config');
            const section = sections.find(s => s.id === parseInt(config.dataset.sectionId, 10));
            section.isLinkSource = e.target.checked;
            populateSectionDropdowns(section.id);
            saveFormState();
            return;
        }
        if (e.target.classList.contains("select-linkfield")) {
            const config = e.target.closest('.section-config');
            const section = sections.find(s => s.id === parseInt(config.dataset.sectionId, 10));
            section.linkSourceField = e.target.value;
            saveFormState();
            return;
        }
        if (e.target.classList.contains("select-targetsection")) {
            const config = e.target.closest('.section-config');
            const section = sections.find(s => s.id === parseInt(config.dataset.sectionId, 10));
            section.targetSectionId = parseInt(e.target.value, 10);
            saveFormState();
            return;
        }
    });

    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === "complete" && tab.active && !autoHarvestActive) {
            harvestSectionRaw(activeSectionId);
        }
    });

    browser.storage.local.get("harvestFormState").then(result => {
        restoreFormState(result.harvestFormState);
        harvestSectionRaw(activeSectionId);
    });

    browser.storage.local.get("accumulatedHarvestData").then(result => {
        updateAllResultCounter((result.accumulatedHarvestData || []).length);
    });

    document.getElementById("btn-downloadcsv").addEventListener("click", downloadCSV);
    document.getElementById("btn-cleardata").addEventListener("click", clearAccumulatedData);
    document.getElementById("btn-savejson").addEventListener("click", saveRulesAsJSON);

    document.getElementById("btn-loadjson").addEventListener("click", () => {
        browser.tabs.create({ url: browser.runtime.getURL("loader.html") });
    });
});
