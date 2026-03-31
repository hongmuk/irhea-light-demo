/* Calibration Page Logic */
(async function () {
  const spouts = await api('spouts');
  let currentSpout = 0;

  const gainKeys = ['gain1', 'gain2', 'gain3', 'gain4', 'gain5'];

  function renderGains() {
    const spout = spouts[currentSpout];
    const cal = spout.calibration;

    document.getElementById('gain-editor').innerHTML = `
      <div class="gain-row" style="border-bottom:1px solid var(--glass-border);">
        <div class="gain-label" style="font-weight:600;color:var(--text-muted);font-size:12px;">Parameter</div>
        ${gainKeys.map((k, i) => `<div style="text-align:center;font-size:12px;font-weight:600;color:var(--text-muted);">Gain ${i + 1}</div>`).join('')}
      </div>
      <div class="gain-row">
        <div class="gain-label">Value</div>
        ${gainKeys.map(k => `
          <input class="gain-input" type="number" step="0.001" min="0.900" max="1.100"
                 value="${cal[k].toFixed(3)}" data-key="${k}" />
        `).join('')}
      </div>
      <div class="gain-row">
        <div class="gain-label">Deviation</div>
        ${gainKeys.map(k => {
          const dev = ((cal[k] - 1.0) * 100).toFixed(1);
          const color = Math.abs(dev) > 1 ? 'var(--status-warning)' : 'var(--status-ok)';
          return `<div style="text-align:center;font-size:13px;font-weight:500;color:${color};">${dev > 0 ? '+' : ''}${dev}%</div>`;
        }).join('')}
      </div>
    `;

    // Bind input changes
    document.querySelectorAll('.gain-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.key;
        spouts[currentSpout].calibration[key] = parseFloat(e.target.value);
        renderGains();
      });
    });
  }

  // Tabs
  document.querySelectorAll('#cal-tabs .tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#cal-tabs .tab-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSpout = parseInt(tab.dataset.spout);
      renderGains();
    });
  });

  // Reset
  document.getElementById('btn-reset').addEventListener('click', () => {
    gainKeys.forEach(k => {
      spouts[currentSpout].calibration[k] = 1.000;
    });
    renderGains();
    Toast.info('Gains reset to 1.000');
  });

  // Save
  document.getElementById('btn-save-cal').addEventListener('click', () => {
    Toast.success('Calibration saved!');
  });

  // Test
  document.getElementById('btn-test').addEventListener('click', () => {
    const resultEl = document.getElementById('cal-result');
    resultEl.innerHTML = '<div style="color:var(--accent-amber);">Running calibration test pour...</div>';
    setTimeout(() => {
      const targetMl = 100;
      const cal = spouts[currentSpout].calibration;
      const avgGain = gainKeys.reduce((s, k) => s + cal[k], 0) / 5;
      const measuredMl = (targetMl * avgGain).toFixed(1);
      const error = ((avgGain - 1.0) * 100).toFixed(2);
      resultEl.innerHTML = `
        <div class="grid-3" style="gap:16px;">
          <div class="glass-card text-center">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">Target</div>
            <div style="font-size:20px;font-weight:600;color:var(--text-primary);">${targetMl} ml</div>
          </div>
          <div class="glass-card text-center">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">Measured</div>
            <div style="font-size:20px;font-weight:600;color:var(--accent-amber);">${measuredMl} ml</div>
          </div>
          <div class="glass-card text-center">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">Error</div>
            <div style="font-size:20px;font-weight:600;color:${Math.abs(error) > 1 ? 'var(--status-warning)' : 'var(--status-ok)'};">${error > 0 ? '+' : ''}${error}%</div>
          </div>
        </div>
      `;
      Toast.success('Calibration test complete');
    }, 2000);
  });

  renderGains();
})();
