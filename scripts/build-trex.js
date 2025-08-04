import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildTrex = () => {
  const zip = new AdmZip();
  
  // Add manifest.xml to root of archive
  const manifestPath = path.join(__dirname, '../public/manifest.xml');
  if (fs.existsSync(manifestPath)) {
    zip.addLocalFile(manifestPath, '', 'manifest.xml');
    console.log('✓ Added manifest.xml');
  } else {
    console.error('❌ manifest.xml not found!');
    process.exit(1);
  }
  
  // Add index.html to root of archive  
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    zip.addLocalFile(indexPath, '', 'index.html');
    console.log('✓ Added index.html');
  } else {
    console.error('❌ dist/index.html not found! Run npm run build first.');
    process.exit(1);
  }
  
  // Add assets folder
  const assetsPath = path.join(__dirname, '../dist/assets');
  if (fs.existsSync(assetsPath)) {
    zip.addLocalFolder(assetsPath, 'assets');
    console.log('✓ Added assets folder');
  } else {
    console.error('❌ dist/assets not found! Run npm run build first.');
    process.exit(1);
  }
  
  // Write the .trex file
  const outputPath = path.join(__dirname, '../extension-fixed.trex');
  zip.writeZip(outputPath);
  console.log(`🎉 Successfully created extension.trex at ${outputPath}`);
  
  // Show file size
  const stats = fs.statSync(outputPath);
  console.log(`📦 File size: ${(stats.size / 1024).toFixed(2)} KB`);
};

buildTrex();