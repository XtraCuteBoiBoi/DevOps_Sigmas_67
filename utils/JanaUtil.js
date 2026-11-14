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
        const comparison = a.name.localeCompare(
            b.name,
            undefined,
            { sensitivity: 'base' }
        );

        // Reverse the comparison for descending order
        return order === 'desc' ? -comparison : comparison;
    });

    return sortedTasks;
}


// 2. Sort tasks by priority (High to Low or Low to High)
function sortByPriority(tasks, order) {
    // Define the priority order
    // Lower numbers represent higher priority
    const priorityOrder = {
        'High': 1,
        'Medium': 2,
        'Low': 3
    };

    // Create a copy so the original task array is unchanged
    const sortedTasks = [...tasks];

    // Sort tasks by their priority names
    sortedTasks.sort((a, b) => {
        const comparison =
            priorityOrder[a.priorityId] -
            priorityOrder[b.priorityId];

        // Reverse the comparison for descending order
        return order === 'desc' ? -comparison : comparison;
    });

    return sortedTasks;
}


// 3. Main function to handle sorting requests
async function sortTasks(req, res) {
    try {
        // Get the sorting field and order from the URL
        // Default to sorting by name in ascending order
        const sortBy = req.query.sortBy || 'name';
        const order = req.query.order || 'asc';

        // Check whether the sorting field is valid
        if (sortBy !== 'name' && sortBy !== 'priority') {
            return res.status(400).json({
                message: 'Invalid sorting field. Use name or priority.'
            });
        }

        // Check whether the sorting order is valid
        if (order !== 'asc' && order !== 'desc') {
            return res.status(400).json({
                message: 'Invalid sorting order. Use asc or desc.'
            });
        }

        let tasks = [];

        try {
            // Read the existing tasks from tasks.json
            const data = await fs.readFile(tasks_file, 'utf8');
            tasks = JSON.parse(data);

        } catch (err) {
            if (err.code === 'ENOENT') {
                // If tasks.json does not exist yet,
                // load the tasks from the template
                const templateData = await fs.readFile(
                    template_file,
                    'utf8'
                );

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
        }

        // Return the sorted tasks as JSON
        return res.status(200).json(sortedTasks);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
}


// Export the main function for use in index.js
module.exports = { sortTasks };
