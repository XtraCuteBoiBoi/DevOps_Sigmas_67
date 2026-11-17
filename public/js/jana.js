function sortTask() {
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

            // Update the task list in the UI
            allTasks = sortedTasks;
            remainingTasks = [...sortedTasks];
            totalTasks = sortedTasks.length;

            // Reset pagination to first page
            startIndex = sortedTasks.length > 0 ? 1 : 0;
            endIndex = Math.min(maxNumTasksPerPage, sortedTasks.length);

            totalTaskValue(totalTasks); // Update total task count in the UI

            // Display the first page of sorted tasks (reuse wei ye's rendering function)
            dynamicDisplayTasks(allTasks.slice(0, maxNumTasksPerPage));
            displayDynamicPageNumber(); // Update pagination display
        } else {
            console.error('Unable to sort tasks');
        }
    };

    request.send();
}