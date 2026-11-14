const fs = require('fs').promises;
const path = require('path');

// File containing the saved tasks
const tasks_file = path.join('utils', 'tasks.json');
// Template containing sample tasks
const template_file = path.join('utils', 'task.template.json');

// 1. Sort tasks by alphabetical order (ascending, A-Z, or descending, Z-A)
function sortByName(tasks, order) {
    // Create a copy so the original task array is unchanged
    const sortedTasks = [...tasks];

    // Sort tasks by their names
    sortedTasks.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

        // Reverse the comparison for descending order
        return order === 'desc' ? -comparison : comparison;
    });

    return sortedTasks;
}

// 2. Sort tasks by priority (High to Low or Low to High)
function sortByPriority(tasks, order) {
    // Create a copy so the original task array is unchanged
    const sortedTasks = [...tasks];

    // Sort tasks by their priority IDs
    // 1 = High, 2 = Medium, 3 = Low
    sortedTasks.sort((a, b) => {
        const comparison =
            Number(a.priorityId) - Number(b.priorityId);

        // Reverse the comparison for descending order
        return order === 'desc' ? -comparison : comparison;
    });

    return sortedTasks;
}

// 3. Sort tasks chronologically using year, month, and hour (ascending, earliest to latest, or descending, latest to earliest)
function sortByDate(tasks, order) {
    //Define the order of months
    const months = {'Jan': 1, 'Feb': 2, 'Mar':3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12};
    
    // Create a copy so the original task array is unchanged
    const sortedTasks = [...tasks];

    sortedTasks.sort((a, b) => {
        // Compare year first
        let compare = Number(a.year) - Number(b.year);

        // If years are the same, compare the months instead
        if (compare === 0) {
            compare = months[a.month] - months[b.month];
        }

        // If years and months are the same, compare the hours instead
        if (compare === 0) {
            // Convert HH:MM into minutes for comparison
            const [hourA, minuteA] = a.hour.split(':').map(Number);
            const [hourB, minuteB] = b.hour.split(':').map(Number);

            const timeA = hourA * 60 + minuteA;
            const timeB = hourB * 60 + minuteB;

            comparison = timeA - timeB;        
        }

        // Reverse the comparison for descending order
        return order === 'desc' ? -compare : compare;
    });

    return sortedTasks;
}

// Main function to handle sorting requests
async function sortTasks(req, res) {
    try {
        // Get the sorting field and order from the URL
        // Default to sorting by name in ascending order
        const sortBy = req.query.sortBy || 'name';
        const order = req.query.order || 'asc';

        // Check whether the sorting field is valid
        if (sortBy !== 'name' && sortBy !== 'priority' && sortBy !== 'date') {
            return res.status(400).json({
                message: 'Invalid sorting field. Use name, priority or date.'
            });
        }

        // Check whether the sorting order is valid
        if (order !== 'asc' && order !== 'desc') {
            return res.status(400).json({message: 'Invalid sorting order. Use asc or desc.'});
        }

        let tasks = [];

        try {
            // Read the existing tasks from tasks.json
            const data = await fs.readFile(tasks_file, 'utf8');
            tasks = JSON.parse(data);

        } catch (err) {
            if (err.code === 'ENOENT') {
                // If tasks.json does not exist yet, load the tasks from the template
                const templateData = await fs.readFile(template_file, 'utf8');

                tasks = JSON.parse(templateData);
            } else {
                throw err;
            }
        }

        let sortedTasks;

        // Call the appropriate sorting function
        if (sortBy === 'name') {
            sortedTasks = sortByName(tasks, order);

        } else if (sortBy === 'priority') {
            sortedTasks = sortByPriority(tasks, order);

        } else if (sortBy === 'date') {
            sortedTasks = sortByDate(tasks, order);
        }

        // Return the sorted tasks as JSON
        return res.status(200).json(sortedTasks);

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message});
    }
}

// Export the main function for use in index.js
module.exports = { sortTasks };
