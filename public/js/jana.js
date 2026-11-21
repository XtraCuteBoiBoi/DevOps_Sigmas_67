function sortTask() { // Function to sort task
    // Get selected sorting opption
    var selectedSort = document.getElementById("sortSelect").value;

    // separate sorting field and order
    var sortSelect = selectedSort.split("-");
    var sortBy = sortSelect[0];
    var order = sortSelect[1];

    // API request
    var request = new XMLHttpRequest();

    request.open("GET", `/tasks?sortBy=${sortBy}&order=${order}`, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function () {
        if (request.status === 200) {
            // Parse JSON response
            var sortedTasks = JSON.parse(request.responseText);
            // Apply the selected filters to the sorted tasks
            var categoryId = document.getElementById('categoryFilter').value;
            var subjectId = document.getElementById('subjectFilter').value;
            var statusId = document.getElementById('statusFilter').value;

            sortedTasks = sortedTasks.filter(function(task) {
                return (!categoryId || task.categoryId === categoryId) && (categoryId !== '2' || !subjectId || task.subjectId === subjectId) && (!statusId || task.statusId === statusId);
            });

            // Update the task list in the UI
            allTasks = sortedTasks;
            remainingTasks = [...sortedTasks];
            totalTasks = sortedTasks.length;

            // Reset pagination to first page
            startIndex = sortedTasks.length > 0 ? 1 : 0;
            endIndex = Math.min(maxNumTasksPerPage, sortedTasks.length);

            totalTaskValue(totalTasks); // Update total task count in the UI

            if (totalTasks === 0) {
                document.querySelector('#noTaskTxt span').textContent = 'No tasks match the selected filters.';

                document.getElementById('taskTableBody').innerHTML = '';
                document.querySelector('.table-wrapper').style.display = 'none';
                document.getElementById('noTaskTxt').style.display = 'block';

                displayDynamicPageNumber();
                return;
            }

            document.getElementById('noTaskTxt').style.display = 'none';
            document.querySelector('.table-wrapper').style.display = 'block';
            // Display the first page of sorted tasks (reuse wei ye's rendering function)
            dynamicDisplayTasks(allTasks.slice(0, maxNumTasksPerPage));
            displayDynamicPageNumber(); // Update pagination display
        } else {
            console.error('Unable to sort tasks');
        }
    };

    request.send();
}

function filterTask() { // Function to filter tasks
    // Get the selected filter values
    var categoryId = document.getElementById('categoryFilter').value;
    var subjectId = document.getElementById('subjectFilter').value;
    var statusId = document.getElementById('statusFilter').value;

    // Get the Subject dropdown container
    var subjectGroup = document.getElementById('subjectFilterGroup');

    // Show Subject dropdown only for Academic
    if (categoryId === '2') {
        subjectGroup.style.display = 'flex';
    } else {
        subjectGroup.style.display = 'none';

        // Clear Subject when Academic is not selected
        document.getElementById('subjectFilter').value = '';
        subjectId = '';
    }

    // Build the API URL
    var apiUrl = '/filter-tasks';
    var params = [];

    if (categoryId) {
        params.push('categoryId=' + categoryId);
    }

    if (categoryId === '2' && subjectId) {
        params.push('subjectId=' + subjectId);
    }

    if (statusId) {
        params.push('statusId=' + statusId);
    }

    // If no filters are selected, display all tasks
    if (params.length === 0) {
        apiUrl = '/view-tasks';
    } else {
        apiUrl += '?' + params.join('&');
    }

    // Create XMLHttpRequest
    var request = new XMLHttpRequest();

    request.open('GET', apiUrl, true);

    request.onload = function () {
        if (request.status === 200) {
            var filteredTasks = JSON.parse(request.responseText);
            // Preserve the selected sorting order
            var selectedSort = document.getElementById('sortSelect').value;
            var sortOptions = selectedSort.split('-');
            var sortBy = sortOptions[0];
            var order = sortOptions[1];

            var months = {Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12};
            filteredTasks.sort(function(a, b) {
                var comparison = 0;

                if (sortBy === 'name') {
                    comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base'});
                } else if (sortBy === 'priority') {
                    comparison = Number(a.priorityId) - Number(b.priorityId);
                } else if (sortBy === 'date') {
                    comparison = Number(a.year) - Number(b.year);

                    if (comparison === 0) {
                        comparison = months[a.month] - months[b.month];
                    }

                    if (comparison === 0) {
                        comparison = a.hour.localeCompare(b.hour);
                    }
                }

                return order === 'desc' ? -comparison : comparison;
            });

             // Update shared View Tasks data
            allTasks = filteredTasks;
            remainingTasks = [...filteredTasks];
            totalTasks = filteredTasks.length;

            // Reset pagination
            startIndex = filteredTasks.length > 0 ? 1 : 0;
            endIndex = Math.min(maxNumTasksPerPage, totalTasks);

            // Update total task counter
            totalTaskValue(totalTasks);

            if (filteredTasks.length === 0) {
                document.querySelector('#noTaskTxt span').textContent =
                    params.length > 0
                        ? 'No tasks match the selected filters.'
                        : 'No task to display. Create a task to display in here';

                document.getElementById('taskTableBody').innerHTML = '';
                document.querySelector('.table-wrapper').style.display = 'none';
                document.getElementById('noTaskTxt').style.display = 'block';
            } else {
                document.getElementById('noTaskTxt').style.display = 'none';
                document.querySelector('.table-wrapper').style.display = 'block';
                dynamicDisplayTasks(allTasks.slice(0, maxNumTasksPerPage));
            }

            // Update pagination
            displayDynamicPageNumber();

        } else {
            console.error('Unable to filter tasks.');
        }
    };

    request.onerror = function () {console.error('An error occurred while filtering tasks.');};
    request.send();
}

function clearFilters() {
    // Reset Category to All Categories
    document.getElementById('categoryFilter').value = '';

    // Reset Subject to All Subjects
    document.getElementById('subjectFilter').value = '';

    // Reset Status to All Statuses
    document.getElementById('statusFilter').value = '';

    // Call the existing filter function
    filterTask();
}
