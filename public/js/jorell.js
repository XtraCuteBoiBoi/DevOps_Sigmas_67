// ===== Create Task pop-out (Jorell) =====

// Category ID of "Academic" - the Subject field only shows for this category
const CT_ACADEMIC_CATEGORY_ID = '2';
const CT_MAX_NAME_LENGTH = 100;

// Form field name (same names the backend uses) -> id of its input element
const CT_FIELD_IDS = {
    name: 'ctName',
    categoryId: 'ctCategory',
    subjectId: 'ctSubject',
    priorityId: 'ctPriority',
    statusId: 'ctStatus',
    endDate: 'ctEndDate',
    endTime: 'ctEndTime'
};

var ctToastTimer = null;

// ---------- Open / close ----------

// Open the pop-out with a fresh, empty form
function openCreateTaskModal() {
    resetCreateTaskForm();
    document.getElementById('createTaskOverlay').classList.add('open');
    document.getElementById('ctName').focus();
}

// Close the pop-out without creating a task
function closeCreateTaskModal() {
    document.getElementById('createTaskOverlay').classList.remove('open');
    resetCreateTaskForm();
    document.getElementById('createTaskBtn').focus();
}

// Pressing Esc also closes the pop-out
document.addEventListener('keydown', function (event) {
    var overlay = document.getElementById('createTaskOverlay');

    if (event.key === 'Escape' && overlay && overlay.classList.contains('open')) {
        closeCreateTaskModal();
    }
});

// Clear all inputs and error messages
function resetCreateTaskForm() {
    document.getElementById('createTaskForm').reset();
    clearCreateTaskErrors();
    toggleSubjectField();
}

// ---------- Subject field (Academic only) ----------

// Show the Subject field only when the Academic category is selected
function toggleSubjectField() {
    var category = document.getElementById('ctCategory').value;
    var subjectField = document.getElementById('ctSubjectField');
    var subjectInput = document.getElementById('ctSubject');

    if (category === CT_ACADEMIC_CATEGORY_ID) {
        subjectField.hidden = false;
    } else {
        subjectField.hidden = true;
        // Clear the hidden field so an old subject is never submitted
        subjectInput.value = '';
        clearFieldError('subjectId');
    }
}

// ---------- Validation ----------

// Read the form into an object (same shape the backend expects)
function getCreateTaskFormValues() {
    var values = {};

    for (var field in CT_FIELD_IDS) {
        values[field] = document.getElementById(CT_FIELD_IDS[field]).value.trim();
    }

    // Subject only applies to Academic tasks
    if (values.categoryId !== CT_ACADEMIC_CATEGORY_ID) {
        delete values.subjectId;
    }

    return values;
}

// Check the values and return an object of field -> error message (empty if valid)
function validateCreateTaskForm(values) {
    var errors = {};

    if (values.name === '') {
        errors.name = 'Task name is required.';
    } else if (values.name.length > CT_MAX_NAME_LENGTH) {
        errors.name = 'Task name must be ' + CT_MAX_NAME_LENGTH + ' characters or fewer.';
    } else if (/[<>]/.test(values.name)) {
        errors.name = 'Task name cannot contain < or > characters.';
    }

    if (values.categoryId === '') {
        errors.categoryId = 'Please select a category.';
    }

    if (values.categoryId === CT_ACADEMIC_CATEGORY_ID && !values.subjectId) {
        errors.subjectId = 'Please select a subject for an Academic task.';
    }

    if (values.priorityId === '') {
        errors.priorityId = 'Please select a priority.';
    }

    if (values.statusId === '') {
        errors.statusId = 'Please select a status.';
    }

    if (values.endDate === '') {
        errors.endDate = 'End date is required.';
    }

    if (values.endTime === '') {
        errors.endTime = 'End time is required.';
    }

    return errors;
}

// ---------- Error display ----------

function showFieldError(field, message) {
    var input = document.getElementById(CT_FIELD_IDS[field]);
    var errorEle = document.getElementById(CT_FIELD_IDS[field] + 'Error');

    // Ignore fields that are not on the form
    if (!input || !errorEle) {
        return false;
    }

    input.classList.add('invalid');
    errorEle.innerText = message;
    return true;
}

function clearFieldError(field) {
    var input = document.getElementById(CT_FIELD_IDS[field]);
    var errorEle = document.getElementById(CT_FIELD_IDS[field] + 'Error');

    input.classList.remove('invalid');
    errorEle.innerText = '';
}

function clearCreateTaskErrors() {
    for (var field in CT_FIELD_IDS) {
        clearFieldError(field);
    }

    var banner = document.getElementById('createTaskFormError');
    banner.innerText = '';
    banner.hidden = true;
}

