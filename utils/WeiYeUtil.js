const fs = require('fs').promises;
const path = require('path');
const TASK_FILE = path.join('utils', 'task.json');

// set as async function as in express 5 version automatically catches error in async function
// but still use try catch for more explicitly handle errors
async function viewTasks(req, res) {
    try {
        const data = await fs.readFile(TASK_FILE, 'utf8');

        // if no data in json file (e.g. file existed but not value inside the file)
        if(!data) {
            return res.status(400).json({ message: 'Empty JSON file'})
        }
        
        const allTasks = JSON.parse(data);
        // check if the structure in json file is valid. Invalid includes missing [] at the start
        if(!Array.isArray(allTasks)) {
            return res.status(400).json({ message: 'Invalid JSON structure' })
        }

        return res.status(200).json(allTasks);

    } catch (error) {
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
}

module.exports = { viewTasks };