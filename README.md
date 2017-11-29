# Modelar-Sqlite-Adapter

**This is an adapter for [Modelar](http://modelar.hyurl.com) to connect**
**SQLite database.**

## Install

```sh
npm install modelar-sqlite-adpater
```

## How To Use

```javascript
const { DB } = require("modelar");
const IbmdbAdapter = require("modelar-sqlite-adpater");

DB.setAdapter("sqlite", IbmdbAdapter).init({
    type: "sqlite",
    database: "sample.db"
});
```