var express = require('express');
var bodyParser = require("body-parser");
var app = express();
const PORT = process.env.PORT || 5050
var startPage = "index.html";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public"));

const { sortTasks } = require('./utils/JanaUtil');
app.get('/tasks', sortTasks); // GET API but with sorting functionality: Jana

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/" + startPage);
})

// GET API - Wei Ye
const { viewTasks } = require('./utils/WeiYeUtil');
app.get('/view-tasks', viewTasks)

// GET API - Ayers
const { viewTasks } = require('./utils/AyersUtil');
app.get('/tasks/search?keyword=&category=&priority=&status=&sort=&order=',)


server = app.listen(PORT, function () {
    const address = server.address();
    const baseUrl = `http://${address.address == "::" ? 'localhost' : address.address}:${address.port}`;
    console.log(`Demo project at: ${baseUrl}`);
});

module.exports = { app, server }
