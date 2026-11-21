var express = require('express');
var bodyParser = require("body-parser");
var app = express();
const PORT = process.env.PORT || 5050
var startPage = "index.html";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public"));

const { createTask } = require('./utils/JorellUtil');
const { viewTasks, getTaskById, editTask } = require('./utils/WeiYeUtil');
const { sortTasks } = require('./utils/JanaUtil');


app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/" + startPage);
})

// GET API (display all tasks) - Wei Ye
app.get('/view-tasks', viewTasks);
// GET API with sorting functionality - Jana
app.get('/tasks', sortTasks);
// POST API - Create task: Jorell
app.post('/create-task', createTask);
// GET API (display 1 task) - Wei Ye
app.get('/tasks/:id', getTaskById);
// PUT API (update 1 task) - Wei Ye
app.put('/tasks/:id', editTask);




// GET API - Ayers
const { searchTask } = require('./utils/AyersUtil');
app.get('/tasks/search', searchTask);


server = app.listen(PORT, function () {
    const address = server.address();
    const baseUrl = `http://${address.address == "::" ? 'localhost' : address.address}:${address.port}`;
    console.log(`Demo project at: ${baseUrl}`);
});

module.exports = { app, server }
