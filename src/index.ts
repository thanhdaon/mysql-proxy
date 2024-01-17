import Elysia from "elysia";
import {
  createPool,
  createConnection,
  type Connection,
  type Pool,
} from "mysql2/promise";
import { env } from "~/env";

async function main() {
  const dbPool = await createDatabasePool();
  const app = new Elysia().state("dbPool", dbPool);

  app.post("/:database/migrate", async ({ params, body, store, set }) => {
    const database = store.dbPool.get(params.database);

    if (database === undefined) {
      set.status = 404;
      return { error: `database ${params.database} not found` };
    }

    const { queries } = body as any;

    const connection = await database.createConnection();
    await connection.query("BEGIN");
    try {
      for (const query of queries) {
        await connection.query(query);
      }
      await connection.query("COMMIT");
    } catch {
      await connection.query("ROLLBACK");
    }
    connection.destroy();

    return { success: true };
  });

  app.post("/:database/query", async ({ params, body, store, set }) => {
    const database = store.dbPool.get(params.database);

    if (database === undefined) {
      set.status = 404;
      return { error: `database ${params.database} not found` };
    }

    const input = body as any;
    const sqlBody = input.sql.replace(/;/g, "");

    if (input.method === "all") {
      const result = await database.assertPool().query({
        sql: sqlBody,
        values: input.params,
        rowsAsArray: true,
        typeCast,
      });

      return result[0];
    }

    if (input.method === "execute") {
      const result = await database.assertPool().query({
        sql: sqlBody,
        values: input.params,
        typeCast,
      });

      return result;
    }

    set.status = 400;
    return { error: `Unknow method value ${input.method}` };
  });

  app.get("/", async ({ store }) => {
    return store.dbPool.getAll();
  });

  app.put("/:database", async ({ params, store }) => {
    await store.dbPool.insert(params.database);
    return { success: true };
  });

  app.delete("/:database", async ({ params, store }) => {
    await store.dbPool.remove(params.database);
    return { success: true };
  });

  app.listen(env.PORT, () => {
    console.log("mysql-proxy-server is running on port", env.PORT);
  });
}

interface Datebase {
  createConnection: () => Promise<Connection>;
  assertPool: () => Pool;
}

async function createDatabasePool() {
  const dbPool = new Map<string, Datebase>();
  const existsDatabase = await showDatabases();

  for (const db of existsDatabase) {
    await insert(db);
  }

  async function insert(database: string) {
    if (dbPool.has(database)) {
      return;
    }
    const connection = await createConnection(env.MYSQL_ROOT_URI);
    await connection.query(`create database if not exists ${database}`);

    const uri = `${env.MYSQL_ROOT_URI}/${database}`;
    const pool = createPool(uri);

    dbPool.set(database, {
      createConnection: async () => {
        return await createConnection(uri);
      },
      assertPool: () => {
        return pool;
      },
    });

    connection.destroy();
  }

  async function remove(database: string) {
    const pool = dbPool.get(database);

    if (pool) {
      await pool.assertPool().end();
      dbPool.delete(database);
      const connection = await createConnection(env.MYSQL_ROOT_URI);
      await connection.query(`drop database if exists ${database}`);
      connection.destroy();
    }
  }

  function get(database: string) {
    return dbPool.get(database);
  }

  function getAll() {
    return Array.from(dbPool.keys());
  }

  async function showDatabases() {
    const connection = await createConnection(env.MYSQL_ROOT_URI);
    const result = await connection.query("show databases");
    const databases = (result[0] as { Database: string }[]).map(
      (db) => db.Database
    );

    return databases.filter((db) => {
      switch (db) {
        case "information_schema":
        case "mysql":
        case "performance_schema":
        case "sys":
          return false;
        default:
          return true;
      }
    });
  }

  return { insert, remove, get, getAll };
}

function typeCast(field: any, next: any) {
  if (
    field.type === "TIMESTAMP" ||
    field.type === "DATETIME" ||
    field.type === "DATE"
  ) {
    return field.string();
  }
  return next();
}

main().catch(console.log);
