const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 [OrbitLens] Building Next.js Frontend from repository root...');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');

try {
  // 1. Install frontend dependencies
  console.log('📦 Installing frontend dependencies...');
  execSync('npm install --prefer-offline --no-audit', { cwd: frontendDir, stdio: 'inherit' });

  // 2. Build Next.js
  console.log('⚡ Running Next.js production build...');
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

  // 3. Sync .next build directory to root for Vercel
  console.log('📂 Syncing .next build output to repository root...');
  const srcNext = path.join(frontendDir, '.next');
  const destNext = path.join(rootDir, '.next');
  if (fs.existsSync(destNext)) {
    fs.rmSync(destNext, { recursive: true, force: true });
  }
  fs.cpSync(srcNext, destNext, { recursive: true });

  // 4. Sync public folder to root public if present
  const srcPublic = path.join(frontendDir, 'public');
  const destPublic = path.join(rootDir, 'public');
  if (fs.existsSync(srcPublic)) {
    console.log('🖼️ Syncing public assets to repository root...');
    if (fs.existsSync(destPublic)) {
      fs.rmSync(destPublic, { recursive: true, force: true });
    }
    fs.cpSync(srcPublic, destPublic, { recursive: true });
  }

  console.log('✅ [OrbitLens] Frontend build completed successfully and output synced to root .next!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
