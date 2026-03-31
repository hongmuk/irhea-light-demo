/* ═══════════════════════════════════════════════════════
   SVG Circular Gauge Component
   ═══════════════════════════════════════════════════════ */

function createGauge(container, options = {}) {
  const {
    size = 160,
    strokeWidth = 10,
    value = 0,
    min = 0,
    max = 100,
    unit = '',
    label = '',
    colorClass = 'amber',
    animate = true
  } = options;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(Math.max((value - min) / (max - min), 0), 1);

  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return null;

  el.innerHTML = `
    <div class="gauge-container" style="width:${size}px;height:${size}px;">
      <svg class="gauge-svg" width="${size}" height="${size}">
        <circle class="gauge-bg"
          cx="${size / 2}" cy="${size / 2}" r="${radius}"
          stroke-width="${strokeWidth}" />
        <circle class="gauge-fill ${colorClass}"
          cx="${size / 2}" cy="${size / 2}" r="${radius}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${circumference}"
          data-target="${circumference * (1 - normalizedValue)}" />
      </svg>
      <div class="gauge-center">
        <span class="gauge-value" data-value="${value}">${value.toFixed(1)}${unit}</span>
        <span class="gauge-label">${label}</span>
      </div>
    </div>
  `;

  // Animate
  if (animate) {
    requestAnimationFrame(() => {
      const fill = el.querySelector('.gauge-fill');
      if (fill) {
        fill.style.strokeDashoffset = fill.dataset.target;
      }
    });
  }

  return {
    update(newValue) {
      const norm = Math.min(Math.max((newValue - min) / (max - min), 0), 1);
      const fill = el.querySelector('.gauge-fill');
      const valueEl = el.querySelector('.gauge-value');
      if (fill) {
        fill.style.strokeDashoffset = circumference * (1 - norm);
      }
      if (valueEl) {
        valueEl.textContent = `${newValue.toFixed(1)}${unit}`;
        valueEl.dataset.value = newValue;
      }
    }
  };
}
