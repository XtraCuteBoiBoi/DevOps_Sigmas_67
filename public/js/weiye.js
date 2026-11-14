// display all tasks and fetch API
function viewTask() {
    var apiUrl = '/view-tasks';
    fetch(apiUrl, {
        method: 'GET'
    })
    .then(response => {
        if(!response.ok) {
            throw new Error('Server is not responding.');
        }
        return response.json()
    })
    .then(data => {
        console.log('data:', data)
        totalTaskValue(data.length)
        dynamicDisplayTasks(data)
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// display total tasks value
function totalTaskValue(total) {
    document.getElementById('totalTasks').innerText = `${total}`;
}

// display dynamic table row HTML using JS
function dynamicDisplayTasks(tasks) {
    console.log('tasks',tasks)
    var categoryValue = '';
    var priorityValue = '';
    var statusValue = '';
    var dueDateFormat = '';
    var divEle = document.getElementById('noTaskTxt');
    var tableEle = document.querySelector('.table-wrapper');
    var htmlEle = document.getElementById('taskTableBody')
    var container = '';

    for(var i = 0; i < 5; i++) {

        // Display txt if no data is created in DB
        if(tasks.length < 1) {
            tableEle.style.display = "none";
            divEle.style.display = "block"
            return;
        }

        tableEle.style.display = "block";
        divEle.style.display = "none";
        
        // category conditional 
        switch (tasks[i].categoryId)
            {
                case '1':
                    categoryValue = 'Personal';
                    break
                case '2':
                    categoryValue = 'Academic';
                    break
                case '3':
                    categoryValue = 'Work';
                    break
                case '4':
                    categoryValue = 'Errands';
                    break
                case '5':
                    categoryValue = 'Entertainment';
                    break
            }

        // priority conditional
        switch (tasks[i].priorityId)
            {
                case '1':
                    priorityValue = 'High';
                    break
                case '2':
                    priorityValue = 'Medium';
                    break
                case '3':
                    priorityValue = 'Low';
                    break
            }

        // status conditional
        switch (tasks[i].statusId) {
            case '1':
                statusValue = 'Overdue';
                break
            case '2':
                statusValue = 'Pending';
                break
            case '3':
                statusValue = 'Completed'
                break
        }

        dueDateFormat = `${tasks[i].month} ${tasks[i].year}, ${tasks[0].hour}`;
    
        container += `
            <tr>
                <td>Icon</td>
                <td>${tasks[i].name}</td>
                <td>${categoryValue}</td>
                <td>${priorityValue}</td>
                <td>${statusValue}</td>
                <td>${dueDateFormat}</td>
                <td style="display: flex; gap: 10px;">
                    <!-- edit button -->
                    <div>
                        <button class="action-btn">
                            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 
                                12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 
                                1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 
                                3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 
                                6.16524 21.2799 6.40005V6.40005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 
                                20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" 
                                stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;

    }
    console.log('tasks', tasks)
    
    htmlEle.innerHTML = container;

    displayDynamicPageNumber(tasks.length)
    
}

// dynamic display current tasks per page out of total tasks
function displayDynamicPageNumber(totalTasks) {
    var currentPageEle = document.getElementById('currentDisplayedValue');
    var totalTaskEle = document.getElementById('totalTaskValue');
    const tableRowCount = document.querySelectorAll('tr').length-1
    console.log('table row: ', tableRowCount)
    var hasData = '';
    if(totalTasks.length > 0) {
        hasData = true;
    } else {
        hasData = false;
    }
    hasData = true;
    currentPageEle.innerText = `${hasData ? 1 : 0} - 6`;
    totalTaskEle.innerText = `${totalTasks}`;
}

function nextPage(tasks) {
    console.log('next', tasks)
}

