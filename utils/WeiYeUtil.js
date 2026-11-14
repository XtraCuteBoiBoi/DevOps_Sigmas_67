// interact with project folder/files
const fs = require('fs').promises;
const path = require('path');
const TASKS_FILE = path.join('utils', 'task.json');

// update task
async function editTask(req, res) {
    try {
        const {id} = req.params;
        const {name, categoryId, priorityId, statusId, month, year, hour} = req.body;
        let tasks = [];

        try {
            const data = await fs.readFile(TASKS_FILE, 'utf-8');
            tasks = JSON.parse(data);
        } catch (error) {
            // cannot find the task.json file
            if (err.code === 'ENOENT') {
                return res.status(404).json({ message: 'No tasks found to edit.' });
            } else {
                throw err;
            }
        }

        // store the index found in the array. Search through each task and match if the task id is the same as the id I am searching for.
        const taskIndex = tasks.findIndex(t => t.id == id);
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
            priorityId: priorityId || tasks[taskIndex].priorityId,
            statusId: statusId || tasks[taskIndex].statusId,
            month: month || tasks[taskIndex].month,
            year: year || tasks[taskIndex].year,
            hour: hour || tasks[taskIndex].hour,
        }

        // create a file or overwrite data if existed
        await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
        return res.status(200).json({ message: 'Task updated successfully!', task: tasks[taskIndex] });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

async function viewTask(req, res) {
    
}

// export edit task function
module.exports = {
    viewTask,
    editTask
};