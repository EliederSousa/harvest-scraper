document.getElementById("input-loadjson").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
        try {
            const parsed = JSON.parse(ev.target.result);

            const state = Array.isArray(parsed) ? parsed : (parsed.sections ? parsed : (parsed.rules || []));
            console.log("STATE: ", state);
            await browser.storage.local.set({ harvestFormState: state });

            alert("Regras carregadas com sucesso! Abra o popup novamente.");
            window.close();
        } catch (err) {
            alert("Arquivo JSON inválido.");
        }
    };
    reader.readAsText(file);
});
