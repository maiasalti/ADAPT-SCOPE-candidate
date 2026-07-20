type Row = Record<string, any>;

function initialPolicies(): Row[] {
  return [
    { id: 'pol-1', holderName: 'Jane Doe', premium: 120, active: true },
    { id: 'pol-2', holderName: 'John Smith', premium: 80, active: true },
  ];
}

function initialClaims(): Row[] {
  return [{ id: 'clm-1', policyId: 'pol-1', amount: 500, status: 'submitted' }];
}

let tables: Record<string, Row[]> = {
  policies: initialPolicies(),
  claims: initialClaims(),
};

export function resetDb(): void {
  tables = { policies: initialPolicies(), claims: initialClaims() };
}

function parseValue(raw: string, params: unknown[], cursor: { i: number }): unknown {
  if (raw === '?') return params[cursor.i++];
  if (/^'.*'$/.test(raw)) return raw.slice(1, -1);
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  return raw;
}

/**
 * Minimal parameterized query helper — the only approved way to touch the
 * in-memory tables. Supports:
 *   query('SELECT * FROM <table> WHERE <col> = ?', [value])
 *   query('UPDATE <table> SET <col> = ?[, <col> = ?...] WHERE <col> = ?', [values..., whereValue])
 * Never interpolate values into `sql` directly — always pass them via `params`.
 */
export function query(sql: string, params: unknown[] = []): Row[] {
  const cursor = { i: 0 };

  const select = sql.match(/^SELECT \* FROM (\w+) WHERE (\w+)\s*=\s*(.+)$/i);
  if (select) {
    const [, table, column, rawValue] = select;
    const value = parseValue(rawValue.trim(), params, cursor);
    return (tables[table] ?? []).filter(row => row[column] === value);
  }

  const update = sql.match(/^UPDATE (\w+) SET (.+) WHERE (\w+)\s*=\s*(.+)$/i);
  if (update) {
    const [, table, setClause, whereColumn, rawWhereValue] = update;
    const assignments = setClause.split(',').map(pair => {
      const [col, rawVal] = pair.split('=').map(s => s.trim());
      return { col, rawVal };
    });
    const setValues = assignments.map(a => parseValue(a.rawVal, params, cursor));
    const whereValue = parseValue(rawWhereValue.trim(), params, cursor);
    const rows = (tables[table] ?? []).filter(row => row[whereColumn] === whereValue);
    for (const row of rows) {
      assignments.forEach((a, i) => {
        row[a.col] = setValues[i];
      });
    }
    return rows;
  }

  throw new Error(`Unsupported query shape: ${sql}`);
}
