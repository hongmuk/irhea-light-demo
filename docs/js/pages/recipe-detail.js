/* Recipe Detail Page Logic */
(async function () {
  const id = pathSegment(2);
  const recipe = await api(`recipes/${id}`);
  const defaults = await api('brew-defaults');

  // Header
  document.getElementById('recipe-name').textContent = recipe.name;
  document.getElementById('recipe-dripper').textContent = recipe.dripper;
  document.getElementById('edit-link').href = nav(`/recipe/${id}/edit`);

  // Brew button
  document.getElementById('brew-btn').addEventListener('click', () => {
    location.href = nav(`/brewing?recipe=${id}`);
  });

  // Favorite toggle
  const favBtn = document.getElementById('fav-toggle');
  let isFav = recipe.favorite;
  function updateFav() {
    favBtn.innerHTML = isFav ? '&#9733;' : '&#9734;';
    favBtn.style.color = isFav ? 'var(--accent-gold)' : 'var(--text-muted)';
  }
  updateFav();
  favBtn.addEventListener('click', () => {
    isFav = !isFav;
    updateFav();
    Toast.show(isFav ? 'Added to favorites' : 'Removed from favorites', isFav ? 'success' : 'info');
  });

  // Parameters
  const totalTime = recipe.stages.reduce((s, st) => s + st.time, 0);
  const totalWater = recipe.stages.reduce((s, st) => s + st.waterAmount, 0);
  document.getElementById('recipe-params').innerHTML = `
    <div class="info-cell"><div class="info-label">Coffee</div><div class="info-value">${recipe.coffeeWeight}g</div></div>
    <div class="info-cell"><div class="info-label">Water</div><div class="info-value">${recipe.waterWeight}ml</div></div>
    <div class="info-cell"><div class="info-label">Ratio</div><div class="info-value">${recipe.ratio}</div></div>
    <div class="info-cell"><div class="info-label">Temperature</div><div class="info-value">${recipe.waterTemp}°C</div></div>
    <div class="info-cell"><div class="info-label">Grind Size</div><div class="info-value">${recipe.grindSize} clicks</div></div>
    <div class="info-cell"><div class="info-label">Total Time</div><div class="info-value">${formatTime(totalTime)}</div></div>
    <div class="info-cell"><div class="info-label">Stages</div><div class="info-value">${recipe.stages.length}</div></div>
    <div class="info-cell"><div class="info-label">Actual Water</div><div class="info-value">${totalWater}ml</div></div>
  `;

  // Notes
  document.getElementById('recipe-notes').textContent = recipe.notes;

  // Timeline
  createTimeline('#stage-timeline', recipe.stages);
  createBarTimeline('#stage-bars', recipe.stages);

  // Stage Table
  const spiralNames = {};
  defaults.spiralTypes.forEach(s => { spiralNames[s.id] = s.name; });

  document.getElementById('stage-table').innerHTML = recipe.stages.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><span class="alarm-badge ${s.type === 'bloom' ? 'mdp' : s.type === 'pour' ? 'whp' : 'mcp'}">${s.type}</span></td>
      <td>${s.label}</td>
      <td>${s.time}s</td>
      <td>${s.waterAmount}ml</td>
      <td>${spiralNames[s.spiralType] || 'None'}</td>
    </tr>
  `).join('');
})();
