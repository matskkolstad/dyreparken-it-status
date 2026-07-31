// Regelbasert, EKSTRAKTIV oppsummering av Monotree-innlegg – ingen AI.
// Vi genererer ikke ny tekst; vi velger tittel + de viktigste setningene som
// allerede finnes i innlegget. Strategi: alltid ta med ledesetningen (viktig
// info står oftest først i en kunngjøring) + den høyest scorede nøkkelsetningen
// (ordfrekvens-scoring). Robust splitting hindrer at datoer/lister ("16. juni",
// "1.") og forkortelser ("kl. 14:30") kutter setninger på feil sted.

// Vanlige norske stoppord – filtreres bort før frekvens-scoring.
const STOPWORDS = new Set([
  "og", "i", "jeg", "det", "at", "en", "et", "den", "til", "er", "som", "på", "de",
  "med", "han", "av", "ikke", "ikkje", "der", "så", "var", "meg", "seg", "men", "ett",
  "har", "om", "vi", "min", "mitt", "ha", "hadde", "hun", "nå", "over", "da", "ved",
  "fra", "du", "ut", "sin", "dem", "oss", "opp", "man", "kan", "hans", "hvor", "eller",
  "hva", "skal", "selv", "her", "alle", "vil", "bli", "ble", "blitt", "kunne", "inn",
  "når", "være", "kom", "noen", "noe", "ville", "dere", "deres", "kun", "ja", "etter",
  "ned", "skulle", "denne", "for", "deg", "si", "sine", "sitt", "mot", "å", "dette",
  "disse", "uten", "hvordan", "ingen", "din", "ditt", "blir", "samme", "vår", "vårt",
  "hver", "hvem", "hvis", "både", "bare", "enn", "fordi", "før", "mange", "også",
  "slik", "vært", "siden", "litt", "får", "gjerne", "veldig", "helt", "godt", "god",
]);

const GREETING_WORDS = new Set([
  "hei", "heia", "heisann", "hallo", "halla", "hallais", "hallu", "hellu", "yo",
  "god", "morgen", "dag", "kveld", "helg", "alle", "sammen", "folkens", "sann",
  "igjen", "dere", "på", "pa", "folk", "venner", "kollegaer", "hivohoi", "hiv",
]);

// Forkortelser der punktumet IKKE avslutter en setning.
const ABBREVIATIONS = new Set([
  "kl", "feks", "bla", "osv", "dvs", "mm", "ca", "nr", "pga", "ift", "iht",
  "maks", "tlf", "ang", "vha", "evt", "ca", "tom", "fom", "obs",
]);

function clean(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/​/g, "") // zero-width space forekommer i Monotree-tekst
    .replace(/[ \t]+/g, " ")
    .trim();
}

function hasLetters(text: string): boolean {
  return /\p{L}/u.test(text);
}

function words(text: string): string[] {
  return text.toLowerCase().match(/\p{L}[\p{L}\d-]*/gu) ?? [];
}

/** Er teksten bare en hilsen ("Hei!", "Hei alle sammen", "God morgen")? */
function isGreeting(text: string): boolean {
  const ws = words(text);
  if (ws.length === 0 || ws.length > 4) return false;
  return ws.every((w) => GREETING_WORDS.has(w));
}

/** Fjerner en innledende hilsen-setning fra en linje ("Hei alle! Viktig info" → "Viktig info"). */
function stripLeadingGreeting(line: string): string {
  const m = line.match(/^([^.!?]*[.!?]+)\s*(.*)$/u);
  if (m && isGreeting(m[1]!) && m[2]!.trim()) return m[2]!.trim();
  return line;
}