// Show errors under their fields and focus the first invalid one
function showCreateTaskErrors(errors) {
    var firstInvalid = null;

    for (var field in errors) {
        if (showFieldError(field, errors[field]) && firstInvalid === null) {
            firstInvalid = field;
        }
    }

    if (firstInvalid !== null) {
        document.getElementById(CT_FIELD_IDS[firstInvalid]).focus();
    }
}

// Show a general error at the top of the form
function showCreateTaskBanner(message) {
    var banner = document.getElementById('createTaskFormError');
    banner.innerText = message;
    banner.hidden = false;
}

// Small success message in the bottom-right corner
function showCreateTaskToast(message) {
    var toast = document.getElementById('toast');

    toast.innerText = message;
    toast.classList.add('show');

    clearTimeout(ctToastTimer);
    ctToastTimer = setTimeout(function () {
        toast.classList.remove('show');
    }, 3500);
}

// ---------- Submit ----------

// Validate, send to POST /create-task, then refresh the task list
async function submitCreateTask(event) {
    event.preventDefault();
    clearCreateTaskErrors();

    var values = getCreateTaskFormValues();
    var errors = validateCreateTaskForm(values);

    // Stop here if anything is missing or invalid
    if (Object.keys(errors).length > 0) {
        showCreateTaskErrors(errors);
        return;
    }

    var submitBtn = document.getElementById('createTaskSubmit');
    // Prevent double submits while waiting for the server
    submitBtn.disabled = true;

    try {
        var response = await fetch('/create-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values)
        });

        var data = await response.json().catch(function () {
            return {};
        });

        if (response.status === 201) {
            closeCreateTaskModal();
            showCreateTaskToast('Task "' + data.task.name + '" created successfully.');
            // Reload the list using the currently selected sort (jana.js) so the new task shows up
            sortTask();
            return;
        }

        // Validation errors from the backend
        if (response.status === 400 && data.errors) {
            showCreateTaskErrors(data.errors);
            return;
        }

        showCreateTaskBanner(data.message || 'Unable to create the task. Please try again.');

    } catch (error) {
        console.error('Error:', error);
        showCreateTaskBanner('Unable to reach the server. Please try again.');
    } finally {
        submitBtn.disabled = false;
    }
}

// ===== Delete Task (Jorell) =====
// Self-contained: it does not call or edit anyone else's JS/HTML/CSS.
// It adds the delete buttons, the confirmation pop-out and its styles by itself.

// Id of the task waiting for the user to confirm its deletion
var dtTaskId = null;

// ---------- Styles for the delete pop-out (only what styles.css does not already have) ----------

(function addDeleteTaskStyles() {
    var style = document.createElement('style');
    style.textContent =
        '.modal-small { max-width: 420px; }' +
        '.modal-message { font-size: 15px; line-height: 1.5; word-break: break-word; }' +
        '.btn-danger { padding: 11px 18px; border: none; border-radius: 8px; background-color: #b90202;' +
        ' color: #ffffff; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }' +
        '.btn-danger:hover { background-color: #8f0101; }' +
        '.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }';
    document.head.appendChild(style);
})();

// ---------- Confirmation pop-out (built here so index.html does not need to change) ----------

(function buildDeleteTaskModal() {
    var overlay = document.createElement('div');
    overlay.id = 'deleteTaskOverlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
        '<div class="modal modal-small" role="alertdialog" aria-modal="true" aria-labelledby="deleteTaskTitle" aria-describedby="deleteTaskMessage">' +
        '<div class="modal-header">' +
        '<div>' +
        '<h2 id="deleteTaskTitle">Delete Task</h2>' +
        '<p>This action cannot be undone</p>' +
        '</div>' +
        '<button type="button" class="modal-close" id="deleteTaskClose" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M6 6L18 18M18 6L6 18" stroke="#20352c" stroke-linecap="round" stroke-linejoin="round" />' +
        '</svg>' +
        '</button>' +
        '</div>' +
        '<p id="deleteTaskError" class="form-banner-error" hidden></p>' +
        '<p id="deleteTaskMessage" class="modal-message">Are you sure you want to delete <strong id="deleteTaskName"></strong>?</p>' +
        '<div class="modal-actions">' +
        '<button type="button" id="deleteTaskCancel" class="btn-secondary">Cancel</button>' +
        '<button type="button" id="deleteTaskConfirm" class="btn-danger">Delete Task</button>' +
        '</div>' +
        '</div>';
    document.body.appendChild(overlay);

    document.getElementById('deleteTaskClose').addEventListener('click', closeDeleteTaskModal);
    document.getElementById('deleteTaskCancel').addEventListener('click', closeDeleteTaskModal);
    document.getElementById('deleteTaskConfirm').addEventListener('click', confirmDeleteTask);
})();

// ---------- Delete button in every table row ----------

