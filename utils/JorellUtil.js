const fs = require('fs').promises;
const path = require('path');
const { Task } = require('../models/Task');

// File containing the saved tasks (same file read by viewTasks and sortTasks)
const TASK_FILE = path.join(__dirname, 'task.json');

// IDs must match the *.template.json files in /utils
const ACADEMIC_CATEGORY_ID = '2';
const VALID_CATEGORY_IDS = ['1', '2', '3', '4', '5']; // Personal, Academic, Work, Errands, Entertainment
const VALID_SUBJECT_IDS = ['1', '2', '3', '4', '5', '6', '7', '8']; // ITAD, MLDP, FWEB, DVOPS, CMATH, PROCOMM, GL, SCA
const VALID_PRIORITY_IDS = ['1', '2', '3']; // High, Medium, Low
const VALID_STATUS_IDS = ['1', '2', '3']; // Overdue, Pending, Completed

// Tasks store the month as a short name (e.g. "Nov"), same format JanaUtil sorts by
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MAX_NAME_LENGTH = 100;

// Turn an incoming value into a trimmed string ('' if it is missing)
function toText(value) {
    if (value === undefined || value === null) {
        return '';
    }
    return String(value).trim();
}

// Validate the request body for a new task.
// Returns { errors, values }. "errors" is an object of field -> message (empty if everything is valid).
function validateNewTask(body) {
    const errors = {};

    const name = toText(body.name);
    const categoryId = toText(body.categoryId);
    const subjectId = toText(body.subjectId);
    const priorityId = toText(body.priorityId);
    const statusId = toText(body.statusId);
    const endDate = toText(body.endDate);
    const endTime = toText(body.endTime);

    // Name
    if (name === '') {
        errors.name = 'Task name is required.';
    } else if (typeof body.name !== 'string') {
        errors.name = 'Task name must be text.';
    } else if (name.length > MAX_NAME_LENGTH) {
        errors.name = `Task name must be ${MAX_NAME_LENGTH} characters or fewer.`;
    } else if (/[<>]/.test(name)) {
        // The task table inserts names as HTML, so block tags
        errors.name = 'Task name cannot contain < or > characters.';
    }

    // Category
    if (categoryId === '') {
        errors.categoryId = 'Please select a category.';
    } else if (!VALID_CATEGORY_IDS.includes(categoryId)) {
        errors.categoryId = 'Invalid category selected.';
    }

    // Subject (only required when the category is Academic)
    if (categoryId === ACADEMIC_CATEGORY_ID) {
        if (subjectId === '') {
            errors.subjectId = 'Please select a subject for an Academic task.';
        } else if (!VALID_SUBJECT_IDS.includes(subjectId)) {
            errors.subjectId = 'Invalid subject selected.';
        }
    }

    // Priority
    if (priorityId === '') {
        errors.priorityId = 'Please select a priority.';
    } else if (!VALID_PRIORITY_IDS.includes(priorityId)) {
        errors.priorityId = 'Invalid priority selected.';
    }

    // Status
    if (statusId === '') {
        errors.statusId = 'Please select a status.';
    } else if (!VALID_STATUS_IDS.includes(statusId)) {
        errors.statusId = 'Invalid status selected.';
    }

    // End date (YYYY-MM-DD, must be a real calendar date)
    let month;
    let year;
    if (endDate === '') {
        errors.endDate = 'End date is required.';
    } else {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(endDate);
        let isRealDate = false;

        if (match) {
            const y = Number(match[1]);
            const m = Number(match[2]);
            const d = Number(match[3]);
            const date = new Date(Date.UTC(y, m - 1, d));

            // Rejects dates such as 2026-02-30 (JS would roll them over to March)
            isRealDate = date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
            if (isRealDate) {
                year = y;
                month = MONTH_NAMES[m - 1];
            }
        }

        if (!isRealDate) {
            errors.endDate = 'End date must be a valid date in YYYY-MM-DD format.';
        }
    }

    // End time (HH:MM, 24-hour)
    if (endTime === '') {
        errors.endTime = 'End time is required.';
    } else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) {
        errors.endTime = 'End time must be a valid time in HH:MM (24-hour) format.';
    }

    return {
        errors,
        values: {
            name,
            categoryId,
            subjectId: categoryId === ACADEMIC_CATEGORY_ID ? subjectId : null,
            priorityId,
            statusId,
            month,
            year,
            hour: endTime
        }
    };
}

// Read the saved tasks. A missing file means there are no tasks yet.
// An unreadable file throws, so we never overwrite data we could not understand.
async function readSavedTasks() {
    let data;

    try {
        data = await fs.readFile(TASK_FILE, 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }

    if (data.trim() === '') {
        return [];
    }

    let tasks;
    try {
        tasks = JSON.parse(data);
    } catch (error) {
        throw new Error('task.json contains invalid JSON. Please fix it before creating tasks.');
    }

    if (!Array.isArray(tasks)) {
        throw new Error('task.json has an invalid structure. Please fix it before creating tasks.');
    }

    return tasks;
}

// POST /create-task
// Body: { name, categoryId, subjectId (Academic only), priorityId, statusId, endDate: "YYYY-MM-DD", endTime: "HH:MM" }
async function createTask(req, res) {
    try {
        // req.body is undefined if the request had no body
        const { errors, values } = validateNewTask(req.body || {});

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        const newTask = new Task(
            values.name,
            values.categoryId,
            values.subjectId,
            values.priorityId,
            values.statusId,
            values.month,
            values.year,
            values.hour
        );

        const tasks = await readSavedTasks();
        tasks.push(newTask);
        await fs.writeFile(TASK_FILE, JSON.stringify(tasks, null, 4));

        return res.status(201).json({ message: 'Task created successfully', task: newTask });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { createTask, validateNewTask };