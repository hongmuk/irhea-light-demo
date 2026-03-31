/* ═══════════════════════════════════════════════════════
   Extraction Stage Timeline Chart Component
   ═══════════════════════════════════════════════════════ */

function createTimeline(container, stages) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el || !stages || !stages.length) return;

  const totalTime = stages.reduce((sum, s) => sum + s.time, 0);

  el.innerHTML = `
    <div class="stage-timeline">
      ${stages.map(stage => {
        const widthPercent = (stage.time / totalTime) * 100;
        const typeClass = stage.type === 'bloom' ? 'bloom' :
                          stage.type === 'pour' ? 'pour' : 'pause';
        return `
          <div class="stage-segment ${typeClass}" style="flex:${stage.time};" title="${stage.label}: ${stage.time}s">
            <span class="seg-label">${stage.label}</span>
            <span class="seg-time">${stage.time}s</span>
          </div>
        `;
      }).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:8px;">
      <span style="font-size:11px;color:var(--text-muted);">0s</span>
      <span style="font-size:11px;color:var(--text-muted);">Total: ${formatTime(totalTime)}</span>
    </div>
  `;
}

function createBarTimeline(container, stages) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el || !stages || !stages.length) return;

  const maxTime = Math.max(...stages.map(s => s.time));

  el.innerHTML = `
    <div class="timeline-chart">
      ${stages.map(stage => {
        const heightPercent = (stage.time / maxTime) * 100;
        const typeClass = stage.type === 'bloom' ? 'stage-bloom' :
                          stage.type === 'pour' ? 'stage-pour' : 'stage-pause';
        return `
          <div class="timeline-bar ${typeClass}" style="height:${heightPercent}%;">
            <div class="bar-tooltip">${stage.label}: ${stage.time}s</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
