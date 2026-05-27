// ORP index by letter count (0-14+)
const ORP_TABLE = [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4];

export function getORPIndex(word) {
  const letterCount = [...word].filter(c => /[a-zA-ZäöüÄÖÜß]/.test(c)).length;
  return ORP_TABLE[Math.min(letterCount, 14)];
}

export function splitWordForORP(word) {
  if (!word || word.length === 0) return ['', ' ', ''];

  const hasLetters = [...word].some(c => /[a-zA-ZäöüÄÖÜß]/.test(c));
  if (!hasLetters) {
    const mid = Math.floor(word.length / 2);
    return [word.slice(0, mid), word[mid] || ' ', word.slice(mid + 1)];
  }

  const targetIndex = getORPIndex(word);
  let lettersSeen = 0;

  for (let i = 0; i < word.length; i++) {
    if (/[a-zA-ZäöüÄÖÜß]/.test(word[i])) {
      if (lettersSeen === targetIndex) {
        return [word.slice(0, i), word[i], word.slice(i + 1)];
      }
      lettersSeen++;
    }
  }

  return [word.slice(0, -1), word.slice(-1), ''];
}

export function getDurationMultiplier(word) {
  if (/[.!?…][\s"»]*$/.test(word)) return 2.2;
  if (/[,;:][\s]*$/.test(word)) return 1.6;
  if (/[—–]/.test(word)) return 1.3;
  if (word.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').length <= 2) return 0.85;
  return 1.0;
}

export function tokenize(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0);
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function scoreRecall(userInput, keywords) {
  if (!userInput || userInput.trim().length === 0) return 0;
  const inputWords = userInput.toLowerCase().split(/[\s,;.!?]+/).filter(Boolean);
  let hits = 0;
  for (const kw of keywords) {
    const kwL = kw.toLowerCase();
    const found = inputWords.some(w =>
      w === kwL ||
      w.includes(kwL) ||
      kwL.includes(w) ||
      (w.length >= 4 && levenshtein(w, kwL) <= 1)
    );
    if (found) hits++;
  }
  return keywords.length > 0 ? hits / keywords.length : 0;
}
