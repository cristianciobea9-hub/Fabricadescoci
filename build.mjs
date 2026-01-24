import fs from 'fs-extra';
import fg from 'fast-glob';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { minify as terserMinify } from 'terser';
import { minify as htmlMinify } from 'html-minifier-terser';
import CleanCSS from 'clean-css';

const exec = promisify(execFile);
const root = process.cwd();
const dist = path.join(root, 'dist');

async function clean() {
  await fs.remove(dist);
}

async function copyStatic() {
  const entries = await fg(
    [
      '**/*',
      '!node_modules/**',
      '!dist/**',
      '!.git/**',
      '!build.py',
      '!build.mjs',
      '!package.json',
      '!package-lock.json',
      '!README.md',
      '!README-deploy.md',
      '!deploy_*.zip'
    ],
    { dot: true, cwd: root }
  );
  for (const rel of entries) {
    const src = path.join(root, rel);
    const dst = path.join(dist, rel);
    const stats = await fs.stat(src);
    if (stats.isDirectory()) continue;
    await fs.ensureDir(path.dirname(dst));
    await fs.copy(src, dst);
  }
}

async function minifyCss() {
  const files = await fg(['dist/**/*.css'], { dot: true, cwd: root });
  const cleaner = new CleanCSS({});
  for (const file of files) {
    const full = path.join(root, file);
    const src = await fs.readFile(full, 'utf8');
    const out = cleaner.minify(src);
    if (out.errors.length) {
      throw new Error(out.errors.join('\n'));
    }
    await fs.writeFile(full, out.styles, 'utf8');
  }
}

async function minifyJs() {
  const files = await fg(['dist/**/*.js'], { dot: true, cwd: root });
  for (const file of files) {
    const full = path.join(root, file);
    const src = await fs.readFile(full, 'utf8');
    const out = await terserMinify(src, { format: { comments: false } });
    if (out.error) throw out.error;
    await fs.writeFile(full, out.code, 'utf8');
  }
}

async function minifyHtml() {
  const files = await fg(['dist/**/*.html'], { dot: true, cwd: root });
  for (const file of files) {
    const full = path.join(root, file);
    const src = await fs.readFile(full, 'utf8');
    const out = await htmlMinify(src, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: false,
      minifyCSS: true,
      minifyJS: true
    });
    await fs.writeFile(full, out, 'utf8');
  }
}

async function verify() {
  const htmlFiles = await fg(['dist/*.html'], { cwd: root });
  const missing = [];
  for (const rel of htmlFiles) {
    const full = path.join(root, rel);
    const text = await fs.readFile(full, 'utf8');
    const refs = [
      ...text.matchAll(/href="([^"]+\.css)"/g),
      ...text.matchAll(/src="([^"]+\.js)"/g)
    ];
    for (const match of refs) {
      const ref = match[1];
      const target = path.resolve(path.dirname(full), ref);
      if (!fs.existsSync(target)) {
        missing.push(`${rel}: ${ref}`);
      }
    }
  }
  if (!fs.existsSync(path.join(dist, 'api'))) {
    missing.push('dist/api/');
  }
  if (missing.length) {
    throw new Error('Missing assets after build:\n' + missing.join('\n'));
  }
}

async function build() {
  await clean();
  await copyStatic();
  await minifyCss();
  await minifyJs();
  await minifyHtml();
  await verify();
  console.log('dist ready');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
