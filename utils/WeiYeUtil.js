const fs = require('fs').promises;
const path = require('path');
const TASK_FILE = path.join('utils', 'task.json');

// set as async function as in express 5 version automatically catches error in async function
// but still use try catch for more explicitly handle errors

// view task
async function viewTasks(req, res) {
    try {
        const allTasks = await sendErrorMessage()
        return res.status(200).json(allTasks);

    } catch (error) {
        jsonError(res, error)
    }
}

// get task by ID
async function getTaskById(req, res) {
    try {
        const {id} = req.params;
        const allTasks = await sendErrorMessage()
        // always return the index if found, otherwise return '-1'
        const taskIndex = allTasks.find(t => String(t.id) === String(id));

        // check if the task index is found
        if (!taskIndex) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        return res.status(200).json(taskIndex);

    } catch(error) {
        jsonError(res, error)
    }
}

// update task
async function editTask(req, res) {
    try {
        const {id} = req.params;
        const {name, categoryId, subjectId, priorityId, statusId, month, year, hour} = req.body;

        try {
            // if no error found, return allTasks
            var tasks = await sendErrorMessage();

        } catch (error) {
            // cannot find the task.json file
            if (error.code === 'ENOENT') {
                return res.status(404).json({ message: 'No tasks found to edit.' });
            } else {
                throw error;
            }
        }

        // store the index found in the array. Search through each task and match if the task id is the same as the id I am searching for.
        const taskIndex = tasks.findIndex(t => String(t.id) == String(id));
        console.log('taskindex', taskIndex)
        // findIndex returns the index value when found or -1 when not found
        // if the task id is not found
        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Update resource fields
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            name: name || tasks[taskIndex].name,
            categoryId: categoryId || tasks[taskIndex].categoryId,
            subjectId: subjectId ?? null,
            priorityId: priorityId || tasks[taskIndex].priorityId,
            statusId: statusId || tasks[taskIndex].statusId,
            month: month || tasks[taskIndex].month,
            year: year || tasks[taskIndex].year,
            hour: hour || tasks[taskIndex].hour,
        }

        // create a file or overwrite data if existed
        await fs.writeFile(TASK_FILE, JSON.stringify(tasks, null, 2), 'utf8');
        return res.status(200).json({ message: 'Task updated successfully!', task: tasks[taskIndex] });

    } catch (error) {
        jsonError(res, error)
    }
}
// catch other json error related
function jsonError(res, error) {
    // Handle case where file does not exist yet
    if (error.code === 'ENOENT') {
        // return empty list if no file
        return res.status(200).json([]); 
    }
    // Invalid JSON syntax such as missing curly braces
    if (error instanceof SyntaxError) {
        return res.status(400).json({
            message: 'Invalid JSON syntax'
        });
    }

    return res.status(500).json({ message: error.message });
}
// backend validations
async function sendErrorMessage() {
    const data = await fs.readFile(TASK_FILE, 'utf8');

    // if no data in json file (e.g. file existed but no content inside the file)
    if(!data) {
        throw new Error('Empty JSON file');
    }

    const allTasks = JSON.parse(data);

    // check if the structure in json file is valid. Invalid includes missing [] at the start
    if(!Array.isArray(allTasks)) {
        throw new Error('Invalid JSON structure');
    }

    // iterate the list to get each item
    for(var i = 0; i < allTasks.length; i++) {
        // check if there is missing field(s) of a task
        if(allTasks[i].id === undefined ||
            allTasks[i].name === undefined ||
            allTasks[i].categoryId === undefined ||
            allTasks[i].priorityId === undefined ||
            allTasks[i].statusId === undefined ||
            allTasks[i].month === undefined ||
            allTasks[i].year === undefined ||
            allTasks[i].hour === undefined
        ) {
            throw new Error('Missing data field(s) of a task!');
        }
    }
    // if no errors, return all tasks
    return allTasks
}

module.exports = { 
    viewTasks,
    getTaskById,
    editTask
};