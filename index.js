const express = require('express')
const app = express()
const port = 4000

const sqlite = require('better-sqlite3');
const db = new sqlite('./db/ripetizioni.db');

app.use(express.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function dbInsert (table, data, next) {
  let columns = "";
  let values = "";
  for (let key in data) {
    columns += key+",";
    if (typeof data[key] == 'string') {
      values += "'"+data[key]+"',";
    } else {
      values += data[key]+',';
    }
  }
  columns = columns.slice(0, -1);
  values = values.slice(0, -1);
  console.log(`INSERT INTO ${table}(${columns}) VALUES (${values});`);
  let stmt = db.prepare(`INSERT INTO ${table}(${columns}) VALUES(${values})`);
  try {
    let info = stmt.run();
  } catch(err) {
    next(err);
  } finally {
    next();
    //console.log(info.changes);
  }
}

function dbSelect (table) {
  let res = db.prepare(`SELECT * FROM ${table}`);
  return res.all();
}

function query (q) {
  let res = db.prepare(q);
  return res.all();
}

/* formato aspettato:  { "table":"nomeTabella", "data": {"col1":1, "col2":2 ... } } */
app.post('/insertDb', (req, res) => {
  dbInsert(req.body['table'], req.body['data'], function(err) {
    if (err) {console.log(err)}
    else { res.send(dbSelect(req.body['table'])) }
  });

});

/* formato aspettato:  { "table":"nomeTabella" } */
app.post('/selectDb', (req, res) => {
  res.send(dbSelect(req.body['table']));
});

app.post('/query', (req, res) => {
  res.send(query(req.body['query']))
});

app.get('/', (req, res) => {
  res.send("Ciao");
})

app.listen(port, '0.0.0.0');