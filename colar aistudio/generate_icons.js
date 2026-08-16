const fs = require('fs');
const path = require('path');

function generateIcon(filePath, color, drawType) {
  let svgContent = '';
  if (drawType === 'desligar') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`;
  } else if (drawType === 'logout') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;
  } else if (drawType === 'avancar') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
  } else if (drawType === 'voltar') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
  } else if (drawType === 'pesquisar') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
  } else if (drawType === 'filtrar') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`;
  } else if (drawType === 'editar') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  } else if (drawType === 'eliminar') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
  } else if (drawType === 'seguranca') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  } else if (drawType === 'atualizar') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`;
  } else if (drawType === 'adicionar') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
  } else if (drawType === 'pdf') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#ef4444"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#dc2626"/><text x="12" y="16" font-family="Arial" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">PDF</text></svg>`;
  } else if (drawType === 'excel') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#10b981"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#059669"/><text x="12" y="16" font-family="Arial" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">XLS</text></svg>`;
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save SVG content to .svg and also to .png file so both extensions resolve seamlessly
  fs.writeFileSync(filePath, svgContent);
  fs.writeFileSync(filePath.replace('.png', '.svg'), svgContent);
}

const icons = [
  { file: 'public/icons/estados-acoes/17-desligar.png', color: '#ef4444', type: 'desligar' },
  { file: 'public/icons/estados-acoes/19-Terminar sessão.png', color: '#f59e0b', type: 'logout' },
  { file: 'public/icons/estados-acoes/07-avancar.png', color: '#3b82f6', type: 'avancar' },
  { file: 'public/icons/estados-acoes/08-voltar.png', color: '#64748b', type: 'voltar' },
  { file: 'public/icons/estados-acoes/10-pesquisar.png', color: '#0ea5e9', type: 'pesquisar' },
  { file: 'public/icons/estados-acoes/11-filtrar.png', color: '#8b5cf6', type: 'filtrar' },
  { file: 'public/icons/estados-acoes/13-editar.png', color: '#f59e0b', type: 'editar' },
  { file: 'public/icons/estados-acoes/14-eliminar.png', color: '#ef4444', type: 'eliminar' },
  { file: 'public/icons/estados-acoes/18-seguranca.png', color: '#10b981', type: 'seguranca' },
  { file: 'public/icons/estados-acoes/09-atualizar.png', color: '#10b981', type: 'atualizar' },
  { file: 'public/icons/estados-acoes/12-adicionar.png', color: '#10b981', type: 'adicionar' },
  { file: 'public/icons/marca/18-pdf.png', color: '#ef4444', type: 'pdf' },
  { file: 'public/icons/marca/19-excel.png', color: '#10b981', type: 'excel' },
];

icons.forEach(i => generateIcon(i.file, i.color, i.type));
console.log('Icons written successfully!');
