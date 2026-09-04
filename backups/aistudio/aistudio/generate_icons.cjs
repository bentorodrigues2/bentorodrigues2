const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function getSvg(drawType, color = '#3b82f6') {
  if (drawType === 'desligar') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`;
  } else if (drawType === 'logout') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;
  } else if (drawType === 'avancar') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
  } else if (drawType === 'voltar') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
  } else if (drawType === 'pesquisar') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
  } else if (drawType === 'filtrar') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`;
  } else if (drawType === 'editar') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  } else if (drawType === 'eliminar') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
  } else if (drawType === 'seguranca') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  } else if (drawType === 'atualizar') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`;
  } else if (drawType === 'adicionar') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
  } else if (drawType === 'pdf') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#ef4444"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#dc2626"/><text x="12" y="16" font-family="Arial" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">PDF</text></svg>`;
  } else if (drawType === 'excel') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#10b981"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#059669"/><text x="12" y="16" font-family="Arial" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">XLS</text></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/></svg>`;
}

async function processIcons() {
  const icons = [
    { file: 'public/icons/estados-acoes/07-avancar.png', color: '#3b82f6', type: 'avancar' },
    { file: 'public/icons/estados-acoes/08-voltar.png', color: '#64748b', type: 'voltar' },
    { file: 'public/icons/estados-acoes/10-pesquisar.png', color: '#0ea5e9', type: 'pesquisar' },
    { file: 'public/icons/estados-acoes/11-filtrar.png', color: '#8b5cf6', type: 'filtrar' },
    { file: 'public/icons/estados-acoes/13-editar.png', color: '#f59e0b', type: 'editar' },
    { file: 'public/icons/estados-acoes/14-eliminar.png', color: '#ef4444', type: 'eliminar' },
    { file: 'public/icons/estados-acoes/18-seguranca.png', color: '#10b981', type: 'seguranca' },
    { file: 'public/icons/estados-acoes/09-atualizar.png', color: '#10b981', type: 'atualizar' },
    { file: 'public/icons/estados-acoes/12-adicionar.png', color: '#10b981', type: 'adicionar' },
    { file: 'public/icons/estados-acoes/14-pdf.png', color: '#ef4444', type: 'pdf' },
    { file: 'public/icons/estados-acoes/13-excel.png', color: '#10b981', type: 'excel' },
    { file: 'public/icons/marca/18-pdf.png', color: '#ef4444', type: 'pdf' },
    { file: 'public/icons/marca/19-excel.png', color: '#10b981', type: 'excel' },
  ];

  // Process catalog icons in icons.json
  if (fs.existsSync('icons.json')) {
    const raw = fs.readFileSync('icons.json', 'utf8');
    const catalog = JSON.parse(raw);
    for (const category of Object.values(catalog)) {
      if (Array.isArray(category)) {
        for (const item of category) {
          const fileName = item.file.replace('SVG/', '').replace('.svg', '.png');
          // Exclude custom user images
          if (/logout|terminar|desligar|17-desligar|19-terminar/i.test(fileName)) {
            continue;
          }
          icons.push({ file: `public/icons/${fileName}`, color: '#3b82f6', type: item.id });
          icons.push({ file: `public/icons/estados-acoes/${fileName}`, color: '#3b82f6', type: item.id });
        }
      }
    }
  }

  for (const item of icons) {
    if (/logout|terminar|desligar|17-desligar|19-terminar/i.test(item.file)) {
      continue;
    }
    const dir = path.dirname(item.file);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const svgContent = getSvg(item.type, item.color);
    const pngPath = item.file;

    try {
      await sharp(Buffer.from(svgContent))
        .resize(128, 128)
        .png()
        .toFile(pngPath);
    } catch (e) {
      console.error(`Error generating PNG for ${pngPath}:`, e);
    }
  }

  console.log('All icons generated as valid PNGs!');
}

processIcons();
