var assert = require("assert");
var DB = require("modelar").DB;
var Table = require("modelar").Table;
var config = require("./config/db");

describe("Table.prototype.addColumn()", function () {
    describe("addColumn(name: string)", function () {
        it("should add a column with only the name", function () {
            var table = new Table("users");
            table.addColumn("id");
            
            assert.equal(table._current, "id");
            assert.deepStrictEqual(table.schema, {
                id: {
                    name: "id",
                    type: "",
                    length: 0,
                    notNull: false,
                    default: undefined,
                    primary: false,
                    autoIncrement: false,
                    unsigned: false,
                    unique: false,
                    comment: "",
                    foreignKey: null
                }
            });
        });
    });

    describe("addColumn(name: string, type: number)", function () {
        it("should add a column with the name and the type", function () {
            var table = new Table("users");
            table.addColumn("id", "integer");
            
            assert.equal(table._current, "id");
            assert.deepStrictEqual(table.schema, {
                id: {
                    name: "id",
                    type: "integer",
                    length: 0,
                    notNull: false,
                    default: undefined,
                    primary: false,
                    autoIncrement: false,
                    unsigned: false,
                    unique: false,
                    comment: "",
                    foreignKey: null
                }
            });
        });
    });

    describe("addColumn(name: string, type: number, length: number | [number, number])", function () {
        it("should add a column with the name, the type and the length", function () {
            var table = new Table("users");
            table.addColumn("id").primary().autoIncrement();
            
            assert.equal(table._current, "id");
            assert.deepStrictEqual(table.schema, {
                id: {
                    name: "id",
                    type: "",
                    length: 0,
                    notNull: false,
                    default: undefined,
                    primary: true,
                    autoIncrement: [1, 1],
                    unsigned: false,
                    unique: false,
                    comment: "",
                    foreignKey: null
                }
            });

            table.addColumn("name", "varchar", [4, 32]);
            assert.equal(table._current, "name");
            assert.deepStrictEqual(table.schema, {
                id: {
                    name: "id",
                    type: "",
                    length: 0,
                    notNull: false,
                    default: undefined,
                    primary: true,
                    autoIncrement: [1, 1],
                    unsigned: false,
                    unique: false,
                    comment: "",
                    foreignKey: null
                },
                name: {
                    name: "name",
                    type: "varchar",
                    length: [4, 32],
                    notNull: false,
                    default: undefined,
                    primary: false,
                    autoIncrement: false,
                    unsigned: false,
                    unique: false,
                    comment: "",
                    foreignKey: null
                }
            });

            assert.equal(table.toString(), [
                "create table `users` (",
                "\t`id` integer primary key autoincrement,",
                "\t`name` varchar(4,32)",
                ")"
            ].join("\n"));
        });
    });
});

describe("Table.prototype.primary()", function () {
    it("should add a primary field as expected", function () {
        var table = new Table("users");
        table.addColumn("id").primary();
        assert.deepStrictEqual(table.schema, {
            id: {
                name: "id",
                type: "",
                length: 0,
                notNull: false,
                default: undefined,
                primary: true,
                autoIncrement: false,
                unsigned: false,
                unique: false,
                comment: "",
                foreignKey: null
            }
        });
    });
});

