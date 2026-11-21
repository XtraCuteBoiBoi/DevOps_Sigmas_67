// Ayers - Search Tasks (backend)
// GET /tasks/search?keyword=

const fs = require('fs').promises;
const path = require('path');

// Path to the shared task data file (works wherever the server is started from)
const TASK_FILE = path.join(__dirname, 'task.json');

// Validation rules for the search keyword
const MAX_KEYWORD_LENGTH = 50;
const KEYWORD_PATTERN = /^[a-zA-Z0-9\s\-'.,&()@]*$/;   // letters, numbers, spaces, basic punctuation

// Checks the search query and returns a list of error messages (empty if valid)
function validateSearchQuery(query) {
    const errors = [];
    const { keyword } = query;

    // Error: keyword sent more than once, e.g. ?keyword=a&keyword=b
    if (keyword !== undefined && typeof keyword !== 'string') {
        errors.push('Keyword must be a single value');
        return errors;
    }
    // Error: keyword too long
    if (keyword && keyword.trim().length > MAX_KEYWORD_LENGTH) {
        errors.push(`Keyword must be ${MAX_KEYWORD_LENGTH} characters or fewer`);
    }
    // Error: keyword has characters that are not allowed
    if (keyword && !KEYWORD_PATTERN.test(keyword)) {
        errors.push('Keyword can only contain letters, numbers, spaces and basic punctuation');
    }
    return errors;
}

async function searchTask(req, res) {
    // Invalid keyword → 400
    const errors = validateSearchQuery(req.query);
    if (errors.length > 0) {
        return res.status(400).json({ message: errors.join('; ') });
    }

    const keyword = (req.query.keyword || '').trim().toLowerCase();

    try {
        const data = await fs.readFile(TASK_FILE, 'utf8');
        const allTasks = JSON.parse(data);

        // Keep tasks whose name contains the keyword (case-insensitive)
        const results = allTasks.filter(task =>
            (task.name || '').toLowerCase().includes(keyword)
        );

        // No tasks matched → 200 with an empty list and a message
        if (results.length === 0) {
            return res.status(200).json({ message: 'No matching tasks found', count: 0, tasks: [] });
        }

        // Success → 200 with the matching tasks
        return res.status(200).json({ count: results.length, tasks: results });

    } catch (error) {
        // Data file missing → treat as no tasks yet
        if (error.code === 'ENOENT') {
            return res.status(200).json({ message: 'No tasks yet', count: 0, tasks: [] });
        }
        // Anything else (e.g. broken JSON) → 500
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { searchTask };