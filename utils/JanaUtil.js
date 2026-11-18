const fs = require('fs').promises;
const path = require('path');

// Shared task data files
const tasks_file = path.join('utils', 'task.json');
const tasks_template_file = path.join('utils', 'task.template.json');

// Sort tasks alphabetically by name
function sortByName(tasks, order) {
    const sortedTasks = [...tasks];

    sortedTasks.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

        return order === 'desc' ? -comparison : comparison;
    });

    return sortedTasks;
}

// Sort tasks by priority
function sortByPriority(tasks, order) {
    const sortedTasks = [...tasks];

    sortedTasks.sort((a, b) => {
        const comparison = Number(a.priorityId) - Number(b.priorityId);
        return order === 'desc' ? -comparison : comparison;
    });

    return sortedTasks;
}

// Sort tasks by year, month and hour
function sortByDate(tasks, order) {
    const months = {Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12};
    const sortedTasks = [...tasks];

    sortedTasks.sort((a, b) => {
        let compare = Number(a.year) - Number(b.year);

        if (compare === 0) {
            compare = months[a.month] - months[b.month];
        }

        if (compare === 0) {
            const [hourA, minuteA] = a.hour.split(':').map(Number);
            const [hourB, minuteB] = b.hour.split(':').map(Number);
            const timeA = hourA * 60 + minuteA;
            const timeB = hourB * 60 + minuteB;
            compare = timeA - timeB;
        }

        return order === 'desc' ? -compare : compare;
    });

    return sortedTasks;
}

// Main Sorting API function
async function sortTasks(req, res) {
    try {
        const sortBy = req.query.sortBy || 'name';
        const order = req.query.order || 'asc';

        if (sortBy !== 'name' && sortBy !== 'priority' && sortBy !== 'date') {
            return res.status(400).json({message: 'Invalid sorting field. Use name, priority or date.'});
        }

        if (order !== 'asc' && order !== 'desc') {
            return res.status(400).json({message: 'Invalid sorting order. Use asc or desc.'});
        }

        let tasks = [];

        try {
            const data = await fs.readFile(tasks_file, 'utf8');
            tasks = JSON.parse(data);

        } catch (err) {
            if (err.code === 'ENOENT') {
                const templateData = await fs.readFile(tasks_template_file, 'utf8');
                tasks = JSON.parse(templateData);
            } else {
                throw err;
            }
        }

        let sortedTasks;

        if (sortBy === 'name') {
            sortedTasks = sortByName(tasks, order);

        } else if (sortBy === 'priority') {
            sortedTasks = sortByPriority(tasks, order);

        } else if (sortBy === 'date') {
            sortedTasks = sortByDate(tasks, order);
        }
        return res.status(200).json(sortedTasks);

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message});
    }
}

// Filter tasks by category, priority, status and subject
async function filterTasks(req, res) {
    try {
        const {categoryId,priorityId,statusId,subjectId} = req.query;

        // At least (min) one filter must be selected
        if (!categoryId && !priorityId && !statusId && !subjectId) {
            return res.status(400).json({error: 'At least one filter option is required'});
        }

        let tasks = [];

        try {
            const data = await fs.readFile(tasks_file, 'utf8');
            tasks = JSON.parse(data);

        } catch (err) {
            if (err.code === 'ENOENT') {
                const templateData = await fs.readFile(tasks_template_file,'utf8');
                tasks = JSON.parse(templateData);
            } else {
                throw err;
            }
        }

        const filteredTasks = tasks.filter(task => {
            if (categoryId && task.categoryId !== categoryId) {
                return false;
            }

            if (priorityId && task.priorityId !== priorityId) {
                return false;
            }

            if (statusId && task.statusId !== statusId) {
                return false;
            }

            if (subjectId && task.subjectId !== subjectId) {
                return false;
            }
            return true;
        });
        return res.status(200).json(filteredTasks);

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message});
    }
}

// Export BOTH API functions
module.exports = { sortTasks, filterTasks };