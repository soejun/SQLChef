import * as duckdb from "@duckdb/duckdb-wasm";

const ALL_BUNDLES = duckdb.getJsDelivrBundles();

let db = null;
let connection = null;
let initializing = null; // New flag to track initialization

function pickExtendedBundle(bundles) {
  if (bundles.eh_parallel) {
    return bundles.eh_parallel;
  }
  if (bundles.eh) {
    return bundles.eh;
  }
  // Fallback to default
  return duckdb.selectBundle(bundles);
}

function arrowTableToObjects(arrowTable) {
  const arrowRows = arrowTable.toArray();
  return arrowRows.map((row) => row.toJSON());
}

export async function initDuckDB() {
  if (db && connection) {
    return { db, connection };
  }
  if (initializing) {
    // If already initializing, wait for it to complete
    return initializing;
  }

  initializing = (async () => {
    const chosen = pickExtendedBundle(ALL_BUNDLES);

    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${chosen.mainWorker}");`], {
        type: "text/javascript",
      })
    );
    const worker = new Worker(workerUrl);
    URL.revokeObjectURL(workerUrl);

    const logger = new duckdb.ConsoleLogger();
    db = new duckdb.AsyncDuckDB(logger, worker);

    await db.instantiate(chosen.mainModule, chosen.pthreadWorker);
    connection = await db.connect();
    return { db, connection };
  })();

  try {
    const result = await initializing;
    return result;
  } finally {
    initializing = null;
  }
}

export async function executeQuery(sql) {
  if (!connection) {
    await initDuckDB();
  }
  const arrowTable = await connection.query(sql);
  return arrowTableToObjects(arrowTable);
}

export async function closeDuckDB() {
  if (connection) {
    await connection.close();
    connection = null;
  }
  if (db) {
    await db.terminate();
    db = null;
  }
}
