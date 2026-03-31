/* Dashboard Page Logic */
(async function () {
  // Load data
  const [spouts, alarms, sessions, recipes] = await Promise.all([
    api('spouts'),
    api('alarms'),
    api('brew-sessions'),
    api('recipes')
  ]);

  // ── Gauges ───────────────────────────────────────────
  const tempGauge = createGauge('#gauge-temp', {
    size: 180, strokeWidth: 12,
    value: 92.8, min: 80, max: 100,
    unit: '°C', label: 'Target: 93°C',
    colorClass: 'amber'
  });

  const waterGauge = createGauge('#gauge-water', {
    size: 180, strokeWidth: 12,
    value: 72, min: 0, max: 100,
    unit: '%', label: 'Capacity',
    colorClass: 'ok'
  });

  const pressureGauge = createGauge('#gauge-pressure', {
    size: 180, strokeWidth: 12,
    value: 1.02, min: 0, max: 2,
    unit: ' bar', label: 'Normal',
    colorClass: 'gold'
  });

  // ── Spout Grid ───────────────────────────────────────
  const spoutGrid = document.getElementById('spout-grid');
  spoutGrid.innerHTML = spouts.map(s => {
    const statusIcon = s.status === 'active' ? '&#9654;' :
                       s.status === 'error' ? '&#9888;' : '&#9679;';
    const statusText = s.status === 'active' ? s.currentRecipe :
                       s.status === 'error' ? s.errorMessage : 'Idle';
    return `
      <div class="glass-card spout-card">
        <div class="spout-icon ${s.status}">${statusIcon}</div>
        <div class="spout-name">${s.name}</div>
        <div class="spout-status">${statusText}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${s.totalBrews.toLocaleString()} brews</div>
      </div>
    `;
  }).join('');

  // ── Recent Brews ─────────────────────────────────────
  const recentEl = document.getElementById('recent-brews');
  recentEl.innerHTML = sessions.slice(0, 5).map(s => `
    <div class="alarm-item">
      <div class="alarm-dot ${s.status === 'completed' ? 'info' : 'warning'}"></div>
      <div class="alarm-content">
        <div class="alarm-title">${s.recipeName}</div>
        <div class="alarm-time">Spout ${s.spoutId} &middot; ${formatDateTime(s.startTime)} &middot; ${s.status === 'completed' ? formatTime(s.duration) : 'Aborted'}</div>
      </div>
    </div>
  `).join('');

  // ── Active Alarms ────────────────────────────────────
  const alarmsEl = document.getElementById('active-alarms');
  alarmsEl.innerHTML = alarms.active.map(a => `
    <div class="alarm-item">
      <div class="alarm-dot ${a.severity}"></div>
      <div class="alarm-content">
        <div class="alarm-title">${a.message}</div>
        <div class="alarm-time">
          <span class="alarm-badge ${a.category.toLowerCase()}">${a.category}</span>
          &middot; ${a.code} &middot; ${formatDateTime(a.timestamp)}
        </div>
      </div>
    </div>
  `).join('');

  // ── WebSocket Simulator (live updates) ───────────────
  WSSimulator.startBoilerUpdates();
  WSSimulator.on('boiler', (data) => {
    if (tempGauge) tempGauge.update(data.temperature);
    if (waterGauge) waterGauge.update(data.waterLevel);
    if (pressureGauge) pressureGauge.update(data.pressure);
  });
})();
