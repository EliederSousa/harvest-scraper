browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "HARVEST") {
    const results = {};

    function parseRegex(rule) {
      const m = rule.match(/^\/(.*)\/([a-z]*)$/i);
      if (m) {
        const flags = m[2].includes('g') ? m[2] : m[2] + 'g';
        return new RegExp(m[1], flags);
      }
      return new RegExp(rule, 'gi');
    }

    message.rules.forEach(({ name, rules }) => {
      // Guarda tanto as strings HTML quanto os elementos DOM selecionados
      let context = { elements: [document.body], strings: [] };
      const steps = [];

      rules.forEach(({ rule, type }) => {
        if (!rule && type !== 'TextContent') return;
        try {
          switch (type) {
            case "CSS": {
              const baseElements = context.elements && context.elements.length 
                ? context.elements 
                : [document.body];
              
              const elements = baseElements.flatMap(el => Array.from(el.querySelectorAll(rule)));
              
              // Sempre extrai o outerHTML completo (objeto + filhos)
              const values = elements.map(el => el.outerHTML);
              
              context = { elements, strings: values };
              steps.push({ type, values });
              break;
            }
            case "Attribute": {
              const attrName = rule.trim();
              let values = [];

              // 1. Se houver elementos DOM no contexto, extrai diretamente deles
              if (context.elements && context.elements.length) {
                values = context.elements
                .map(el => {
                  // resolve automaticamente URLs relativas quando a propriedade existe (href, src)
                  if (attrName in el && (attrName === 'href' || attrName === 'src')) {
                    return el[attrName];
                  }
                  return el.getAttribute(attrName);
                })
                .filter(v => v !== null);
              }
              // 2. Se houver apenas strings HTML no contexto, converte em Nodes para extrair o atributo
              else if (context.strings && context.strings.length) {
                const parser = new DOMParser();
                values = context.strings
                  .map(htmlString => {
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    const el = doc.body.firstElementChild;
                    return el ? el.getAttribute(attrName) : null;
                  })
                  .filter(v => v !== null);
              }

              context = { strings: values, elements: [] };
              steps.push({ type, values });
              break;
            }
            case "Range": {
              const useElements = context.elements && context.elements.length > 0;
              const arr = useElements ? context.elements : (context.strings || []);
              const parallelStrings = (useElements && context.strings && context.strings.length === arr.length) ? context.strings : null;

              const indexSet = new Set();
              rule.split(',').map(s => s.trim()).filter(Boolean).forEach(part => {
                if (part.includes(':')) {
                  // "70:", ":70", ":-10", "70:-10"
                  const [startRaw, endRaw] = part.split(':');
                  const start = startRaw === '' ? 0 : parseInt(startRaw, 10);

                  let end;

                  if (endRaw === '') {
                    end = arr.length - 1;
                  } else {
                    const parsedEnd = parseInt(endRaw, 10);
                    end = parsedEnd < 0 ? arr.length + parsedEnd - 1 : parsedEnd;
                  }
                  for (let i = start; i <= end; i++) {
                    indexSet.add(i);
                  }
                } else {
                  const idx = parseInt(part, 10);

                  if (!isNaN(idx)) {
                    indexSet.add(idx);
                  }
                }
              });

              const sortedIndexes = Array.from(indexSet)
              .map(i => i < 0 ? arr.length + i : i)
              .filter(i => arr[i] !== undefined)
              .sort((a, b) => a - b);

              let pickedElements = [];
              let pickedStrings = [];
              sortedIndexes.forEach(i => {
                if (useElements) {
                  pickedElements.push(arr[i]);
                  pickedStrings.push(parallelStrings ? parallelStrings[i] : arr[i].outerHTML);
                } else {
                  pickedStrings.push(arr[i]);
                }
              });

              context = { elements: pickedElements, strings: pickedStrings };
              steps.push({ type, values: pickedStrings });
              break;
            }
            case "ActualLink": {
              const values = [window.location.href];
              context = { elements: [], strings: values };
              steps.push({ type, values });
              break;
            }
            case "PageTitle": {
              const values = [document.title];
              context = { elements: [], strings: values };
              steps.push({ type, values });
              break;
            }
            case "TextContent": {
              let values = [];

              // 1. Se houver elementos DOM acumulados nos passos anteriores
              if (context.elements && context.elements.length) {
                values = context.elements
                  .map(el => el.textContent.trim())
                  .filter(v => v !== "");
              } 
              // 2. Se houver apenas strings HTML acumuladas
              else if (context.strings && context.strings.length) {
                const parser = new DOMParser();
                values = context.strings
                  .map(htmlString => {
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    return doc.body.textContent.trim();
                  })
                  .filter(v => v !== "");
              }

              context = { strings: values, elements: [] };
              steps.push({ type, values });
              break;
            }
            case "Regex": {
              const texts = context.strings.length 
                ? context.strings 
                : (context.elements || []).map(el => el.outerHTML);

              const re = parseRegex(rule);
              const values = [];

              texts.forEach(text => {
                let match;
                while ((match = re.exec(text)) !== null) {
                  values.push(match[1] !== undefined ? match[1] : match[0]);
                }
              });

              context = { strings: values, elements: [] };
              steps.push({ type, values });
              break;
            }
            case "RegexGlobal": {
              const texts = context.strings.length
              ? context.strings
              : (context.elements || []).map(el => el.outerHTML);

              // Junta todas as entradas em um único texto
              const text = texts.join('\n');

              const re = parseRegex(rule);
              const values = [];

              let match;
              while ((match = re.exec(text)) !== null) {
                values.push(match[1] !== undefined ? match[1] : match[0]);
              }

              context = { strings: values, elements: [] };
              steps.push({ type, values });
              break;
            }
            case "AutoLink": {
              const attrName = rule.trim();
              let values = [];

              if (context.elements && context.elements.length) {
                values = context.elements
                .map(el => {
                  if (attrName in el && (attrName === 'href' || attrName === 'src')) {
                    return el[attrName];
                  }
                  return el.getAttribute(attrName);
                })
                .filter(v => v !== null);
              } else if (context.strings && context.strings.length) {
                const parser = new DOMParser();
                values = context.strings
                .map(htmlString => {
                  const doc = parser.parseFromString(htmlString, 'text/html');
                  const el = doc.body.firstElementChild;
                  return el ? el.getAttribute(attrName) : null;
                })
                .filter(v => v !== null);
              }

              context = { strings: values, elements: [] };
              steps.push({ type, values });
              break;
            }
          }
        } catch (e) {
          steps.push({ type, error: `Erro ao avaliar a regra: ${e.message}` });
        }
      });

      results[name] = steps;
    });

    console.log(JSON.stringify(results, null, 2));

    sendResponse({ data: results });
  }
});