function truncateOnWord(text: string, maxChars: number): string {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  const slice = t.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > maxChars * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[.,;:!?\-–—\s]+$/u, "")} …`;
}

/**
 * Deler tekst i setninger. Et punktum regnes IKKE som setningsslutt når det:
 *  - står rett etter et tall (datoer/lister: "16.", "1."),
 *  - avslutter en kjent forkortelse ("kl.", "f.eks."),
 *  - etterfølges av liten bokstav eller tall (fortsettelse).
 */
function splitSentences(text: string): string[] {
  const t = clean(text.replace(/\n+/g, " "));
  const sentences: string[] = [];
  let start = 0;

  for (let i = 0; i < t.length; i++) {
    const ch = t[i]!;
    if (ch !== "." && ch !== "!" && ch !== "?") continue;

    // Slå sammen gjentatt tegnsetting ("?!", "...").
    let end = i;
    while (end + 1 < t.length && ".!?".includes(t[end + 1]!)) end++;

    const prev = t[i - 1];
    const nextNonSpace = t.slice(end + 1).match(/\S/)?.[0];
    const wordBefore = t.slice(start, i).split(/\s+/).pop()?.toLowerCase().replace(/\./g, "") ?? "";

    const prevIsDigit = prev !== undefined && /\d/.test(prev);
    const isAbbr = ABBREVIATIONS.has(wordBefore);
    // Ny setning kun hvis neste tegn er slutt, stor bokstav eller symbol/emoji
    // (dvs. IKKE liten bokstav eller tall = fortsettelse).
    const startsNew = nextNonSpace === undefined || !/[a-zæøå0-9]/u.test(nextNonSpace);

    if (ch === "." && (prevIsDigit || isAbbr)) {
      i = end;
      continue;
    }
    if (startsNew) {
      const s = t.slice(start, end + 1).trim();
      if (s) sentences.push(s);
      start = end + 1;
    }
    i = end;
  }

  const tail = t.slice(start).trim();
  if (tail) sentences.push(tail);
  return sentences.filter(hasLetters);
}

function wordFrequencies(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const w of words(text)) {
    if (w.length < 3 || STOPWORDS.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  let max = 0;
  for (const v of freq.values()) max = Math.max(max, v);
  if (max > 0) for (const [k, v] of freq) freq.set(k, v / max);
  return freq;
}

function scoreSentence(sentence: string, freq: Map<string, number>): number {
  const content = words(sentence).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  if (content.length === 0) return 0;
  const sum = content.reduce((acc, w) => acc + (freq.get(w) ?? 0), 0);
  // Del på lengde (dempet) så lange setninger ikke automatisk vinner.
  return sum / Math.pow(content.length, 0.6);
}

export type MonotreeSummary = {
  title: string;
  summary: string;
};

/**
 * Lager tittel + ekstraktiv oppsummering av et innlegg.
 * @param raw     Rå body-tekst fra Monotree.
 * @param options maxSentences = antall setninger i oppsummeringen, maxChars = hard øvre grense.
 */
export function summarizePost(
  raw: string,
  options: { maxSentences?: number; maxChars?: number; titleMaxChars?: number } = {},
): MonotreeSummary {
  const { maxSentences = 2, maxChars = 240, titleMaxChars = 90 } = options;
  const text = clean(raw);
  if (!text) return { title: "Uten tittel", summary: "" };

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Tittel = første meningsfulle linje (hopp over rene hilsener/emoji-linjer),
  // og strip en evt. innledende hilsen fra samme linje.
  const titleIdx = lines.findIndex((l) => hasLetters(l) && !isGreeting(l));
  const titleLine = titleIdx >= 0 ? lines[titleIdx]! : lines[0]!;
  const title = truncateOnWord(stripLeadingGreeting(titleLine), titleMaxChars) || "Uten tittel";

  // Kilde for oppsummering = alt meningsfullt innhold ETTER tittel-linjen.
  const restText = clean(
    lines
      .slice(titleIdx >= 0 ? titleIdx + 1 : 1)
      .filter(hasLetters)
      .join(" "),
  );
  if (!restText) return { title, summary: "" };

  // Kandidat-setninger: dropp hilsener og for korte fragmenter ("16.", "1.").
  const allSentences = splitSentences(restText);
  const pool = allSentences.filter(
    (s) => !isGreeting(s) && words(s).length >= 3,
  );
  const candidates = pool.length ? pool : allSentences;

  if (candidates.length <= 1) {
    return { title, summary: truncateOnWord(candidates[0] ?? restText, maxChars) };
  }

  // Alltid med: ledesetningen. I tillegg: høyest scorede nøkkelsetning(er).
  const freq = wordFrequencies(candidates.join(" "));
  const chosen = new Set<number>([0]);
  candidates
    .map((s, i) => ({ i, score: scoreSentence(s, freq) }))
    .filter((x) => x.i !== 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, maxSentences - 1))
    .forEach((x) => chosen.add(x.i));

  const summary = [...chosen]
    .sort((a, b) => a - b)
    .map((i) => candidates[i]!)
    .join(" ");

  return { title, summary: truncateOnWord(summary, maxChars) };
}
