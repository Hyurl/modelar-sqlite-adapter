var assert = require("assert");
var DB = require("modelar").DB;
var Model = require("modelar").Model;
var config = require("./config/db");
var values = require("lodash/values");

describe("Model.prototype.insert()", function () {
    it("should insert a model to database as expected", function (done) {
        var db = new DB(config),
            fields = ["id", "name", "email", "password", "age", "score"],
            data = {
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 90
            },
            model = new Model(null, {
                table: "users",
                primary: "id",
                fields: fields,
                searchable: ["name", "email"]
            });

        model.use(db).insert(data).then(function () {
            assert.equal(model.sql, "insert into `users` (`name`, `email`, `password`, `age`, `score`) values (?, ?, ?, ?, ?)");
            assert.deepStrictEqual(model.bindings, values(data));
            assert.deepStrictEqual(model.data, Object.assign({ id: model.insertId }, data));
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});