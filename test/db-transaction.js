var assert = require("assert");
var DB = require("modelar").DB;
var config = require("./config/db");

describe("DB.prototype.transaction()", function () {
    it("should sequentially run the SQLs in a transaction as expected", function (done) {
        var db = new DB(config),
            insertId = 0,
            insertion = {
                sql: "insert into `users` (`name`, `email`, `password`) values (?, ?, ?)",
                bindings: ["Ayon Lee", "i@hyurl.com", "12345"],
            },
            selection = {
                sql: "select * from `users` where `id` = ?",
                bindings: [0],
            },
            update = {
                sql: "update `users` set `name` = ?, `email` = ? where id = ?",
                bindings: ["Ayonium", "ayon@hyurl.com", 0],
            },
            replaceQuestionMark = function (sql, bindings) {
                for (var data of bindings) {
                    sql = sql.replace("?", typeof data == "string" ? `'${data}'` : data);
                }

                return sql;
            };

        db.transaction(function (db) {
            // this query will be committed.
            return db.query(insertion.sql, insertion.bindings).then(function (db) {
                assert(typeof db.insertId == "number" && db.insertId > 0);
                assert.equal(replaceQuestionMark(db.sql, db.bindings), replaceQuestionMark(insertion.sql, insertion.bindings));

                insertId = selection.bindings[0] = update.bindings[2] = db.insertId;
                return db;
            });
        }).then(function (db) {
            return db.query(selection.sql, selection.bindings).then(function () {
                assert(Array.isArray(db.data) && db.data.length == 1);
                assert.equal(typeof db.data[0].id, "number");
                assert.deepStrictEqual({
                    id: db.data[0].id,
                    name: db.data[0].name,
                    email: db.data[0].email,
                    password: db.data[0].password
                }, {
                        id: insertId,
                        name: insertion.bindings[0],
                        email: insertion.bindings[1],
                        password: insertion.bindings[2]
                    });

                return db;
            });
        }).then(function (db) {
            return db.transaction(function () {
                // this query will be rolled back since an error occurred.
                return db.query(update.sql, update.bindings).then(function () {
                    throw new Error("This error prevent committing the query.");
                });
            }).catch(function (err) {
                return db.query(selection.sql, selection.bindings).then(function () {
                    db.close();

                    assert(Array.isArray(db.data) && db.data.length == 1);
                    assert.equal(typeof db.data[0].id, "number");
                    assert.deepStrictEqual({
                        id: db.data[0].id,
                        name: db.data[0].name,
                        email: db.data[0].email,
                        password: db.data[0].password
                    }, {
                            id: insertId,
                            name: insertion.bindings[0],
                            email: insertion.bindings[1],
                            password: insertion.bindings[2]
                        });

                    return db;
                }).catch(function (err) {
                    db.close();
                    done(err);
                });
            });
        }).then(function (db) {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});