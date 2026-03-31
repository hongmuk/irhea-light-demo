/* Alarms Page Logic */
(async function () {
  const data = await api('alarms');
  let currentFilter = 'all';

  function renderAlarms() {
    const activeFiltered = currentFilter === 'all'
      ? data.active
      : data.active.filter(a => a.category === currentFilter);

    const historyFiltered = currentFilter === 'all'
      ? data.history
      : data.history.filter(a => a.category === currentFilter);

    // Active count
    document.getElementById('active-count').textContent = activeFiltered.length;

    // Active alarms
    const activeEl = document.getElementById('active-alarms-list');
    if (activeFiltered.length === 0) {
      activeEl.innerHTML = `<div class="empty-state"><div class="empty-icon">&#10003;</div><div class="empty-text">No active alarms</div></div>`;
    } else {
      activeEl.innerHTML = activeFiltered.map(a => `
        <div class="alarm-item">
          <div class="alarm-dot ${a.severity}"></div>
          <div class="alarm-content">
            <div class="alarm-title">${a.message}</div>
            <div class="alarm-time">
              <span class="alarm-badge ${a.category.toLowerCase()}">${a.category}</span>
              &middot; ${a.code} &middot; ${formatDateTime(a.timestamp)}
              ${a.acknowledged ? '<span style="color:var(--status-ok);font-size:11px;"> &middot; Acknowledged</span>' : ''}
            </div>
          </div>
          ${!a.acknowledged ? `<button class="btn btn-secondary btn-sm" onclick="ackAlarm('${a.id}', this)">ACK</button>` : ''}
        </div>
      `).join('');
    }

    // History
    const historyEl = document.getElementById('alarm-history-list');
    historyEl.innerHTML = historyFiltered.map(a => `
      <div class="alarm-item" style="opacity:0.7;">
        <div class="alarm-dot ${a.severity}" style="opacity:0.5;"></div>
        <div class="alarm-content">
          <div class="alarm-title">${a.message}</div>
          <div class="alarm-time">
            <span class="alarm-badge ${a.category.toLowerCase()}">${a.category}</span>
            &middot; ${a.code} &middot; ${formatDateTime(a.timestamp)}
            ${a.resolvedAt ? ` &middot; Resolved: ${formatDateTime(a.resolvedAt)}` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Acknowledge alarm
  window.ackAlarm = function (id, btn) {
    const alarm = data.active.find(a => a.id === id);
    if (alarm) {
      alarm.acknowledged = true;
      renderAlarms();
      Toast.success('Alarm acknowledged');
    }
  };

  // Filters
  document.querySelectorAll('#alarm-filters .filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#alarm-filters .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderAlarms();
    });
  });

  renderAlarms();
})();
