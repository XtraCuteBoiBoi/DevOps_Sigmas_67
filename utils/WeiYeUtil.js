const fs = require('fs').promises;
const path = require('path');
const TASK_FILE = path.join('utils', 'task.json');

async function viewTasks(req, res) {
    try {
        const data = await fs.readFile(TASK_FILE, 'utf8');
        const allTasks = JSON.parse(data);
        console.log(allTasks)
        return res.status(200).json(allTasks);
    } catch (error) {
        // Handle case where file does not exist yet
        if (error.code === 'ENOENT') {
            // return empty list if no file
            return res.status(200).json([]); 
        }
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { viewTasks };