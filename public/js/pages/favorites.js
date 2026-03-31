/* Favorites Page Logic */
(async function () {
  const [favorites, recipes] = await Promise.all([
    api('favorites'),
    api('recipes')
  ]);

  let currentSpout = '1';

  function renderFavorites() {
    const key = `spout${currentSpout}`;
    const favIds = favorites[key] || [];
    const grid = document.getElementById('fav-grid');

    if (favIds.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-icon">&#9733;</div>
          <div class="empty-text">No favorites for Spout ${currentSpout}</div>
          <div class="empty-sub">Add recipes to favorites from the recipe detail page</div>
        </div>
      `;
      return;
    }

    const favRecipes = favIds.map(id => recipes.find(r => r.id === id)).filter(Boolean);
    grid.innerHTML = favRecipes.map(r => {
      const totalTime = r.stages.reduce((s, st) => s + st.time, 0);
      return `
        <div class="glass-card recipe-card relative" onclick="location.href=nav('/recipe/${r.id}')">
          <span class="recipe-fav">&#9733;</span>
          <div class="recipe-dripper">${r.dripper}</div>
          <div class="recipe-name">${r.name}</div>
          <p style="font-size:12px;color:var(--text-muted);margin:8px 0 12px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${r.notes}</p>
          <div class="recipe-meta">
            <span>${r.coffeeWeight}g / ${r.waterWeight}ml</span>
            <span>${r.waterTemp}°C</span>
            <span>${formatTime(totalTime)}</span>
          </div>
          <div style="margin-top:12px;">
            <button class="btn btn-primary btn-sm w-full" onclick="event.stopPropagation();location.href=nav('/brewing?recipe=${r.id}')">&#9654; Brew on Spout ${currentSpout}</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Tabs
  document.querySelectorAll('#fav-tabs .tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#fav-tabs .tab-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSpout = tab.dataset.spout;
      renderFavorites();
    });
  });

  renderFavorites();
})();