var DT_TRASH_ICON =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6L18.2 19.2C18.1 20.7 17 21.5 15.6 21.5H8.4C7 21.5 5.9 20.7 5.8 19.2L5 6M10 11V17M14 11V17" ' +
    'stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

// Add a delete button to every row that does not have one yet.
// The task id is read from the edit button already in the row (its restId attribute).
function addDeleteButtons() {
    var rows = document.querySelectorAll('#taskTableBody tr');

    rows.forEach(function (row) {
        if (row.querySelector('.delete-task-btn')) {
            return;
        }

        var editBtn = row.querySelector('button[restId]');
        if (!editBtn) {
            return;
        }

        var wrapper = document.createElement('div');
        wrapper.innerHTML = '<button type="button" class="action-btn delete-task-btn" aria-label="Delete task">' + DT_TRASH_ICON + '</button>';
        wrapper.firstChild.setAttribute('data-task-id', editBtn.getAttribute('restId'));

        // Put it next to the edit button
        editBtn.parentElement.parentElement.appendChild(wrapper);
    });
}

// The table is redrawn every time the task list loads, sorts, filters or searches,
// so watch it and re-add the buttons each time.
(function watchTaskTable() {
    var tableBody = document.getElementById('taskTableBody');

    new MutationObserver(addDeleteButtons).observe(tableBody, { childList: true });
    addDeleteButtons();

    // One click listener for all delete buttons
    tableBody.addEventListener('click', function (event) {
        var btn = event.target.closest('.delete-task-btn');
        if (btn) {
            openDeleteTaskModal(btn);
        }
    });
})();

// ---------- Open / close ----------

function openDeleteTaskModal(btn) {
    dtTaskId = btn.getAttribute('data-task-id');

    // The task name is the 2nd column of the row
    var nameCell = btn.closest('tr').children[1];
    var name = nameCell ? nameCell.textContent.trim() : '';

    // innerText (not innerHTML) so a task name can never be treated as HTML
    document.getElementById('deleteTaskName').innerText = name ? '"' + name + '"' : 'this task';
    clearDeleteTaskError();

    document.getElementById('deleteTaskOverlay').classList.add('open');
    // Focus Cancel so pressing Enter never deletes by accident
    document.getElementById('deleteTaskCancel').focus();
}

function closeDeleteTaskModal() {
    document.getElementById('deleteTaskOverlay').classList.remove('open');
    clearDeleteTaskError();
    dtTaskId = null;
}

// Pressing Esc also closes the delete pop-out
document.addEventListener('keydown', function (event) {
    var overlay = document.getElementById('deleteTaskOverlay');

    if (event.key === 'Escape' && overlay && overlay.classList.contains('open')) {
        closeDeleteTaskModal();
    }
});

function showDeleteTaskError(message) {
    var banner = document.getElementById('deleteTaskError');
    banner.innerText = message;
    banner.hidden = false;
}

function clearDeleteTaskError() {
    var banner = document.getElementById('deleteTaskError');
    banner.innerText = '';
    banner.hidden = true;
}

// ---------- Confirm ----------

// Send DELETE /tasks/:id, then reload the page so the table shows the saved tasks
async function confirmDeleteTask() {
    if (dtTaskId === null) {
        return;
    }

    var confirmBtn = document.getElementById('deleteTaskConfirm');
    // Prevent double clicks while waiting for the server
    confirmBtn.disabled = true;
    clearDeleteTaskError();

    try {
        var response = await fetch('/tasks/' + encodeURIComponent(dtTaskId), { method: 'DELETE' });

        var data = await response.json().catch(function () {
            return {};
        });

        if (response.status === 200) {
            rememberDeleteMessage('Task "' + data.task.name + '" deleted successfully.');
            window.location.reload();
            return;
        }

        // Task is already gone from task.json (e.g. deleted in another tab)
        if (response.status === 404) {
            rememberDeleteMessage('Task not found. It may have already been deleted.');
            window.location.reload();
            return;
        }

        showDeleteTaskError(data.message || 'Unable to delete the task. Please try again.');

    } catch (error) {
        console.error('Error:', error);
        showDeleteTaskError('Unable to reach the server. Please try again.');
    } finally {
        confirmBtn.disabled = false;
    }
}

// ---------- Success message (survives the page reload) ----------

function rememberDeleteMessage(message) {
    try {
        sessionStorage.setItem('deleteTaskMessage', message);
    } catch (error) {
        // Storage not available: the task is still deleted, only the message is skipped
    }
}

(function showSavedDeleteMessage() {
    try {
        var message = sessionStorage.getItem('deleteTaskMessage');

        if (message) {
            sessionStorage.removeItem('deleteTaskMessage');
            showCreateTaskToast(message);
        }
    } catch (error) {
        // Storage not available: nothing to show
    }
})();