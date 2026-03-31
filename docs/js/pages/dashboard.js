/* Spout Control Panel — Main Screen Logic */
(async function () {
  const [spouts, recipes, favorites, alarms] = await Promise.all([
    api('spouts'),
    api('recipes'),
    api('favorites'),
    api('alarms')
  ]);

  // Simulated brew state per spout
  const brewState = {};
  spouts.forEach(s => {
    if (s.status === 'active') {
      const recipe = recipes.find(r => r.name === s.currentRecipe) || recipes[0];
      const totalDuration = recipe.stages.reduce((sum, st) => sum + st.time, 0);
      brewState[s.id] = {
        recipe,
        elapsed: Math.floor(totalDuration * 0.4),
        totalDuration,
        progress: 40,
        stage: recipe.stages[2] || recipe.stages[0],
        stageIndex: 2
      };
    }
  });

  let selectedSpoutId = null;

  // ── Render Spout Cards ─────────────────────────────────
  function renderSpouts() {
    const grid = document.getElementById('spout-control-grid');
    grid.innerHTML = spouts.map(s => {
      const brew = brewState[s.id];

      if (s.status === 'error') {
        return `
          <div class="spout-ctrl-card spout-ctrl-error">
            <div class="sctrl-header">
              <div class="sctrl-num">${s.id}</div>
              <div class="sctrl-name">${s.name}</div>
              <div class="sctrl-badge sctrl-badge-error">Error</div>
            </div>
            <div class="sctrl-body sctrl-body-center">
              <div class="sctrl-error-icon">&#9888;</div>
              <div class="sctrl-error-code">${s.errorCodeName || s.errorCode}</div>
              <div class="sctrl-error-msg">${s.errorMessage}</div>
            </div>
            <div class="sctrl-footer">
              <button class="btn btn-danger btn-sm w-full" onclick="resetSpout(${s.id})">Reset</button>
            </div>
          </div>`;
      }

      if (brew) {
        const totalWater = brew.recipe.stages.reduce((sum, st) => sum + st.waterAmount, 0);
        const waterPoured = Math.floor((brew.progress / 100) * totalWater);
        return `
          <div class="spout-ctrl-card spout-ctrl-active">
            <div class="sctrl-header">
              <div class="sctrl-num">${s.id}</div>
              <div class="sctrl-name">${s.name}</div>
              <div class="sctrl-badge sctrl-badge-active">Brewing</div>
            </div>
            <div class="sctrl-body">
              <!-- Brewing Visual -->
              <div class="sctrl-visual-area">
                <div class="brew-pour-water"></div>
                <div class="brew-dripper"></div>
                <div class="brew-steam-wrap">
                  <div class="steam-line"></div>
                  <div class="steam-line"></div>
                  <div class="steam-line"></div>
                </div>
                <div class="brew-stream"></div>
                <div class="brew-server">
                  <div class="brew-liquid" id="brew-liquid-${s.id}" style="height:${brew.progress}%"></div>
                </div>
              </div>
              
              <div class="sctrl-recipe-name">${brew.recipe.name}</div>
              <div class="sctrl-recipe-info">${brew.recipe.dripper} · ${brew.recipe.coffeeWeight}g / ${brew.recipe.waterWeight}ml</div>
              <div class="sctrl-progress-wrap">
                <div class="sctrl-progress-bar">
                  <div class="sctrl-progress-fill" style="width:${brew.progress}%"></div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span class="sctrl-progress-pct">${Math.round(brew.progress)}%</span>
                  <span style="font-size:11px; color:var(--text-muted); font-weight:600;">EXTRACTING...</span>
                </div>
              </div>
              <div class="sctrl-brew-stats">
                <div><span class="sctrl-stat-label">Stage</span><span class="sctrl-stat-value" id="brew-stage-${s.id}">${brew.stage.label}</span></div>
                <div><span class="sctrl-stat-label">Time</span><span class="sctrl-stat-value" id="brew-time-${s.id}">${formatTime(Math.floor(brew.elapsed))} / ${formatTime(brew.totalDuration)}</span></div>
                <div><span class="sctrl-stat-label">Water</span><span class="sctrl-stat-value" id="brew-water-${s.id}">${waterPoured} / ${totalWater} ml</span></div>
                <div><span class="sctrl-stat-label">Temp</span><span class="sctrl-stat-value" id="brew-temp-${s.id}">${brew.recipe.waterTemp}°C</span></div>
              </div>
            </div>
            <div class="sctrl-footer">
              <button class="btn btn-danger btn-sm w-full" onclick="stopBrew(${s.id})">&#9632; Stop</button>
            </div>
          </div>`;
      }

      // Idle
      const favKey = `spout${s.id}`;
      const favIds = favorites[favKey] || [];
      const favRecipes = favIds.map(id => recipes.find(r => r.id === id)).filter(Boolean).slice(0, 3);

      return `
        <div class="spout-ctrl-card spout-ctrl-idle">
          <div class="sctrl-header">
            <div class="sctrl-num">${s.id}</div>
            <div class="sctrl-name">${s.name}</div>
            <div class="sctrl-badge sctrl-badge-idle">Idle</div>
          </div>
          <div class="sctrl-body sctrl-body-center">
            ${favRecipes.length > 0 ? `
              <div class="sctrl-quick-picks">
                <div class="sctrl-quick-label">Quick Pick</div>
                ${favRecipes.map(r => `
                  <button class="sctrl-quick-btn" onclick="startBrew(${s.id}, ${r.id})">
                    <span class="sctrl-quick-name">${r.name}</span>
                    <span class="sctrl-quick-meta">${r.dripper} · ${r.coffeeWeight}g</span>
                  </button>
                `).join('')}
              </div>
            ` : `
              <div class="sctrl-idle-icon">&#9749;</div>
              <div style="font-size:13px;color:var(--text-muted);">Ready to brew</div>
            `}
          </div>
          <div class="sctrl-footer">
            <button class="btn btn-primary btn-sm w-full" onclick="openRecipeModal(${s.id})">&#9654; Select Recipe</button>
          </div>
        </div>`;
    }).join('');
  }

  // ── Recipe Modal ───────────────────────────────────────
  window.openRecipeModal = function (spoutId) {
    selectedSpoutId = spoutId;
    document.getElementById('modal-spout-label').textContent = `Spout ${spoutId}`;
    document.getElementById('modal-recipe-search').value = '';
    renderModalRecipes('');
    document.getElementById('recipe-modal-overlay').classList.add('active');
    document.getElementById('recipe-modal').classList.add('active');
  };

  window.closeRecipeModal = function () {
    document.getElementById('recipe-modal-overlay').classList.remove('active');
    document.getElementById('recipe-modal').classList.remove('active');
    selectedSpoutId = null;
  };

  window.filterModalRecipes = function (query) {
    renderModalRecipes(query);
  };

  function renderModalRecipes(query) {
    let list = [...recipes];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.dripper.toLowerCase().includes(q));
    }

    document.getElementById('modal-recipe-list').innerHTML = list.map(r => {
      const totalTime = r.stages.reduce((s, st) => s + st.time, 0);
      return `
        <button class="modal-recipe-item" onclick="selectRecipeAndBrew(${r.id})">
          <div class="modal-recipe-main">
            <div class="modal-recipe-name">${r.name}</div>
            <div class="modal-recipe-meta">${r.dripper} · ${r.coffeeWeight}g / ${r.waterWeight}ml · ${r.waterTemp}°C · ${formatTime(totalTime)}</div>
          </div>
          <span class="modal-recipe-arrow">&#9654;</span>
        </button>`;
    }).join('');
  }

  window.selectRecipeAndBrew = function (recipeId) {
    closeRecipeModal();
    startBrew(selectedSpoutId, recipeId);
  };

  // ── Start / Stop Brew ──────────────────────────────────
  window.startBrew = function (spoutId, recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const spout = spouts.find(s => s.id === spoutId);
    spout.status = 'active';
    spout.currentRecipe = recipe.name;

    const totalDuration = recipe.stages.reduce((sum, st) => sum + st.time, 0);
    brewState[spoutId] = {
      recipe,
      elapsed: 0,
      totalDuration,
      progress: 0,
      stage: recipe.stages[0],
      stageIndex: 0
    };

    renderSpouts();
    Toast.success(`Brewing "${recipe.name}" on Spout ${spoutId}`);

    // Simulate brew progress
    const interval = setInterval(() => {
      const brew = brewState[spoutId];
      if (!brew) { clearInterval(interval); return; }

      brew.elapsed += 0.5;
      brew.progress = Math.min((brew.elapsed / brew.totalDuration) * 100, 100);

      // Find current stage
      let stageTime = 0;
      for (let i = 0; i < brew.recipe.stages.length; i++) {
        stageTime += brew.recipe.stages[i].time;
        if (brew.elapsed <= stageTime) {
          brew.stage = brew.recipe.stages[i];
          brew.stageIndex = i;
          break;
        }
      }

      // Update live values
      const totalWater = brew.recipe.stages.reduce((sum, st) => sum + st.waterAmount, 0);
      const stageEl = document.getElementById(`brew-stage-${spoutId}`);
      const timeEl = document.getElementById(`brew-time-${spoutId}`);
      const waterEl = document.getElementById(`brew-water-${spoutId}`);
      const tempEl = document.getElementById(`brew-temp-${spoutId}`);

      if (stageEl) stageEl.textContent = brew.stage.label;
      if (timeEl) timeEl.textContent = `${formatTime(Math.floor(brew.elapsed))} / ${formatTime(brew.totalDuration)}`;
      if (waterEl) waterEl.textContent = `${Math.floor((brew.progress / 100) * totalWater)} / ${totalWater} ml`;
      if (tempEl) tempEl.textContent = `${(brew.recipe.waterTemp + (Math.random() - 0.5) * 1).toFixed(1)}°C`;

      // Update liquid height visual
      const liquidEl = document.getElementById(`brew-liquid-${spoutId}`);
      if (liquidEl) liquidEl.style.height = `${brew.progress}%`;

      // Update progress bar
      const card = document.querySelector(`.spout-ctrl-card:nth-child(${spoutId})`);
      if (card) {
        const fill = card.querySelector('.sctrl-progress-fill');
        const pct = card.querySelector('.sctrl-progress-pct');
        if (fill) fill.style.width = `${brew.progress}%`;
        if (pct) pct.textContent = `${Math.round(brew.progress)}%`;
      }

      if (brew.progress >= 100) {
        clearInterval(interval);
        Toast.success(`Spout ${spoutId}: Brewing complete!`);
        delete brewState[spoutId];
        spout.status = 'idle';
        spout.currentRecipe = null;
        setTimeout(() => renderSpouts(), 500);
      }
    }, 500);
  };

  window.stopBrew = function (spoutId) {
    delete brewState[spoutId];
    const spout = spouts.find(s => s.id === spoutId);
    spout.status = 'idle';
    spout.currentRecipe = null;
    renderSpouts();
    Toast.warning(`Spout ${spoutId}: Brew stopped`);
  };

  window.resetSpout = function (spoutId) {
    const spout = spouts.find(s => s.id === spoutId);
    spout.status = 'idle';
    spout.errorCode = null;
    spout.errorMessage = null;
    spout.errorCodeName = null;
    renderSpouts();
    Toast.info(`Spout ${spoutId}: Reset complete`);
  };

  // ── Machine Status Bar (live updates) ──────────────────
  WSSimulator.startBoilerUpdates();
  WSSimulator.on('boiler', (data) => {
    const tempEl = document.getElementById('ms-temp');
    const waterEl = document.getElementById('ms-water');
    const pressEl = document.getElementById('ms-pressure');
    if (tempEl) tempEl.textContent = `${data.temperature.toFixed(1)}°C`;
    if (waterEl) waterEl.textContent = `${Math.round(data.waterLevel)}%`;
    if (pressEl) pressEl.textContent = `${data.pressure.toFixed(2)} bar`;
  });

  renderSpouts();
})();
