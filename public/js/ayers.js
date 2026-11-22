// Ayers - Search Tasks (frontend)
// Reuses Wei Ye's dynamicDisplayTasks() so search results look the same as the normal task list

const AYERS_MAX_KEYWORD_LENGTH = 50;
const AYERS_KEYWORD_PATTERN = /^[a-zA-Z0-9 \-'.,&()@]*$/;   // letters, numbers, spaces, basic punctuation
let ayersLatestSearchId = 0;   // used to ignore results from older, slower searches

// Runs every time the user types in the search bar
async function searchTasks() {
    const searchId = ++ayersLatestSearchId;   // this is now the newest search
    const keyword = document.getElementById('searchTask').value.trim();

    // Empty search box → go back to the full task list (Wei Ye's view)
    if (keyword === '') {
        showSearchMessage('', '');
        startIndex = 1;
        endIndex = maxNumTasksPerPage;
        viewTask();
        return;
    }

    // Frontend validation: instant feedback before calling the server
    if (keyword.length > AYERS_MAX_KEYWORD_LENGTH) {
        showSearchMessage(`Search must be ${AYERS_MAX_KEYWORD_LENGTH} characters or fewer`, 'error');
        return;
    }
    if (!AYERS_KEYWORD_PATTERN.test(keyword)) {
        showSearchMessage('Search can only contain letters, numbers, spaces and basic punctuation', 'error');
        return;
    }

    // Ask the server for matching tasks
    let response, data;
    try {
        response = await fetch('/tasks/search?keyword=' + encodeURIComponent(keyword));
        data = await response.json();
    } catch (error) {
        console.error('Search request failed:', error);
        if (searchId !== ayersLatestSearchId) return;   // an old search failed; a newer one is running
        showSearchMessage('Could not reach the server: ' + error.message, 'error');
        return;
    }

    // A newer search was started while this one was waiting → ignore this old result
    if (searchId !== ayersLatestSearchId) return;

    // Server rejected the search (400) or something broke (500)
    if (!response.ok) {
        showSearchMessage(data.message, 'error');
        return;
    }

    // Show the results
    try {
        showSearchResults(data);
    } catch (error) {
        console.error('Showing results failed:', error);
        showSearchMessage('Error showing results: ' + error.message, 'error');
    }
}

// Displays search results using Wei Ye's table and pagination
function showSearchResults(data) {
    const tasks = data.tasks;

    // Point Wei Ye's shared list at the search results so the < > page buttons work on them
    allTasks = tasks;
    remainingTasks = [...tasks];
    totalTasks = tasks.length;
    startIndex = tasks.length === 0 ? 0 : 1;
    endIndex = Math.min(maxNumTasksPerPage, tasks.length);
    totalTaskValue(tasks.length);

    // No matches → empty table and a message
    if (tasks.length === 0) {
        document.getElementById('taskTableBody').innerHTML = '';
        document.getElementById('searchMessage').textContent = '';
        document.getElementById('noTaskTxt').textContent = data.message || 'No tasks match your search.';
        document.getElementById('noTaskTxtWrapper').style.display = 'block';
        document.querySelector('.table-wrapper').style.display = 'none';
        displayDynamicPageNumber();
        return;
    }

    // Matches → show the first page using Wei Ye's row builder
    document.getElementById('noTaskTxtWrapper').style.display = 'none';
    showSearchMessage('', '');
    dynamicDisplayTasks(tasks.slice(0, maxNumTasksPerPage));
}

// Shows a success / info / error message under the search bar
function showSearchMessage(text, type) {
    const message = document.getElementById('searchMessage');
    if (!message) return;
    message.textContent = text;
    message.className = 'search-message ' + type;
}
