/**
 * Spreadsheet fragment parser for Themis.
 *
 * Parses tab-separated spreadsheet data pasted by the user.
 * Format per row: BandName \t Vo \t L.Gt \t B.Gt \t Ba \t Dr \t Key \t Time
 *
 * Parsing rules:
 * - Parse from the RIGHT to allow spaces in band names.
 * - Rightmost column is estimated time (minutes). Strip non-numeric chars.
 * - If time looks like "5分30秒" (num-NaN-num pattern), throw a specific error.
 * - Each row must have at least 8 tab-separated chunks.
 * - Cells (except band name) must not contain spaces.
 * - The empty slot indicator is user-configurable (e.g., "n/a", "-").
 */

/**
 * @typedef {Object} ParsedBand
 * @property {string} name - Band name
 * @property {string[]} members - 6-element array [Vo, L.Gt, B.Gt, Ba, Dr, Key]
 * @property {number} estimatedTime - Estimated performance time in minutes
 */

/**
 * @typedef {Object} ParseError
 * @property {number} row - 1-indexed row number
 * @property {string} message - Human-readable error message (Japanese)
 */

/**
 * @typedef {Object} ParseResult
 * @property {ParsedBand[]} bands - Successfully parsed bands
 * @property {ParseError[]} errors - Errors encountered
 * @property {string[]} players - Unique player names extracted (excluding empty slot indicator)
 */

/**
 * Parse a spreadsheet fragment into band data.
 *
 * @param {string} text - Raw pasted text (tab-separated)
 * @param {string} emptyIndicator - The string that represents an empty slot (e.g., "n/a")
 * @returns {ParseResult}
 */
export function parseSpreadsheet(text, emptyIndicator) {
  const bands = [];
  const errors = [];
  const playerSet = new Set();

  const lines = text.split('\n').filter((line) => line.trim() !== '');

  for (let i = 0; i < lines.length; i++) {
    const rowNum = i + 1;
    const line = lines[i];

    // Split by tab
    const chunks = line.split('\t');

    // Must have at least 8 chunks
    if (chunks.length < 8) {
      errors.push({
        row: rowNum,
        message: `${rowNum}行目: 列数が不足しています（${chunks.length}列）。最低8列（バンド名、6パート、時間）が必要です。`,
      });
      continue;
    }

    // Parse from the right
    const rawTime = chunks[chunks.length - 1].trim();
    const rawKey = chunks[chunks.length - 2].trim();
    const rawDr = chunks[chunks.length - 3].trim();
    const rawBa = chunks[chunks.length - 4].trim();
    const rawBGt = chunks[chunks.length - 5].trim();
    const rawLGt = chunks[chunks.length - 6].trim();
    const rawVo = chunks[chunks.length - 7].trim();

    // Band name is everything to the left (joined back with tabs in case of extra columns)
    const bandNameParts = chunks.slice(0, chunks.length - 7);
    const bandName = bandNameParts.join('\t').trim();

    if (!bandName) {
      errors.push({
        row: rowNum,
        message: `${rowNum}行目: バンド名が空です。`,
      });
      continue;
    }

    // Validate: member cells must not contain spaces (except band name)
    const memberCells = [
      { label: 'Vo.', value: rawVo },
      { label: 'L.Gt', value: rawLGt },
      { label: 'B.Gt', value: rawBGt },
      { label: 'Ba.', value: rawBa },
      { label: 'Dr.', value: rawDr },
      { label: 'Key.', value: rawKey },
    ];

    let hasSpaceError = false;
    for (const cell of memberCells) {
      if (cell.value.includes(' ')) {
        errors.push({
          row: rowNum,
          message: `${rowNum}行目: ${cell.label}のセル「${cell.value}」にスペースが含まれています。セル内にスペースは使用できません。`,
        });
        hasSpaceError = true;
      }
    }
    if (hasSpaceError) continue;

    // Parse estimated time
    const timeResult = parseTime(rawTime, rowNum);
    if (timeResult.error) {
      errors.push(timeResult.error);
      continue;
    }

    const members = [rawVo, rawLGt, rawBGt, rawBa, rawDr, rawKey];

    // Collect unique player names
    for (const m of members) {
      if (m && m !== emptyIndicator) {
        playerSet.add(m);
      }
    }

    bands.push({
      name: bandName,
      members,
      estimatedTime: timeResult.value,
    });
  }

  return {
    bands,
    errors,
    players: Array.from(playerSet).sort(),
  };
}

/**
 * Parse a time string into minutes.
 * Strips non-numeric characters. Detects ambiguous patterns like "5分30秒".
 *
 * @param {string} raw - Raw time string (e.g., "5分", "11", "5分30秒")
 * @param {number} rowNum - 1-indexed row number for error messages
 * @returns {{value?: number, error?: ParseError}}
 */
function parseTime(raw, rowNum) {
  const trimmed = raw.trim();

  if (!trimmed) {
    return {
      error: {
        row: rowNum,
        message: `${rowNum}行目: 演奏時間が空です。`,
      },
    };
  }

  // Check for ambiguous pattern: num + non-numeric + num (e.g., "5分30秒")
  // Match: digits, then non-digits, then digits again
  if (/\d+\D+\d+/.test(trimmed)) {
    return {
      error: {
        row: rowNum,
        message: `${rowNum}行目: 演奏時間「${trimmed}」が曖昧です。数字が複数含まれているため、どの数字を使用すべきか判断できません。数字のみで入力してください（例: 「5」）。`,
      },
    };
  }

  // Strip all non-numeric characters and parse
  const numStr = trimmed.replace(/\D/g, '');

  if (!numStr) {
    return {
      error: {
        row: rowNum,
        message: `${rowNum}行目: 演奏時間「${trimmed}」に数字が含まれていません。`,
      },
    };
  }

  const value = parseInt(numStr, 10);

  if (value <= 0) {
    return {
      error: {
        row: rowNum,
        message: `${rowNum}行目: 演奏時間は1分以上にしてください。`,
      },
    };
  }

  return { value };
}
