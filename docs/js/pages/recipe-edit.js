/* Recipe Edit Page Logic */
(async function () {
  const id = pathSegment(2);
  const recipe = await api(`recipes/${id}`);
  const defaults = await api('brew-defaults');

  let stages = JSON.parse(JSON.stringify(recipe.stages));

  // Fill basic fields
  document.getElementById('edit-recipe-name').textContent = recipe.name;
  document.getElementById('back-link').href = nav(`/recipe/${id}`);
  document.getElementById('edit-name').value = recipe.name;
  document.getElementById('edit-dripper').value = recipe.dripper;
  document.getElementById('edit-grind').value = recipe.grindSize;
  document.getElementById('edit-coffee').value = recipe.coffeeWeight;
  document.getElementById('edit-water').value = recipe.waterWeight;
  document.getElementById('edit-temp').value = recipe.waterTemp;
  document.getElementById('edit-ratio').value = recipe.ratio;
  document.getElementById('edit-notes').value = recipe.notes;

  function renderStages() {
    const container = document.getElementById('stages-container');
    container.innerHTML = stages.map((s, i) => `
      <div class="glass-card mb-12" style="padding:16px;">
        <div class="flex items-center gap-12 mb-12">
          <span style="font-size:13px;font-weight:600;color:var(--accent-amber);">Stage ${i + 1}</span>
          <span class="alarm-badge ${s.type === 'bloom' ? 'mdp' : s.type === 'pour' ? 'whp' : 'mcp'}">${s.type}</span>
          <div style="flex:1;"></div>
          ${stages.length > 2 ? `<button class="btn btn-danger btn-sm" onclick="removeStage(${i})">Remove</button>` : ''}
        </div>
        <div class="grid-4" style="gap:12px;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Type</label>
            <select class="form-input" onchange="updateStage(${i}, 'type', this.value)" style="min-height:40px;">
              <option value="bloom" ${s.type === 'bloom' ? 'selected' : ''}>Bloom</option>
              <option value="pour" ${s.type === 'pour' ? 'selected' : ''}>Pour</option>
              <option value="pause" ${s.type === 'pause' ? 'selected' : ''}>Pause</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Label</label>
            <input class="form-input" type="text" value="${s.label}" onchange="updateStage(${i}, 'label', this.value)" style="min-height:40px;" />
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Time (s)</label>
            <input class="form-input" type="number" value="${s.time}" min="5" max="120" onchange="updateStage(${i}, 'time', +this.value)" style="min-height:40px;" />
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Water (ml)</label>
            <input class="form-input" type="number" value="${s.waterAmount}" min="0" max="500" onchange="updateStage(${i}, 'waterAmount', +this.value)" style="min-height:40px;" />
          </div>
        </div>
      </div>
    `).join('');

    // Update preview
    createTimeline('#edit-timeline-preview', stages);
    validate();
  }

  window.updateStage = function (i, key, value) {
    stages[i][key] = value;
    if (key === 'type') {
      stages[i].label = value === 'bloom' ? 'Bloom' : value === 'pour' ? `Pour ${i}` : 'Wait';
    }
    renderStages();
  };

  window.removeStage = function (i) {
    if (stages.length <= 2) return;
    stages.splice(i, 1);
    renderStages();
    Toast.info('Stage removed');
  };

  document.getElementById('btn-add-stage').addEventListener('click', () => {
    if (stages.length >= 10) {
      Toast.warning('Maximum 10 stages allowed');
      return;
    }
    stages.push({ type: 'pour', label: `Pour ${stages.length}`, time: 20, waterAmount: 80, spiralType: 2 });
    renderStages();
    Toast.info('Stage added');
  });

  function validate() {
    const el = document.getElementById('edit-validation');
    const issues = [];
    const totalWater = stages.reduce((s, st) => s + st.waterAmount, 0);
    const targetWater = parseInt(document.getElementById('edit-water').value) || 0;

    if (Math.abs(totalWater - targetWater) > 10) {
      issues.push(`<span style="color:var(--status-warning);">&#9888; Total stage water (${totalWater}ml) differs from target (${targetWater}ml)</span>`);
    }
    if (stages.length < 2) {
      issues.push(`<span style="color:var(--status-error);">&#10007; Minimum 2 stages required</span>`);
    }
    if (stages[0].type !== 'bloom') {
      issues.push(`<span style="color:var(--status-warning);">&#9888; First stage should be Bloom</span>`);
    }

    if (issues.length === 0) {
      el.innerHTML = `<span style="color:var(--status-ok);">&#10003; Recipe looks good! Total water: ${totalWater}ml</span>`;
    } else {
      el.innerHTML = issues.join('<br>');
    }
  }

  // Save
  document.getElementById('btn-save').addEventListener('click', () => {
    Toast.success('Recipe saved successfully!');
    setTimeout(() => { window.location.href = nav(`/recipe/${id}`); }, 1000);
  });

  // Cancel
  document.getElementById('btn-cancel').addEventListener('click', () => {
    window.location.href = nav(`/recipe/${id}`);
  });

  renderStages();
})();
