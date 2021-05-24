const express = require("express");
const cTable = require("console.table");
const db = require("./db/connection");

const PORT = process.env.PORT || 3001;
const app = express();

// not sure about this
// const routes = require("./routes/routes");

// express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// use routes (note sure about this)
app.use("/api", routes);

// default response for any other request (not found)
app.use((req, res) => {
    res.status(400).end();
});

db.connect(err => {
    if (err) throw err;
    console.log("database connected.");
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
    });
});