// ---------------- Element picker (estilo inspetor do Firefox) ----------------
(function () {
  let active = false, box, label, styleEl, current = null;
  const BLOCKED = ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'dblclick', 'contextmenu'];

  const isUnique = (sel, el) => {
    try { const n = document.querySelectorAll(sel); return n.length === 1 && n[0] === el; }
    catch { return false; }
  };

  function buildSelector(el) {
    const parts = [];
    let cur = el;
    while (cur && cur.nodeType === 1 && cur !== document.documentElement) {
      let part = cur.tagName.toLowerCase();
      if (cur.id) {
        part = '#' + CSS.escape(cur.id);
      } else {
        part += Array.from(cur.classList).slice(0, 3).map(c => '.' + CSS.escape(c)).join('');
        const parent = cur.parentElement;
        if (parent && Array.from(parent.children).filter(s => s.matches(part)).length > 1) {
          part += `:nth-child(${Array.from(parent.children).indexOf(cur) + 1})`;
        }
      }
      parts.unshift(part);
      const sel = parts.join(' > ');
      if (isUnique(sel, el)) return sel;
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  }

  function place(el) {
    if (!el || !box) return;
    const r = el.getBoundingClientRect();
    Object.assign(box.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    label.textContent = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
    Array.from(el.classList).slice(0, 2).map(c => '.' + c).join('') +
    `  ${Math.round(r.width)}×${Math.round(r.height)}`;
    label.style.top = (r.top > 24 ? '-22px' : (r.height + 2) + 'px');
  }

  const onOver = (e) => { current = e.target; place(current); };
  const onScroll = () => place(current);
  const block = (e) => { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); };

  function onClick(e) {
    block(e);
    const selector = buildSelector(e.target);
    stop();
    browser.runtime.sendMessage({ action: 'PICKED', selector });
  }

  function onKey(e) {
    if (e.key !== 'Escape') return;
    block(e);
    stop();
    browser.runtime.sendMessage({ action: 'PICK_CANCEL' });
  }

  function start() {
    if (active) return;
    active = true;

    styleEl = document.createElement('style');
    styleEl.textContent = '* { cursor: crosshair !important; }';
    document.documentElement.appendChild(styleEl);

    box = document.createElement('div');
    box.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;box-sizing:border-box;' +
    'border:2px solid #0a84ff;background:rgba(10,132,255,.25);';
    label = document.createElement('div');
    label.style.cssText = 'position:absolute;left:-2px;white-space:nowrap;font:11px monospace;' +
    'background:#1c1c1e;color:#fff;padding:2px 6px;border-radius:3px;';
    box.appendChild(label);
    document.documentElement.appendChild(box);

    document.addEventListener('mouseover', onOver, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    BLOCKED.forEach(t => document.addEventListener(t, block, true));
  }

  function stop() {
    if (!active) return;
    active = false;
    current = null;
    document.removeEventListener('mouseover', onOver, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', onScroll);
    BLOCKED.forEach(t => document.removeEventListener(t, block, true));
    box?.remove(); styleEl?.remove();
    box = label = styleEl = null;
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'START_PICK') start();
    else if (message.action === 'STOP_PICK') stop();
  });
})();
