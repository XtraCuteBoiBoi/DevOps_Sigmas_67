const { Task } = require('../models/Task');
const fs = require('fs').promises;
const path = require('path');

const tasks_file = path.join('utils', 'tasks.json');
const tasks_template_file = path.join('utils', 'task.template.json');

// Filter tasks by category, priority, status. amd subject
async function filterTasks(req, res) {
    try {
        // Get filter values from the URL
        const { categoryId, priorityId, statusId, subjectId } = req.query;

        // Check whether at least one filter is provided
        if (!categoryId && !priorityId && !statusId && !subjectId) {
            return res.status(400).json({ error: "At least one filter option is required" });
        }

        let tasks = [];

        try {
            // Read the existing tasks from tasks.json
            const data = await fs.readFile(tasks_file, 'utf8');
            tasks = JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                // If the file doesn't exist, use the template
                const templateData = await fs.readFile(tasks_template_file, 'utf8');
                tasks = JSON.parse(templateData);
            } else {
                throw err;
            }
        }

        // Filter tasks based on the selected criteria
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

        // Return the filtered tasks as a JSON response
        return res.status(200).json(filteredTasks);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message});
    }
}

module.exports = { filterTasks };