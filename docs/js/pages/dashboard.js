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
              <!-- Brewing Visual (SVG) -->
              <div class="sctrl-visual-area">
                <svg viewBox="0 0 150 150" class="sc-brew-svg">
                  <defs>
                    <linearGradient id="scGrad${s.id}" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#4a342e"/>
                      <stop offset="100%" stop-color="#2c1e17"/>
                    </linearGradient>
                    <clipPath id="scClip${s.id}">
                      <path d="M69,109 L64,133 Q64,139 71,139 L99,139 Q106,139 106,133 L101,109 Z"/>
                    </clipPath>
                  </defs>
                  <!-- Base -->
                  <rect x="15" y="140" width="120" height="8" rx="3" fill="#d4b896"/>
                  <rect x="15" y="140" width="120" height="3" rx="1.5" fill="#c5a059" opacity="0.25"/>
                  <!-- Stand pole -->
                  <rect x="30" y="20" width="5" height="120" rx="2" fill="#8e8e93"/>
                  <rect x="31" y="20" width="1.5" height="120" rx="0.75" fill="rgba(255,255,255,0.18)"/>
                  <rect x="25" y="14" width="15" height="10" rx="5" fill="#71717a"/>
                  <!-- Arm -->
                  <rect x="35" y="50" width="50" height="4" rx="2" fill="#8e8e93"/>
                  <!-- Clamp -->
                  <circle cx="85" cy="52" r="6" fill="#5c4a3a"/>
                  <circle cx="85" cy="52" r="2.5" fill="#a09080"/>
                  <!-- Support rod -->
                  <rect x="83" y="58" width="4" height="8" rx="1.5" fill="#8e8e93"/>
                  <!-- Dripper ring -->
                  <ellipse cx="85" cy="66" rx="28" ry="3" fill="none" stroke="#8e8e93" stroke-width="1.5"/>
                  <!-- V60 Dripper -->
                  <rect x="56" y="63" width="58" height="7" rx="2" fill="#5c4a3a"/>
                  <polygon points="58,68 112,68 96,100 74,100" fill="#d4b896"/>
                  <polygon points="62,72 108,72 95,98 75,98" fill="#c5a059" opacity="0.1"/>
                  <line x1="78" y1="72" x2="79" y2="96" stroke="#c5a059" stroke-width="0.5" opacity="0.3"/>
                  <line x1="86" y1="72" x2="85" y2="96" stroke="#c5a059" stroke-width="0.5" opacity="0.3"/>
                  <line x1="94" y1="72" x2="91" y2="96" stroke="#c5a059" stroke-width="0.5" opacity="0.3"/>
                  <!-- Dripper tip -->
                  <rect x="82" y="100" width="6" height="5" rx="2" fill="#3c2a21"/>
                  <!-- Water spirals -->
                  <g class="bp-spirals-active">
                    <ellipse class="bp-spiral" cx="85" cy="80" rx="10" ry="3"/>
                    <ellipse class="bp-spiral bp-spiral-delay" cx="85" cy="80" rx="16" ry="4"/>
                  </g>
                  <!-- Server / Carafe -->
                  <path d="M68,108 L63,133 Q63,140 70,140 L100,140 Q107,140 107,133 L102,108 Z"
                        fill="rgba(255,255,255,0.35)" stroke="rgba(142,142,147,0.35)" stroke-width="1.5"/>
                  <line x1="66" y1="112" x2="65" y2="130" stroke="rgba(255,255,255,0.25)" stroke-width="1" stroke-linecap="round"/>
                  <path d="M107,114 C118,116 118,132 107,134" fill="none" stroke="rgba(142,142,147,0.4)" stroke-width="2" stroke-linecap="round"/>
                  <path d="M68,109 L62,104" fill="none" stroke="rgba(142,142,147,0.35)" stroke-width="2" stroke-linecap="round"/>
                  <!-- Coffee liquid -->
                  <g clip-path="url(#scClip${s.id})">
                    <rect id="sc-liquid-${s.id}" x="62" y="${139 - (brew.progress / 100) * 30}" width="46" height="${(brew.progress / 100) * 30}" fill="url(#scGrad${s.id})"/>
                    <ellipse id="sc-wave-${s.id}" cx="85" cy="${139 - (brew.progress / 100) * 30}" rx="23" ry="2" fill="#5a3e30" opacity="${brew.progress > 3 ? 0.5 : 0}"/>
                  </g>
                  <!-- Stream -->
                  <g class="bp-stream-active">
                    <rect x="84" y="105" width="2" height="3" rx="1" fill="#4a342e" opacity="0.85"/>
                    <circle class="bp-drip" cx="85" cy="108" r="1.5" fill="#4a342e"/>
                  </g>
                  <!-- Steam -->
                  <path class="bp-steam-line" d="M64,104 Q62,96 64,88" fill="none" stroke="rgba(197,160,89,0.15)" stroke-width="1.5" stroke-linecap="round"/>
                  <path class="bp-steam-line bp-steam-d1" d="M70,106 Q68,96 70,86" fill="none" stroke="rgba(197,160,89,0.12)" stroke-width="1.5" stroke-linecap="round"/>
                  <path class="bp-steam-line bp-steam-d2" d="M58,102 Q56,94 58,86" fill="none" stroke="rgba(197,160,89,0.1)" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
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

      // Update SVG liquid level
      const liquidEl = document.getElementById(`sc-liquid-${spoutId}`);
      const waveEl = document.getElementById(`sc-wave-${spoutId}`);
      if (liquidEl) {
        const h = (brew.progress / 100) * 30;
        liquidEl.setAttribute('y', 139 - h);
        liquidEl.setAttribute('height', h);
        if (waveEl) {
          waveEl.setAttribute('cy', 139 - h);
          waveEl.setAttribute('opacity', h > 2 ? '0.5' : '0');
        }
      }

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
