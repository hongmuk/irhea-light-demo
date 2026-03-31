const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Helper: load mock data
function loadMock(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'mock', `${name}.json`), 'utf8'));
}

// ── Page Routes ──────────────────────────────────────────

app.get('/', (req, res) => {
  res.render('layout', {
    page: 'dashboard',
    title: 'Dashboard',
    activeNav: 'dashboard'
  });
});

app.get('/recipes', (req, res) => {
  res.render('layout', {
    page: 'recipe-list',
    title: 'Recipes',
    activeNav: 'recipes'
  });
});

app.get('/recipe/:id', (req, res) => {
  res.render('layout', {
    page: 'recipe-detail',
    title: 'Recipe Detail',
    activeNav: 'recipes'
  });
});

app.get('/recipe/:id/edit', (req, res) => {
  res.render('layout', {
    page: 'recipe-edit',
    title: 'Edit Recipe',
    activeNav: 'recipes'
  });
});

app.get('/brewing', (req, res) => {
  res.render('layout', {
    page: 'brewing',
    title: 'Brewing',
    activeNav: 'brewing'
  });
});

app.get('/brewing/complete', (req, res) => {
  res.render('layout', {
    page: 'brewing-complete',
    title: 'Brewing Complete',
    activeNav: 'brewing'
  });
});

app.get('/favorites', (req, res) => {
  res.render('layout', {
    page: 'favorites',
    title: 'Favorites',
    activeNav: 'favorites'
  });
});

app.get('/alarms', (req, res) => {
  res.render('layout', {
    page: 'alarms',
    title: 'Alarms',
    activeNav: 'alarms'
  });
});

app.get('/settings', (req, res) => {
  res.render('layout', {
    page: 'settings',
    title: 'Settings',
    activeNav: 'settings'
  });
});

app.get('/calibration', (req, res) => {
  res.render('layout', {
    page: 'calibration',
    title: 'Calibration',
    activeNav: 'calibration'
  });
});

app.get('/firmware', (req, res) => {
  res.render('layout', {
    page: 'firmware',
    title: 'Firmware',
    activeNav: 'firmware'
  });
});

app.get('/system-info', (req, res) => {
  res.render('layout', {
    page: 'system-info',
    title: 'System Info',
    activeNav: 'system-info'
  });
});

app.get('/usage', (req, res) => {
  res.render('layout', {
    page: 'usage',
    title: 'Usage History',
    activeNav: 'usage'
  });
});

// ── Mock API Endpoints ───────────────────────────────────

app.get('/api/recipes', (req, res) => {
  res.json(loadMock('recipes'));
});

app.get('/api/recipes/:id', (req, res) => {
  const recipes = loadMock('recipes');
  const recipe = recipes.find(r => r.id === parseInt(req.params.id));
  if (recipe) res.json(recipe);
  else res.status(404).json({ error: 'Recipe not found' });
});

app.get('/api/spouts', (req, res) => {
  res.json(loadMock('spouts'));
});

app.get('/api/favorites', (req, res) => {
  res.json(loadMock('favorites'));
});

app.get('/api/alarms', (req, res) => {
  res.json(loadMock('alarms'));
});

app.get('/api/system-info', (req, res) => {
  res.json(loadMock('system-info'));
});

app.get('/api/common-env', (req, res) => {
  res.json(loadMock('common-env'));
});

app.get('/api/usage-info', (req, res) => {
  res.json(loadMock('usage-info'));
});

app.get('/api/brew-defaults', (req, res) => {
  res.json(loadMock('brew-defaults'));
});

app.get('/api/brew-sessions', (req, res) => {
  res.json(loadMock('brew-sessions'));
});

// ── Start Server ─────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`iRHEA-Light Demo running at http://localhost:${PORT}`);
});
