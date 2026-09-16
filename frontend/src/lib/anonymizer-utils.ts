export interface AnonymizerRules {
  maskEmails?: boolean;
  maskPhones?: boolean;
  maskCreditCards?: boolean;
  maskSsn?: boolean;
  normalizeDates?: boolean;
  trimWhitespace?: boolean;
  deduplicateRows?: boolean;
}

export interface AnonymizeResult {
  headers: string[];
  rows: Record<string, any>[];
  stats: {
    totalRows: number;
    maskedCells: number;
    rowsRemoved: number;
  };
}

// Regex patterns
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_REGEX = /(?:^|[^\d])(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)/g;
const CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;

export function maskEmail(str: string): string {
  return str.replace(EMAIL_REGEX, (match) => {
    const [user, domain] = match.split("@");
    if (!domain) return match;
    const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0]}***`;
    return `${maskedUser}@${domain}`;
  });
}

export function maskPhone(str: string): string {
  return str.replace(PHONE_REGEX, (match) => {
    const prefix = match.match(/^[^\d(]/)?.[0] || "";
    const digits = match.replace(/\D/g, "");
    const last4 = digits.slice(-4);
    return `${prefix}(***) ***-${last4}`;
  });
}

export function maskCreditCard(str: string): string {
  return str.replace(CARD_REGEX, (match) => {
    const digits = match.replace(/\D/g, "");
    const last4 = digits.slice(-4);
    return `****-****-****-${last4}`;
  });
}

export function maskSsn(str: string): string {
  return str.replace(SSN_REGEX, (match) => {
    const digits = match.replace(/\D/g, "");
    const last4 = digits.slice(-4);
    return `***-**-${last4}`;
  });
}

export function normalizeDateValue(val: string): string {
  if (typeof val !== "string") return val;
  const trimmed = val.trim();
  const ymd = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const mdy = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return val;
}

export function anonymizeTable(
  headers: string[],
  rows: Record<string, any>[],
  rules: AnonymizerRules
): AnonymizeResult {
  let maskedCount = 0;

  // Process cell transformations
  let processedRows = rows.map((row) => {
    const newRow: Record<string, any> = {};

    for (const header of headers) {
      let val = row[header];

      if (typeof val === "string") {
        const originalVal = val;

        if (rules.trimWhitespace) {
          val = val.trim();
        }

        if (rules.maskEmails && EMAIL_REGEX.test(val)) {
          val = maskEmail(val);
        }

        if (rules.maskPhones && PHONE_REGEX.test(val)) {
          val = maskPhone(val);
        }

        if (rules.maskCreditCards && CARD_REGEX.test(val)) {
          val = maskCreditCard(val);
        }

        if (rules.maskSsn && SSN_REGEX.test(val)) {
          val = maskSsn(val);
        }

        if (rules.normalizeDates) {
          val = normalizeDateValue(val);
        }

        if (val !== originalVal) {
          maskedCount++;
        }
      }

      newRow[header] = val;
    }

    return newRow;
  });

  // Deduplicate rows if requested
  const initialCount = processedRows.length;
  if (rules.deduplicateRows) {
    const seen = new Set<string>();
    processedRows = processedRows.filter((r) => {
      const key = JSON.stringify(r);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const rowsRemoved = initialCount - processedRows.length;

  return {
    headers,
    rows: processedRows,
    stats: {
      totalRows: processedRows.length,
      maskedCells: maskedCount,
      rowsRemoved,
    },
  };
}
