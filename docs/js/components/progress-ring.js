/* ═══════════════════════════════════════════════════════
   Brewing Progress Ring Component
   ═══════════════════════════════════════════════════════ */

function createProgressRing(container, options = {}) {
  const {
    size = 280,
    strokeWidth = 12,
    value = 0,
  } = options;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return null;

  el.innerHTML = `
    <div class="progress-ring-container" style="width:${size}px;height:${size}px;">
      <svg class="progress-ring-svg" width="${size}" height="${size}">
        <circle class="progress-ring-bg"
          cx="${size / 2}" cy="${size / 2}" r="${radius}"
          stroke-width="${strokeWidth}" />
        <circle class="progress-ring-fill"
          cx="${size / 2}" cy="${size / 2}" r="${radius}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${circumference}" />
      </svg>
      <div class="progress-ring-center">
        <span class="progress-ring-percent">0%</span>
        <span class="progress-ring-label">Brewing...</span>
      </div>
    </div>
  `;

  const fill = el.querySelector('.progress-ring-fill');
  const percentEl = el.querySelector('.progress-ring-percent');
  const labelEl = el.querySelector('.progress-ring-label');

  return {
    update(percent, labelText) {
      const norm = Math.min(Math.max(percent / 100, 0), 1);
      if (fill) {
        fill.style.strokeDashoffset = circumference * (1 - norm);
      }
      if (percentEl) {
        percentEl.textContent = `${Math.round(percent)}%`;
      }
      if (labelText && labelEl) {
        labelEl.textContent = labelText;
      }
    }
  };
}
