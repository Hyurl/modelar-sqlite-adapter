import { Adapter, DB, Table } from "modelar";
import { Pool, Connection } from "./pool";
import assign = require("lodash/assign");

export class SqliteAdapter extends Adapter {
    connection: Connection;
    private inTransaction: boolean = false;

    connect(db: DB): Promise<DB> {
        if (SqliteAdapter.Pools[db.dsn] === undefined) {
            let config: any = assign({}, db.config);
            config.acquireTimeout = config.timeout;
            SqliteAdapter.Pools[db.dsn] = new Pool(db.config.database, config);
        }

        return new Promise((resolve, reject) => {
            SqliteAdapter.Pools[db.dsn].acquire((err, connection) => {
                if (err) {
                    reject(err);
                } else {
                    this.connection = connection;
                    resolve(db);
                }
            });
        });
    }

    query(db: DB, sql: string, bindings?: any[]): Promise<DB> {
        return new Promise((resolve, reject) => {
            if (db.command == "select" || db.command == "pragma") {
                // Deal with select or pragma statements.
                let statement = this.connection.prepare(sql);
                statement.all(bindings, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        db.data = rows || [];
                        resolve(db);
                    }
                    statement.finalize();
                });
            } else {
                if (bindings) {
                    let statement = this.connection.prepare(sql);
                    statement.run(bindings, function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            db.insertId = this.lastID;
                            db.affectedRows = this.changes;
                            resolve(db);
                        }
                        statement.finalize();
                    });
                } else {
                    this.connection.exec(sql, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            if (db.command == "begin") {
                                this.inTransaction = true;
                            } else if (db.command == "commit"
                                || db.command == "rollback") {
                                this.inTransaction = false;
                            }
                            resolve(db);
                        }
                    });
                }
            }
        });
    }

    release(): void {
        if (this.connection) {
            if (this.inTransaction) {
                this.connection.exec("rollback", () => {
                    this.inTransaction = false;
                    return this.release();
                });
            } else {
                this.connection.release();
                this.connection = null;
            }
        }
    }

    close(): void {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    }

    static close(): void {
        for (let i in SqliteAdapter.Pools) {
            SqliteAdapter.Pools[i].close();
            delete SqliteAdapter.Pools[i];
        }
    }

    getDDL(table: Table): string {
        var columns: string[] = [];

        for (let key in table.schema) {
            let field = table.schema[key];

            if (field.primary && field.autoIncrement) {
                if (field.type.toLowerCase() !== "integer") {
                    field.type = "integer";
                    field.length = 0;
                }
                table["_autoIncrement"] = field.autoIncrement;
            }

            let type = field.type;
            if (field.length instanceof Array) {
                type += "(" + field.length.join(",") + ")";
            } else if (field.length) {
                type += "(" + field.length + ")";
            }

            let column = table.backquote(field.name) + " " + type;

            if (field.primary)
                column += " primary key";

            if (field.autoIncrement instanceof Array)
                column += " autoincrement";

            if (field.unique)
                column += " unique";

            if (field.unsigned)
                column += " unsigned";

            if (field.notNull)
                column += " not null";

            if (field.default === null)
                column += " default null";
            else if (field.default !== undefined)
                column += " default " + table.quote(field.default);

            if (field.comment)
                column += " comment " + table.quote(field.comment);

            if (field.foreignKey && field.foreignKey.table) {
                column += " references " +
                    table.backquote(field.foreignKey.table) +
                    " (" + table.backquote(field.foreignKey.field) + ")" +
                    " on delete " + field.foreignKey.onDelete +
                    " on update " + field.foreignKey.onUpdate;
            };
            columns.push(column);
        }

        return "create table " + table.backquote(table.name) +
            " (\n\t" + columns.join(",\n\t") + "\n)";
    }

    async create(table: Table): Promise<Table> {
        var ddl = table.getDDL(),
            increment: [number, number] = table["_autoIncrement"];

        await table.query("pragma foreign_keys = on");
        await table.query(ddl);
        await table.query("pragma foreign_keys = off");

        if (increment) {
            var seqSql = "insert into sqlite_sequence (`name`, `seq`) " +
                `values ('${table.name}', ${increment[0] - 1})`;

            await table.query(seqSql);

            table.sql = ddl + ";\n" + seqSql;
        }

        return table;
    }
}

export namespace SqliteAdapter {
    export const Pools: { [dsn: string]: Pool } = {};
}

export default SqliteAdapter;