/* Settings Page Logic */
(async function () {
  const env = await api('common-env');

  // Temp slider
  const tempSlider = document.getElementById('temp-slider');
  const tempDisplay = document.getElementById('temp-display');
  const currentTemp = document.getElementById('current-temp');
  tempSlider.value = env.boiler.targetTemp;
  tempDisplay.textContent = `${env.boiler.targetTemp}°C`;
  currentTemp.textContent = env.boiler.targetTemp;

  tempSlider.addEventListener('input', () => {
    tempDisplay.textContent = `${tempSlider.value}°C`;
  });
  tempSlider.addEventListener('change', () => {
    currentTemp.textContent = tempSlider.value;
    Toast.success(`Boiler target set to ${tempSlider.value}°C`);
  });

  // Drain toggle
  document.getElementById('drain-toggle').checked = env.drain.autoMode;
  document.getElementById('drain-toggle').addEventListener('change', (e) => {
    Toast.info(`Auto drain ${e.target.checked ? 'enabled' : 'disabled'}`);
  });

  // Rinse toggle
  document.getElementById('rinse-toggle').checked = env.rinse.autoMode;
  document.getElementById('rinse-toggle').addEventListener('change', (e) => {
    Toast.info(`Auto rinse ${e.target.checked ? 'enabled' : 'disabled'}`);
  });

  // Manual drain/rinse
  document.getElementById('btn-drain').addEventListener('click', () => {
    Toast.info('Drain cycle started...');
    setTimeout(() => Toast.success('Drain cycle complete'), 3000);
  });
  document.getElementById('btn-rinse').addEventListener('click', () => {
    Toast.info('Rinse cycle started...');
    setTimeout(() => Toast.success('Rinse cycle complete'), 2000);
  });

  // Brightness
  const brightnessSlider = document.getElementById('brightness-slider');
  const brightnessDisplay = document.getElementById('brightness-display');
  brightnessSlider.value = env.displayBrightness;
  brightnessDisplay.textContent = `${env.displayBrightness}%`;
  brightnessSlider.addEventListener('input', () => {
    brightnessDisplay.textContent = `${brightnessSlider.value}%`;
  });

  // Water threshold
  const waterSlider = document.getElementById('water-threshold');
  const waterDisplay = document.getElementById('water-threshold-display');
  waterSlider.value = env.waterLevelAlarmThreshold;
  waterDisplay.textContent = `${env.waterLevelAlarmThreshold}%`;
  waterSlider.addEventListener('input', () => {
    waterDisplay.textContent = `${waterSlider.value}%`;
  });

  // Sound toggle
  document.getElementById('sound-toggle').checked = env.soundEnabled;

  // Language & Dripper
  document.getElementById('lang-select').value = env.language;
  document.getElementById('dripper-select').value = env.defaultDripper;

  document.getElementById('lang-select').addEventListener('change', (e) => {
    Toast.info(`Language set to ${e.target.options[e.target.selectedIndex].text}`);
  });
  document.getElementById('dripper-select').addEventListener('change', (e) => {
    Toast.info(`Default dripper set to ${e.target.value}`);
  });
})();
