const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
const approved = path.join(root, 'src/assets/projects/approved')
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, 'photo-catalog.json'), 'utf8'))
const allowed = new Set(fs.readdirSync(approved).map(name => name.replace(/\.webp$/, '')))
const photo = name => {
  assert(allowed.has(name), `Unapproved or missing image: ${name}`)
  return name
}
const cache = {}
function load(name) {
  if (cache[name]) return cache[name]
  const code = ts.transpileModule(fs.readFileSync(path.join(root, 'src/data', name + '.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText
  const exports = {}
  cache[name] = exports
  vm.runInNewContext(code, { exports, require: id => id === './photos' ? { photo } : load(id.replace('./', '')) })
  return exports
}
const { projectPhotos } = load('photoLibrary')
const { projects, featuredProjects, hasBeforeAfter, stills, photographyStories, ascotHeroFrames } = load('projects')
assert.equal(projects.length, 9)
assert.equal(featuredProjects.length, 5)
assert.equal(catalog.length, 81)
const seen = new Set()
for (const project of projects) {
  assert.equal(project.placeholder, false)
  assert.equal(hasBeforeAfter(project), false, `${project.slug} has an unverified before/after`)
  const photos = [project.hero, ...project.gallery]
  assert.equal(photos.length, projectPhotos[project.slug].length)
  assert.equal(photos.length, catalog.filter(row => row.folder.toLowerCase().replaceAll(' ', '-') === project.slug).length)
  assert.equal(new Set(photos.map(p => p.src)).size, photos.length)
  for (const slot of photos) {
    photo(slot.src)
    assert(slot.alt && !/placeholder/i.test(slot.alt))
    seen.add(slot.src)
  }
}
assert.deepEqual([...seen].sort(), catalog.map(row => row.id).sort())
function checkSlots(value) {
  if (!value || typeof value !== 'object') return
  if ('src' in value) photo(value.src)
  else Object.values(value).forEach(checkSlots)
}
checkSlots(stills); checkSlots(photographyStories); checkSlots(ascotHeroFrames)
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)])
}
for (const file of walk(path.join(root, 'src')).filter(p => /\.tsx?$/.test(p))) {
  const text = fs.readFileSync(file, 'utf8')
  for (const match of text.matchAll(/(?:photo|img)\(['"]([^'"]+)['"]/g)) photo(match[1])
}
const assets = fs.readdirSync(path.join(root, 'dist/assets'))
assert(!assets.some(name => /placeholder/i.test(name)), 'Placeholder project image emitted')
const jpegAssets = assets.filter(name => /\.jpe?g$/i.test(name))
assert.equal(jpegAssets.length, 1, 'Only the approved Windsor closing JPEG should be emitted')
assert(/^windsor-pause-[\w-]+\.jpg$/.test(jpegAssets[0]), 'Unexpected legacy project JPEG emitted')
for (const id of allowed) assert(assets.some(name => name.startsWith(id + '-') && name.endsWith('.webp')), `Missing built photo: ${id}`)
console.log('PASS: nine projects; all 81 approved photos; five complete featured galleries; all references resolve; approved Windsor closing JPEG; no before placeholders or legacy images.')
