/* Firmware Page Logic */
(async function () {
  const info = await api('system-info');
  const fw = info.firmware;

  const boards = [
    { key: 'mcp', label: 'MCP Board', icon: '&#9881;', newVersion: '2.5.0' },
    { key: 'mdp', label: 'MDP Board', icon: '&#9879;', newVersion: '1.9.0' },
    { key: 'whp', label: 'WHP Board', icon: '&#9832;', newVersion: '3.2.0' }
  ];

  function renderCards() {
    document.getElementById('fw-cards').innerHTML = boards.map(b => {
      const f = fw[b.key];
      const hasUpdate = f.version !== b.newVersion;
      return `
        <div class="glass-card fw-card">
          <div class="fw-info">
            <div class="fw-icon">${b.icon}</div>
            <div>
              <div class="fw-name">${b.label} (${f.board})</div>
              <div class="fw-version">Current: v${f.version} &middot; Build: ${f.buildDate}</div>
            </div>
          </div>
          ${hasUpdate
            ? `<div class="flex items-center gap-12">
                <span style="font-size:12px;color:var(--status-ok);">v${b.newVersion} available</span>
                <button class="btn btn-primary btn-sm" onclick="startUpdate('${b.key}', '${b.label}', '${b.newVersion}')">Update</button>
              </div>`
            : `<span style="font-size:12px;color:var(--text-muted);">Up to date</span>`
          }
        </div>
      `;
    }).join('');
  }

  window.startUpdate = function (key, label, newVersion) {
    const panel = document.getElementById('update-panel');
    panel.style.display = 'block';
    document.getElementById('update-board').textContent = `Updating ${label}...`;

    let progress = 0;
    const bar = document.getElementById('update-bar');
    const percentEl = document.getElementById('update-percent');
    const statusEl = document.getElementById('update-status');

    const stages = [
      { at: 0, text: 'Downloading firmware package...' },
      { at: 20, text: 'Verifying firmware signature...' },
      { at: 35, text: 'Erasing flash memory...' },
      { at: 50, text: 'Writing firmware to flash...' },
      { at: 75, text: 'Verifying flash integrity...' },
      { at: 90, text: 'Rebooting board...' },
      { at: 100, text: 'Update complete!' }
    ];

    const interval = setInterval(() => {
      progress += Math.random() * 3 + 1;
      if (progress > 100) progress = 100;

      bar.style.width = `${progress}%`;
      percentEl.textContent = `${Math.round(progress)}%`;

      const stage = [...stages].reverse().find(s => progress >= s.at);
      if (stage) statusEl.textContent = stage.text;

      if (progress >= 100) {
        clearInterval(interval);
        fw[key].version = newVersion;
        renderCards();
        Toast.success(`${label} updated to v${newVersion}!`);
        setTimeout(() => { panel.style.display = 'none'; }, 2000);
      }
    }, 200);
  };

  renderCards();
})();
