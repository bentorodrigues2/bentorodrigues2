const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function createIcon(filePath, svgContent) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write SVG file
  const svgPath = filePath.replace('.png', '.svg');
  fs.writeFileSync(svgPath, svgContent);

  // Convert SVG to real PNG binary
  const buffer = Buffer.from(svgContent);
  await sharp(buffer, { density: 300 })
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(filePath);

  console.log(`Generated PNG: ${filePath}`);
}

async function main() {
  const icons = [
    {
      file: 'public/icons/estados-acoes/17-desligar.png',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`
    },
    {
      file: 'public/icons/estados-acoes/19-Terminar sessão.png',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`
    },
    {
      file: 'public/icons/estados-acoes/07-avancar.png',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`
    },
    {
      file: 'public/icons/estados-acoes/08-voltar.png',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`
    },
    {
      file: 'public/icons/estados-acoes/10-pesquisar.png',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
    },
    {
      file: 'public/icons/estados-acoes/11-filtrar.png',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`
    },
    {
      file: 'public/icons/estados-acoes/13-editar.png',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`
    },
    {
      file: 'public/icons/estados-acoes/14-eliminar.png',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`
    },
    {
      file: 'public/icons/estados-acoes/18-seguranca.png',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
    },
    {
      file: 'public/icons/estados-acoes/09-atualizar.png',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`
    },
    {
      file: 'public/icons/estados-acoes/12-adicionar.png',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`
    },
    {
      file: 'public/icons/marca/18-pdf.png',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#dc2626"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#b91c1c"/><text x="12" y="16" font-family="system-ui, sans-serif" font-size="7" font-weight="900" fill="#ffffff" text-anchor="middle">PDF</text></svg>`
    },
    {
      file: 'public/icons/marca/19-excel.png',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#059669"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#047857"/><text x="12" y="16" font-family="system-ui, sans-serif" font-size="7" font-weight="900" fill="#ffffff" text-anchor="middle">XLS</text></svg>`
    }
  ];

  for (const item of icons) {
    await createIcon(item.file, item.svg);
  }

  // Copy public/icons to dist/icons if dist exists or create dist/icons
  const distIconsDir = path.join(__dirname, 'dist', 'icons');
  fs.mkdirSync(distIconsDir, { recursive: true });
  fs.cpSync(path.join(__dirname, 'public', 'icons'), distIconsDir, { recursive: true });
  console.log('Copied public/icons to dist/icons successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
