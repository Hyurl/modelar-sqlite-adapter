var assert = require("assert");
var Query = require("modelar").Query;

describe("Query.prototype.whereIn()", function () {
    describe("whereIn(field: string, values: string[] | number[])", function () {
        it("should generate SQL with one where in clause", function () {
            var query = new Query("users").select("*").whereIn("id", [1, 10]);
            assert.equal(query.getSelectSQL(), "select * from `users` where `id` in (?, ?)");
            assert.deepEqual(query["_bindings"], [1, 10]);
        });
    });

    describe("whereIn(field: string, nested: (query: Query) => void)", function () {
        it("should generate SQL with a nested where in clause", function () {
            var query = new Query("users").select("*");
            query.whereIn("id", function (_query) {
                _query.select("id").from("users").where("name", "Ayon Lee");
            });
            assert.equal(query.getSelectSQL(), "select * from `users` where `id` in (select `id` from `users` where `name` = ?)");
            assert.deepEqual(query["_bindings"], ["Ayon Lee"]);
        });
    });
});

describe("Query.prototype.whereNotIn()", function () {
    describe("whereNotIn(field: string, values: string[] | number[])", function () {
        it("should generate SQL with one where not in clause", function () {
            var query = new Query("users").select("*").whereNotIn("id", [1, 10]);
            assert.equal(query.getSelectSQL(), "select * from `users` where `id` not in (?, ?)");
            assert.deepEqual(query["_bindings"], [1, 10]);
        });
    });

    describe("whereNotIn(field: string, nested: (query: Query) => void)", function () {
        it("should generate SQL with a nested where not in clause", function () {
            var query = new Query("users").select("*").whereNotIn("id", function (_query) {
                _query.select("id").from("users").where("name", "Ayon Lee");
            });
            assert.equal(query.getSelectSQL(), "select * from `users` where `id` not in (select `id` from `users` where `name` = ?)");
            assert.deepEqual(query["_bindings"], ["Ayon Lee"]);
        });
    });
});

describe("Query.prototype.orWhereIn()", function () {
    describe("orWhereIn(field: string, values: string[] | number[])", function () {
        it("should generate SQL with one where or in clause", function () {
            var query = new Query("users")
                .select("*")
                .where("name", "Luna")
                .orWhereIn("id", [1, 10]);

            assert.equal(query.getSelectSQL(), "select * from `users` where `name` = ? or `id` in (?, ?)");
            assert.deepEqual(query["_bindings"], ["Luna", 1, 10]);
        });
    });

    describe("orWhereIn(field: string, nested: (query: Query) => void)", function () {
        it("should generate SQL with a nested where or in clause", function () {
            var query = new Query("users")
                .select("*")
                .where("name", "Luna")
                .orWhereIn("id", function (_query) {
                    _query.select("id").from("users").where("name", "Ayon Lee");
                });

            assert.equal(query.getSelectSQL(), "select * from `users` where `name` = ? or `id` in (select `id` from `users` where `name` = ?)");
            assert.deepEqual(query["_bindings"], ["Luna", "Ayon Lee"]);
        });
    });
});

describe("Query.prototype.orWhereNotIn()", function () {
    describe("orWhereNotIn(field: string, values: string[] | number[])", function () {
        it("should generate SQL with one where or not in clause", function () {
            var query = new Query("users")
                .select("*")
                .where("name", "Luna")
                .orWhereNotIn("id", [1, 10]);

            assert.equal(query.getSelectSQL(), "select * from `users` where `name` = ? or `id` not in (?, ?)");
            assert.deepEqual(query["_bindings"], ["Luna", 1, 10]);
        });
    });

    describe("orWhereNotIn(field: string, nested: (query: Query) => void)", function () {
        it("should generate SQL with a nested where or not in clause", function () {
            var query = new Query("users")
                .select("*")
                .where("name", "Luna")
                .orWhereNotIn("id", function (_query) {
                    _query.select("id").from("users").where("name", "Ayon Lee");
                });

            assert.equal(query.getSelectSQL(), "select * from `users` where `name` = ? or `id` not in (select `id` from `users` where `name` = ?)");
            assert.deepEqual(query["_bindings"], ["Luna", "Ayon Lee"]);
        });
    });
});