/* Usage History Page Logic */
(async function () {
  const [usage, sessions] = await Promise.all([
    api('usage-info'),
    api('brew-sessions')
  ]);

  let currentPeriod = 'daily';

  function renderChart() {
    const chartEl = document.getElementById('usage-chart');
    let data;

    if (currentPeriod === 'daily') {
      data = usage.daily.map(d => ({
        label: d.date.slice(5),
        value: d.brews
      }));
    } else if (currentPeriod === 'weekly') {
      data = usage.weekly.map(d => ({
        label: d.week,
        value: d.brews
      }));
    } else {
      data = usage.monthly.map(d => ({
        label: d.month.slice(2),
        value: d.brews
      }));
    }

    const maxVal = Math.max(...data.map(d => d.value));

    chartEl.innerHTML = `
      <div class="bar-chart">
        ${data.map(d => {
          const heightPct = (d.value / maxVal) * 100;
          return `
            <div class="bar" style="height:${heightPct}%;">
              <span class="bar-value">${d.value}</span>
              <span class="bar-label">${d.label}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Top recipes
  document.getElementById('top-recipes').innerHTML = usage.topRecipes.map((r, i) => `
    <div class="alarm-item">
      <div style="width:28px;height:28px;border-radius:50%;background:${i === 0 ? 'var(--accent-amber)' : 'var(--bg-tertiary)'};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:${i === 0 ? 'var(--text-inverse)' : 'var(--text-secondary)'};">${i + 1}</div>
      <div class="alarm-content">
        <div class="alarm-title">${r.name}</div>
        <div class="alarm-time">${r.count.toLocaleString()} brews</div>
      </div>
    </div>
  `).join('');

  // Summary
  document.getElementById('usage-summary').innerHTML = `
    <div class="info-cell"><div class="info-label">Total Brews</div><div class="info-value">${usage.totalBrews.toLocaleString()}</div></div>
    <div class="info-cell"><div class="info-label">Water Used</div><div class="info-value">${usage.totalWaterUsed.toLocaleString()}L</div></div>
    <div class="info-cell"><div class="info-label">Coffee Used</div><div class="info-value">${usage.totalCoffeeUsed.toLocaleString()}kg</div></div>
    <div class="info-cell"><div class="info-label">Today's Brews</div><div class="info-value">${usage.daily[usage.daily.length - 1].brews}</div></div>
  `;

  // Session log
  document.getElementById('session-log').innerHTML = sessions.map(s => `
    <tr>
      <td>${formatDateTime(s.startTime)}</td>
      <td>${s.recipeName}</td>
      <td>Spout ${s.spoutId}</td>
      <td>${s.duration ? formatTime(s.duration) : '-'}</td>
      <td>${s.waterUsed}ml</td>
      <td>${s.avgTemp.toFixed(1)}°C</td>
      <td><span class="alarm-badge ${s.status === 'completed' ? 'whp' : 'mcp'}">${s.status}</span></td>
    </tr>
  `).join('');

  // Period tabs
  document.querySelectorAll('#period-tabs .tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#period-tabs .tab-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPeriod = tab.dataset.period;
      renderChart();
    });
  });

  renderChart();
})();
