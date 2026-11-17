const fs = require('node:fs/promises');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const theme = path.join(root, 'themes/butterfly-preview');
const output = path.join(root, '.preview-butterfly');
const action = process.argv[2] || 'build';
if (!['build', 'serve'].includes(action)) throw new Error('Use build or serve.');

async function prepare() {
  // Materialize the pinned upstream theme; never edit node_modules or other themes.
  await fs.rm(theme, { recursive: true, force: true });
  await fs.cp(path.join(root, 'node_modules/hexo-theme-butterfly'), theme, { recursive: true });
  await fs.cp(path.join(root, 'preview/butterfly'), theme, { recursive: true });
  const assets = path.join(theme, 'source');
  await fs.mkdir(path.join(assets, 'img'), { recursive: true });
  await fs.copyFile(path.join(root, 'themes/yilia-plus/source/img/Phoenix.png'), path.join(assets, 'img/Phoenix.png'));
  await fs.mkdir(path.join(assets, 'vendor/fontawesome'), { recursive: true });
  for (const dir of ['css', 'webfonts']) {
    await fs.cp(path.join(root, 'node_modules/@fortawesome/fontawesome-free', dir), path.join(assets, 'vendor/fontawesome', dir), { recursive: true });
  }
  await fs.copyFile(path.join(root, 'node_modules/medium-zoom/dist/medium-zoom.min.js'), path.join(assets, 'vendor/medium-zoom.min.js'));
  await fs.cp(path.join(root, 'node_modules/mathjax/es5'), path.join(assets, 'vendor/mathjax'), { recursive: true });
  await fs.mkdir(output, { recursive: true });
  // Keep the preview database separate as well as the generated site.
  const args = ['--config', '_config.yml,_config.butterfly-preview.yml', '--output', output];
  const cli = path.join(root, 'node_modules/hexo-cli/bin/hexo');
  for (const command of ['clean', 'generate', ...(action === 'serve' ? ['server'] : [])]) {
    const serverArgs = command === 'server' ? ['--static', '--ip', '127.0.0.1', '--port', '4187'] : [];
    const result = spawnSync(process.execPath, [cli, command, ...args, ...serverArgs], { cwd: root, stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
  }
}

prepare().catch(error => { console.error(error); process.exitCode = 1; });
