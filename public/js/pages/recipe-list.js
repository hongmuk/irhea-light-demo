/* Recipe List Page Logic */
(async function () {
  const recipes = await api('recipes');
  let filteredRecipes = [...recipes];
  let currentFilter = 'all';
  let currentSort = 'name';
  let searchQuery = '';

  function renderGrid() {
    let list = [...recipes];

    // Filter by dripper
    if (currentFilter !== 'all') {
      list = list.filter(r => r.dripper === currentFilter);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.dripper.toLowerCase().includes(q) ||
        r.notes.toLowerCase().includes(q)
      );
    }

    // Sort
    if (currentSort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'recent') {
      list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else if (currentSort === 'water') {
      list.sort((a, b) => b.waterWeight - a.waterWeight);
    }

    const grid = document.getElementById('recipe-grid');
    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-icon">&#9749;</div>
          <div class="empty-text">No recipes found</div>
          <div class="empty-sub">Try adjusting your search or filter</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(r => {
      const totalTime = r.stages.reduce((s, st) => s + st.time, 0);
      return `
        <div class="glass-card recipe-card relative" onclick="location.href=nav('/recipe/${r.id}')">
          ${r.favorite ? '<span class="recipe-fav">&#9733;</span>' : ''}
          <div class="recipe-dripper">${r.dripper}</div>
          <div class="recipe-name">${r.name}</div>
          <p style="font-size:12px;color:var(--text-muted);margin:8px 0 12px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${r.notes}</p>
          <div class="recipe-meta">
            <span>${r.coffeeWeight}g / ${r.waterWeight}ml</span>
            <span>${r.waterTemp}°C</span>
            <span>${formatTime(totalTime)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Filter pills
  document.querySelectorAll('#dripper-filters .filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#dripper-filters .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderGrid();
    });
  });

  // Search
  document.getElementById('recipe-search').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderGrid();
  });

  // Sort
  document.getElementById('recipe-sort').addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderGrid();
  });

  renderGrid();
})();
