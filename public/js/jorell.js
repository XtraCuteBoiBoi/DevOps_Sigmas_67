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