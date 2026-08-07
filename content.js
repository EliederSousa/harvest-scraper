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
        if (!rule) return;
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
                  .map(el => el.getAttribute(attrName))
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
            case "Index": {
              const idx = parseInt(rule.trim(), 10);
              let arr = (context.elements && context.elements.length) ? context.elements : (context.strings || []);
              const realIndex = idx < 0 ? arr.length + idx : idx;
              const picked = arr[realIndex] !== undefined ? [arr[realIndex]] : [];

              if (context.elements && context.elements.length) {
                context = { elements: picked, strings: [] };
              } else {
                context = { elements: [], strings: picked };
              }
              steps.push({ type, values: picked });
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
            case "AutoLink": {
              const attrName = rule.trim();
              let values = [];

              if (context.elements && context.elements.length) {
                values = context.elements
                .map(el => el.getAttribute(attrName))
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
