/* System Info Page Logic — loaded on /system-info */
(async function () {
  const [info, usage] = await Promise.all([
    api('system-info'),
    api('usage-info')
  ]);

  // Machine
  document.getElementById('machine-info').innerHTML = `
    <div class="info-cell"><div class="info-label">Model</div><div class="info-value">${info.model}</div></div>
    <div class="info-cell"><div class="info-label">Serial Number</div><div class="info-value font-mono">${info.serialNumber}</div></div>
    <div class="info-cell"><div class="info-label">Manufacturer</div><div class="info-value">${info.manufacturer}</div></div>
    <div class="info-cell"><div class="info-label">Install Date</div><div class="info-value">${info.installDate}</div></div>
    <div class="info-cell"><div class="info-label">Spout Count</div><div class="info-value">${info.spoutCount}</div></div>
    <div class="info-cell"><div class="info-label">Boiler Capacity</div><div class="info-value">${info.boilerCapacity}L</div></div>
  `;

  // Shop
  document.getElementById('shop-info').innerHTML = `
    <div class="info-cell"><div class="info-label">Shop Name</div><div class="info-value">${info.shopName}</div></div>
    <div class="info-cell"><div class="info-label">Address</div><div class="info-value">${info.shopAddress}</div></div>
    <div class="info-cell"><div class="info-label">Supported Drippers</div><div class="info-value">${info.supportedDrippers.join(', ')}</div></div>
    <div class="info-cell"><div class="info-label">Max Water Temp</div><div class="info-value">${info.maxWaterTemp}°C</div></div>
  `;

  // Network
  document.getElementById('network-info').innerHTML = `
    <div class="info-cell"><div class="info-label">IP Address</div><div class="info-value font-mono">${info.network.ip}</div></div>
    <div class="info-cell"><div class="info-label">MAC Address</div><div class="info-value font-mono">${info.network.mac}</div></div>
    <div class="info-cell"><div class="info-label">IPC Socket</div><div class="info-value font-mono">${info.network.ipcSocket}</div></div>
    <div class="info-cell"><div class="info-label">Protocol</div><div class="info-value">${info.network.protocol}</div></div>
  `;

  // Usage stats
  document.getElementById('usage-stats').innerHTML = `
    <div class="info-cell"><div class="info-label">Total Brews</div><div class="info-value">${usage.totalBrews.toLocaleString()}</div></div>
    <div class="info-cell"><div class="info-label">Total Water Used</div><div class="info-value">${usage.totalWaterUsed.toLocaleString()}L</div></div>
    <div class="info-cell"><div class="info-label">Total Coffee Used</div><div class="info-value">${usage.totalCoffeeUsed.toLocaleString()}kg</div></div>
    <div class="info-cell"><div class="info-label">Machine Uptime</div><div class="info-value">${Math.floor(usage.machineUptime / 24)}d ${usage.machineUptime % 24}h</div></div>
  `;

  // Firmware
  const fwBoards = [
    { key: 'mcp', label: 'MCP Board', icon: '&#9881;' },
    { key: 'mdp', label: 'MDP Board', icon: '&#9879;' },
    { key: 'whp', label: 'WHP Board', icon: '&#9832;' }
  ];

  document.getElementById('fw-info').innerHTML = fwBoards.map(b => {
    const f = info.firmware[b.key];
    return `
      <div class="glass-card" style="text-align:center;">
        <div style="font-size:24px;margin-bottom:8px;">${b.icon}</div>
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${b.label}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${f.board}</div>
        <div style="font-size:18px;font-weight:700;color:var(--accent-amber);margin-top:8px;">v${f.version}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Build: ${f.buildDate}</div>
      </div>
    `;
  }).join('');
})();
