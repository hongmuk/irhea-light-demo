/* Brewing Page Logic */
(async function () {
  // Only run on brewing page (not complete)
  if (!document.getElementById('brew-ring')) return;

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

  // Create progress ring
  const ring = createProgressRing('#brew-ring', { size: 280, strokeWidth: 14 });

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

    // Update ring
    ring.update(progress, progress >= 100 ? 'Complete!' : 'Brewing...');

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

    // Update display
    document.getElementById('brew-stage').textContent = currentStage.label;
    document.getElementById('brew-elapsed').textContent = formatTime(Math.floor(elapsed));
    document.getElementById('brew-remaining').textContent = formatTime(Math.max(0, Math.floor(totalDuration - elapsed)));

    // Simulated real-time values
    const temp = recipe.waterTemp + (Math.random() - 0.5) * 1;
    const flow = currentStage.type === 'pause' ? 0 : (3.5 + (Math.random() - 0.5) * 0.5);
    const waterPoured = Math.min(Math.floor((elapsed / totalDuration) * totalWater), totalWater);

    document.getElementById('brew-temp').textContent = `${temp.toFixed(1)}°C`;
    document.getElementById('brew-flow').textContent = `${flow.toFixed(1)} ml/s`;
    document.getElementById('brew-water').textContent = `${waterPoured} ml`;

    if (progress >= 100) {
      clearInterval(interval);
      Toast.success('Brewing complete!');
      setTimeout(() => {
        window.location.href = nav('/brewing/complete');
      }, 2000);
    }
  }, 500);
})();
