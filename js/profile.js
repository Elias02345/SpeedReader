const KEY = 'speedreader-profile';

export function createProfile({ baselineWpm, maxWpm, recommendedWpm, baselineResults, rampResults, confirmResult, durationSeconds, lang, screenHz }) {
  return {
    version: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lang: lang || 'de',
    screenHz: screenHz || 60,
    baselineWpm,
    maxWpm,
    recommendedWpm,
    calibrationScore: confirmResult?.score ?? 0,
    durationSeconds,
    baselineResults,
    rampResults,
    confirmResult,
    preferences: {
      punctuationDelays: true,
      showProgress: true,
      fontSize: 'medium',
    }
  };
}

export function saveToStorage(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
    return true;
  } catch { return false; }
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearStorage() {
  localStorage.removeItem(KEY);
}

export function downloadProfile(profile) {
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `speedreader-profil-${new Date().toISOString().slice(0, 10)}.json`
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importProfile(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.version || typeof data.recommendedWpm !== 'number') {
          reject(new Error('invalid_format'));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error('parse_error'));
      }
    };
    fr.onerror = () => reject(new Error('read_error'));
    fr.readAsText(file);
  });
}
