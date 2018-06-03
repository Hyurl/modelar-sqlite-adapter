var assert = require("assert");
var DB = require("modelar").DB;
var config = require("./config/db");

describe("DB.init()", function () {
    it("should initiate the DB class as expected", function () {
        DB.init(config);

        assert.deepEqual(DB.config, Object.assign({}, config, {
            host: "",
            port: "",
            user: "",
            password: "",
            charset: "utf8",
            connectionString: "",
            max: 50,
            protocol: "TCPIP",
            ssl: null,
            timeout: 5000
        }));
    });
});