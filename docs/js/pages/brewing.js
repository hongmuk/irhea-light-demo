/* Brewing Page Logic */
(async function () {
  // Only run on brewing page (not complete)
  if (!document.getElementById('brew-illustration')) return;

  const recipes = await api('recipes');
  // Use first recipe as default or get from query param
  const params = new URLSearchParams(window.location.search);
  const recipeId = parseInt(params.get('recipe')) || 1;
  const recipe = recipes.find(r => r.id === recipeId) || recipes[0];

  // Set recipe info
  document.getElementById('brew-recipe-name').textContent = recipe.name;
  document.getElementById('brew-recipe-info').textContent =
    `${recipe.dripper} \u00B7 ${recipe.coffeeWeight}g / ${recipe.waterWeight}ml \u00B7 ${recipe.waterTemp}°C`;
  document.getElementById('brew-spout').textContent = 'Spout 1';

  // SVG elements
  const liquid = document.getElementById('bp-liquid');
  const liquidWave = document.getElementById('bp-liquid-wave');
  const stream = document.getElementById('bp-stream');
  const spirals = document.getElementById('bp-spirals');
  const steam = document.getElementById('bp-steam');
  const progressBar = document.getElementById('bp-progress-bar');
  const progressPct = document.getElementById('bp-progress-pct');

  // Server interior: liquid fills from y=339 upward to y=240
  const LIQUID_BOTTOM = 339;
  const LIQUID_MAX_H = 99;

  // Stage timeline
  createTimeline('#brew-stages-bar', recipe.stages);

  // Calculate totals
  const totalDuration = recipe.stages.reduce((s, st) => s + st.time, 0);
  const totalWater = recipe.stages.reduce((s, st) => s + st.waterAmount, 0);

  document.getElementById('brew-remaining').textContent = formatTime(totalDuration);

  // Simulate brewing
  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed += 0.5;
    const progress = Math.min((elapsed / totalDuration) * 100, 100);

    // Update liquid level
    const h = (progress / 100) * LIQUID_MAX_H;
    const y = LIQUID_BOTTOM - h;
    liquid.setAttribute('y', y);
    liquid.setAttribute('height', h);

    // Show liquid wave surface once enough liquid
    if (h > 4) {
      liquidWave.setAttribute('cy', y);
      liquidWave.setAttribute('opacity', '0.5');
    }

    // Update progress bar
    progressBar.style.width = progress + '%';
    progressPct.textContent = Math.round(progress) + '%';

    // Find current stage
    let stageElapsed = 0;
    let currentStage = recipe.stages[0];
    for (const stage of recipe.stages) {
      stageElapsed += stage.time;
      if (elapsed <= stageElapsed) {
        currentStage = stage;
        break;
      }
    }

    // Show/hide stream & spiral based on pour vs pause
    const isPausing = currentStage.type === 'pause';
    if (isPausing) {
      stream.classList.remove('bp-stream-active');
      spirals.classList.remove('bp-spirals-active');
    } else {
      stream.classList.add('bp-stream-active');
      spirals.classList.add('bp-spirals-active');
    }

    // Update display
    document.getElementById('brew-stage').textContent = currentStage.label;
    document.getElementById('brew-elapsed').textContent = formatTime(Math.floor(elapsed));
    document.getElementById('brew-remaining').textContent = formatTime(Math.max(0, Math.floor(totalDuration - elapsed)));

    // Simulated real-time values
    const temp = recipe.waterTemp + (Math.random() - 0.5) * 1;
    const flow = isPausing ? 0 : (3.5 + (Math.random() - 0.5) * 0.5);
    const waterPoured = Math.min(Math.floor((elapsed / totalDuration) * totalWater), totalWater);

    document.getElementById('brew-temp').textContent = `${temp.toFixed(1)}°C`;
    document.getElementById('brew-flow').textContent = `${flow.toFixed(1)} ml/s`;
    document.getElementById('brew-water').textContent = `${waterPoured} ml`;

    if (progress >= 100) {
      clearInterval(interval);
      // Hide stream & spiral, enhance steam
      stream.classList.remove('bp-stream-active');
      spirals.classList.remove('bp-spirals-active');
      steam.classList.add('bp-steam-enhanced');
      Toast.success('Brewing complete!');
      setTimeout(() => {
        window.location.href = nav('/brewing/complete');
      }, 2000);
    }
  }, 500);
})();
