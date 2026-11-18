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
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        try {
            // check id validation
            // start with lowercase, followed by numbers
            if(!/^t\d+$/.test(id)) {
                return res.status(400).json({ message: 'Invalid task id. Please ensure you are updating a task in a correct id format.'});
            }
            // if no error found, return allTasks
            var tasks = await sendErrorMessage();

        } catch (error) {
            // cannot find the task.json file
            if (error.code === 'ENOENT') {
                return res.status(404).json({ message: 'No task found to edit.' });
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
        
        if(name === null ||
            categoryId === null ||
            priorityId === null ||
            statusId === null ||
            month == null ||
            year === null ||
            hour === null
        ) {
            return res.status(400).json({ message: 'Invalid value. The value cannot be null. '})
        }

        // check if selected 'Academic' but no subject being selected
        if ((Number(categoryId) === 2 && subjectId === null) || (Number(categoryId) === 2 && subjectId === '')) {
            return res.status(400).json({message: 'Academic category requires a subject.'});
        }

        // check if values are empty strings
        if(name.trim() === '' ||
            categoryId.trim() === '' ||
            priorityId.trim() === '' ||
            statusId.trim() === '' ||
            month.trim() === '' ||
            year.trim() === '' ||
            hour.trim() === ''
        ) {
            return res.status(400).json({ message: 'Value(s) cannot be an empty string! Please enter a value.'})
        }

        // check if category value is within the pre-filled value being set in DB. (e.g. 1 = "Personal", 2 = "Academic"...)
        if(Number(categoryId) < 1 || Number(categoryId) > 5) {
            return res.status(400).json({ message: 'Invalid category option! Please choose the category from the dropdown menu.' });
        }
        // check if subject value is within the pre-filled value being set in DB. (e.g. 1 = "ITAD", 2 = "MLDP"...)
        if(subjectId !== null && (!Number(subjectId) || Number(subjectId) < 1 || Number(subjectId) > 8)) {
            return res.status(400).json({ message: 'Invalid subject option! Please choose the subject from the dropdown menu.' });
        }
        // check if priority value is within the pre-filled value being set in DB. (e.g. 1 = "High", 2 = "Medium"...)
        if(Number(priorityId) < 1 || Number(priorityId) > 3) {
            return res.status(400).json({ message: 'Invalid priority option! Please choose the priority from the dropdown menu.' });
        }
        // check if status value is within the pre-filled value being set in DB. (e.g. 1 = "Overdue", 2 = "Pending"...)
        if(Number(statusId) < 1 || Number(statusId) > 3) {
            return res.status(400).json({ message: 'Invalid status option! Please choose the status from the dropdown menu.' });
        }
        // check if month value is found in the months list 
        if(!months.includes(month)) {
            return res.status(400).json({ message: 'Invalid month value! Please select a valid month value.' });
        }
        // check if year value has 4 digits
        if(!/^\d{4}$/.test(String(year))) {
            return res.status(400).json({ message: 'Invalid year value! Please enter exactly 4 digit year.'})
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