describe("Table.prototype.autoIncrement()", function () {
    describe("autoIncrement()", function () {
        it("should add a primary field as expected", function () {
            var table = new Table("users");
            table.addColumn("id").primary().autoIncrement();
            assert.deepStrictEqual(table.schema, {
                id: {
                    name: "id",
                    type: "",
                    length: 0,
                    notNull: false,
                    default: undefined,
                    primary: true,
                    autoIncrement: [1, 1],
                    unsigned: false,
                    unique: false,
                    comment: "",
                    foreignKey: null
                }
            });
        });
    });

    describe("autoIncrement(start: number, step?: number)", function () {
        it("should add a primary auto-increment field as expected", function () {
            var table = new Table("users");
            table.addColumn("id").primary().autoIncrement(1000);
            assert.deepStrictEqual(table.schema, {
                id: {
                    name: "id",
                    type: "",
                    length: 0,
                    notNull: false,
                    default: undefined,
                    primary: true,
                    autoIncrement: [1000, 1],
                    unsigned: false,
                    unique: false,
                    comment: "",
                    foreignKey: null
                }
            });

            var table2 = new Table("users");
            table2.addColumn("id").primary().autoIncrement(1000, 5);
            assert.deepStrictEqual(table2.schema, {
                id: {
                    name: "id",
                    type: "",
                    length: 0,
                    notNull: false,
                    default: undefined,
                    primary: true,
                    autoIncrement: [1000, 5],
                    unsigned: false,
                    unique: false,
                    comment: "",
                    foreignKey: null
                }
            });
        });
    });
});

describe("Table.prototype.unique()", function () {
    it("should add a unique field as expected", function () {
        var table = new Table("users");
        table.addColumn("id").primary().unique();
        assert.deepStrictEqual(table.schema, {
            id: {
                name: "id",
                type: "",
                length: 0,
                notNull: false,
                default: undefined,
                primary: true,
                autoIncrement: false,
                unsigned: false,
                unique: true,
                comment: "",
                foreignKey: null
            }
        });
    });
});

describe("Table.prototype.default()", function () {
    it("should add a field with default value as expected", function () {
        var table = new Table("users");
        table.addColumn("name", "varchar", 32).default("");
        assert.deepStrictEqual(table.schema, {
            name: {
                name: "name",
                type: "varchar",
                length: 32,
                notNull: false,
                default: "",
                primary: false,
                autoIncrement: false,
                unsigned: false,
                unique: false,
                comment: "",
                foreignKey: null
            }
        });
    });
});

describe("Table.prototype.notNull()", function () {
    it("should add a field with not-null value as expected", function () {
        var table = new Table("users");
        table.addColumn("name", "varchar", 32).notNull();
        assert.deepStrictEqual(table.schema, {
            name: {
                name: "name",
                type: "varchar",
                length: 32,
                notNull: true,
                default: undefined,
                primary: false,
                autoIncrement: false,
                unsigned: false,
                unique: false,
                comment: "",
                foreignKey: null
            }
        });
    });
});

describe("Table.prototype.foreignKey()", function () {
    describe("foreignKey(config: ForeignKeyConfig)", function () {
        it("should add a foreign key as expected", function () {
            var table = new Table("users");
            table.addColumn("country_id", "int", 10).foreignKey({
                table: "country",
                field: "id",
                onUpdate: "no action",
                onDelete: "set null",
            });
            assert.deepStrictEqual(table.schema, {
                country_id: {
                    name: "country_id",
                    type: "int",
                    length: 10,
                    notNull: false,
                    default: undefined,
                    primary: false,
                    autoIncrement: false,
                    unsigned: false,
                    unique: false,
                    comment: "",
                    foreignKey: {
                        table: "country",
                        field: "id",
                        onUpdate: "no action",
                        onDelete: "set null",
                    }
                }
            });
        });
    });

    describe("foreignKey(table: string, field?: string, onDelete?: string, onUpdate?: string)", function () {
        it("should add a foreign key with several arguments as expected", function () {
            var table = new Table("users");
            table.addColumn("country_id", "int", 10).foreignKey("country", "id");
            assert.deepStrictEqual(table.schema, {
                country_id: {
                    name: "country_id",
                    type: "int",
                    length: 10,
                    notNull: false,
                    default: undefined,
                    primary: false,
                    autoIncrement: false,
                    unsigned: false,
                    unique: false,
                    comment: "",
                    foreignKey: {
                        table: "country",
                        field: "id",
                        onUpdate: "no action",
                        onDelete: "set null",
                    }
                }
            });
        });
    });
});