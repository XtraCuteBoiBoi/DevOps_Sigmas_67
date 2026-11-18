var remainingTasks = [];
var allTasks = [];
var totalTasks = 0;
var maxNumTasksPerPage = 5;

// display all tasks and fetch API
function viewTask() {
    var apiUrl = '/view-tasks';
    fetch(apiUrl, {
        method: 'GET'
    })
    .then(async response => {
        if(!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Server is not responding.');
        }
        return response.json()
    })
    .then(data => {
        if (!Array.isArray(data)) {
            throw new Error('Invalid JSON structure')
        } 
        allTasks = data;
        remainingTasks = [...data]
        totalTasks = data.length;
        // totalTaskValue(data.length)
        dynamicDisplayTasks(allTasks.slice(0, 5))
        
    })
    .catch(error => {
        console.error('Error:', error);
        // display error text
        displayErrorText(error)
    });
}
// display error text to frontend
function displayErrorText(err) {
    var mainEle = document.querySelector('main');
    var spanEle = document.getElementById('serverErrText');

    // make the main content such as tables and search bar to 'hide' mode
    mainEle.style.display = "none";
    // insert text in span element
    switch (err.message) {
        // server error
        case 'Error: Server is not responding.':
            spanEle.innerText = "Could not display data due to server error. Please contact your administrator.";
            break;
        // empty JSON file (no any value inside JSON file)
        case 'Empty JSON file':
            spanEle.innerText = 'JSON file is empty. Please provide valid JSON data. Please contact your administrator.';
            break;
        // invalid json structure (missing starting array in JSON file, but JSON syntax is correct)
        case 'Invalid JSON structure':
            spanEle.innerText = "Invalid JSON structure. Please check your task.json file.";
            break;
        // invalid JSON syntax (missing curly braces)
        case 'Invalid JSON syntax': 
            spanEle.innerText = "Invalid JSON syntax. Please check your task.json file."
            break;
        // missing data field(s) of a task
        case 'Missing data field(s) of a task!':
            spanEle.innerText = "Missing data fields in a task! Please check your task.json file."
            break;
        // any errors that does not match any case will display this text instead
        default:
            spanEle.innerText = "An unexpected error has occured. Please contact your administrator.";
            break;
    };
    
    // make span element to 'appear/show' mode
    spanEle.style.display = "block";
}

// display total tasks value
function totalTaskValue(total) {
    document.getElementById('totalTasks').innerText = `${total}`;
}

// display dynamic table row HTML using JS
function dynamicDisplayTasks(tasks) {
    var categoryValue = '';
    var subjectValue = '';
    var priorityValue = '';
    var statusValue = '';
    var dueDateFormat = '';
    var statusClassNameBtn = '';
    var divEle = document.getElementById('noTaskTxtWrapper');
    var tableEle = document.querySelector('.table-wrapper');
    var htmlEle = document.getElementById('taskTableBody')
    var container = '';
    var task = '';
    var iconValue = '';

     // Display txt if no data is created in DB
    if(allTasks.length < 1) {
        tableEle.style.display = "none";
        divEle.innerText = 'No task to display. Create a task to display in here.'
        divEle.style.display = "block"
        return;
    }

    tableEle.style.display = "block";
    divEle.style.display = "none";

    for(var i = 0; i < tasks.length; i++) {

        // store the item into a variable
        task = tasks[i]

        // check if any fields are missing
        if(task.id === undefined ||
            task.name === undefined ||
            task.categoryId === undefined ||
            task.priorityId === undefined ||
            task.statusId === undefined ||
            task.month === undefined ||
            task.year === undefined ||
            task.hour === undefined
        ) {
            var divEle = document.getElementById('noTaskTxtWrapper');
            var spanEle = document.getElementById('noTaskTxt');

            totalTaskValue(0)
            // display text
            divEle.style.display = "block"
            spanEle.innerText = "Missing data fields! Could not display data properly."
            return;
        }

        totalTaskValue(allTasks.length)
        
        // category conditional 
        switch (String(task.categoryId)){
            // personal
            case '1':
                iconValue = `
                    <svg fill="#b85d72" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 15.503A5.041 5.041 0 1 0 16 5.42a5.041 5.041 0 0 0 0 10.083zm0 2.215c-6.703 0-11 3.699-11 5.5v3.363h22v-3.363c0-2.178-4.068-5.5-11-5.5z"
                        stroke-width="2"
                    />
                    </svg>
                `;
                categoryValue = 'Personal';
                break
            // academic
            case '2':
                iconValue = `
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 11.4999H7M6 15.4999H7M17 15.4999H18M17 11.4999H18M11.5 11.4999H12.5M10 20.9999V16.9999C10 15.8954 10.8954 
                        14.9999 12 14.9999C13.1046 14.9999 14 15.8954 14 16.9999V20.9999M17 7.49995L18.5761 7.89398C19.4428 8.11064 19.8761 
                        8.21898 20.1988 8.46057C20.4834 8.67373 20.7061 8.95895 20.8439 9.28682C21 9.65843 21 10.1051 21 10.9984V17.7999C21 
                        18.9201 21 19.4801 20.782 19.9079C20.5903 20.2843 20.2843 20.5902 19.908 20.782C19.4802 20.9999 18.9201 20.9999 17.8 
                        20.9999H6.2C5.0799 20.9999 4.51984 20.9999 4.09202 20.782C3.71569 20.5902 3.40973 20.2843 3.21799 19.9079C3 19.4801 3 
                        18.9201 3 17.7999V10.9984C3 10.1051 3 9.65843 3.15613 9.28682C3.29388 8.95895 3.51657 8.67373 3.80124 8.46057C4.12389 
                        8.21898 4.55722 8.11064 5.42388 7.89398L7 7.49995L9.85931 4.92657C10.6159 4.2456 10.9943 3.90512 11.4221 3.77598C11.799 
                        3.66224 12.201 3.66224 12.5779 3.77598C13.0057 3.90512 13.3841 4.2456 14.1407 4.92657L17 7.49995Z" 
                        stroke="#000000" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `;
                categoryValue = 'Academic';
                break
            // work
            case '3':
                iconValue = `
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 
                        7 19 7H15M9 7V5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7M9 7H15" 
                        stroke="#000000" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `;
                categoryValue = 'Work';
                break
            // errands
            case '4':
                iconValue = `
                    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                        <g>
                            <g fill="#ffffff" transform="translate(70.530593, 46.125620)">
                                <path d="M185.469407,39.207713 L356.136074,39.207713 L356.136074,81.8743797 L185.469407,81.8743797 L185.469407,39.207713 
                                Z M185.469407,188.541046 L356.136074,188.541046 L356.136074,231.207713 L185.469407,231.207713 L185.469407,188.541046 Z
                                M14.8027404,295.207713 L121.469407,295.207713 L121.469407,401.87438 L14.8027404,401.87438 L14.8027404,295.207713 Z 
                                M46.8027404,327.207713 L46.8027404,369.87438 L89.4694071,369.87438 L89.4694071,327.207713 L46.8027404,327.207713 Z 
                                M185.469407,337.87438 L356.136074,337.87438 L356.136074,380.541046 L185.469407,380.541046 L185.469407,337.87438 Z 
                                M119.285384,-7.10542736e-15 L144.649352,19.5107443 L68.6167605,118.353113 L1.42108547e-14,58.3134476 L21.0721475,34.2309934 
                                L64.0400737,71.8050464 L119.285384,-7.10542736e-15 Z M119.285384,149.333333 L144.649352,168.844078 L68.6167605,267.686446 
                                L1.42108547e-14,207.646781 L21.0721475,183.564327 L64.0400737,221.13838 L119.285384,149.333333 Z">
                                </path>
                            </g>
                        </g>
                    </svg>
                `;
                categoryValue = 'Errands';
                break
            // entertainment
            case '5':
                iconValue = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                        <g fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21,12.2c-3.4,0-6.7-0.4-9.6-1.2c-0.2,1.3-0.4,2.7-0.4,4.1C11,23.9,15.5,31,21,31s10-7.1,10-15.9c0-1.4-0.1-2.8-0.4-4.1C27.7,11.8,24.4,12.2,21,12.2z"/>
                            <path d="M21,24.1c-1.5,0-2.9-0.4-4-1.1c0.2,2.2,1.9,4,4,4s3.8-1.8,4-4C23.9,23.7,22.5,24.1,21,24.1z"/>
                            <path d="M15,20c0-1.1,0.9-2,2-2s2,0.9,2,2"/>
                            <path d="M23,20c0-1.1,0.9-2,2-2s2,0.9,2,2"/>
                            <path d="M20,12.2c0.7-2.1,1-4.5,1-7c0-1.4-0.1-2.8-0.4-4.1c-3,0.8-6.2,1.2-9.6,1.2S4.3,1.8,1.4,1C1.1,2.3,1,3.7,1,5.1C1,13.9,5.5,21,11,21c0.2,0,0.5,0,0.7,0"/>
                            <path d="M11,14.9c-1.5,0-2.9,0.4-4,1.1c0.2-2.2,1.9-4,4-4"/>
                            <path d="M5,7c0,1.1,0.9,2,2,2s2-0.9,2-2"/>
                            <path d="M13,7c0,1.1,0.9,2,2,2s2-0.9,2-2"/>
                        </g>
                    </svg>
                `;
                categoryValue = 'Entertainment';
                break
        }

        // subject conditional
        switch (String(task.subjectId)){
            case '1':
                subjectValue = 'ITAD';
                break;
            case '2':
                subjectValue = 'MLDP';
                break;
            case '3':
                subjectValue = 'FWEB';
                break
            case '4':
                subjectValue = 'DVOPS';
                break;
            case '5':
                subjectValue = 'CMATH';
                break;
            case '6':
                subjectValue = 'PROCOMM';
                break;
            case '7':
                subjectValue = 'GL';
                break;
            case '8':
                subjectValue = 'SCA';
                break;
        }

        // priority conditional
        switch (String(task.priorityId)){
            // high
            case '1':
                priorityValue = 'High';
                break
            // medium
            case '2':
                priorityValue = 'Medium';
                break
            // low
            case '3':
                priorityValue = 'Low';
                break
        }

        // status conditional
        switch (String(task.statusId)) {
            // overdue
            case '1':
                statusClassNameBtn = 'status-overdue'
                statusValue = 'Overdue';
                break
            // pending
            case '2':
                statusClassNameBtn = 'status-pending'
                statusValue = 'Pending';
                break
            // completed
            case '3':
                statusClassNameBtn = 'status-completed'
                statusValue = 'Completed'
                break
        }

        dueDateFormat = `${task.month} ${task.year}, ${task.hour}`;
        var counter = 0
    
        container += `
            <tr>
                <td>
                    <!-- icon button -->
                    <div>
                        <button class="action-btn">
                            ${iconValue}
                        </button>
                    </div>
                </td>
                <td>${task.name}</td>
                <td>${categoryValue == 'Academic' ? subjectValue : categoryValue}</td>
                <td>${priorityValue}</td>
                <td>
                    <button class="statusBtn ${statusClassNameBtn}">
                        ${statusValue}
                    </button>
                </td>
                <td>${dueDateFormat}</td>
                <td style="display: flex; gap: 10px;">
                    <!-- edit button -->
                    <div>
                        <button class="action-btn" onclick='displayDataInModal(this)' restId="${task.id}">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

        counter+1
    }

    htmlEle.innerHTML = container;
    displayDynamicPageNumber()
}

var startIndex = 1;
var endIndex = 5; 

// dynamic display current tasks per page out of total tasks
function displayDynamicPageNumber() {
    var currentPageEle = document.getElementById('currentDisplayedValue');
    var totalTaskEle = document.getElementById('totalTaskValue');

    if(allTasks.length < 1) {
        startIndex = 0;
        endIndex = 0
    }

    currentPageEle.innerText = `${startIndex} - ${endIndex}`
    totalTaskEle.innerText = totalTasks;
}
// prev page button
function prevPage() {
    // if start index is 6,11, 17 ...
    if (startIndex > 1) {
        // minus endIndex
        endIndex = startIndex - 1;
        startIndex -= 5;
        // display tasks from the range using slice
        dynamicDisplayTasks(allTasks.slice(startIndex - 1, endIndex));
    }
}
// next page button
function nextPage() {
   if (endIndex < totalTasks) {
        startIndex = endIndex + 1;
        endIndex += 5;

        if (endIndex > totalTasks) {
            endIndex = totalTasks;
        }
        // display tasks from the range using slice
        dynamicDisplayTasks(allTasks.slice(startIndex - 1, endIndex));
    }
}

// edit task
// get task data by ID
async function getTaskById(taskId) {
    var apiUrl = `/tasks/${taskId}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET'
        })

        const data = await response.json();

        if(!response.ok) {
            throw new Error(data.message || 'Server is not responding.');
        }
        
        return data;
        
    } catch(error) {
        console.error('Error: ', error)
    }
}

// Pre-fill data to the input elements in the modal pop-up
async function displayDataInModal(btn) {
    var id = btn.getAttribute('restId')

    const task = await getTaskById(id)

    // match corresponding month and output the value using dict[index]
    var numericMonth = {
        "Jan": "01",
        "Feb": "02",
        "Mar": "03",
        "Apr": "04",
        "May": "05",
        "Jun": "06",
        "Jul": "07",
        "Aug": "08",
        "Sep": "09",
        "Oct": "10",
        "Nov": "11",
        "Dec": "12",
    }

    // format date and time
    var endDateFormat = `${task.year}-${numericMonth[task.month]}-01`;
    var endTimeFormat = `${task.hour}:00`;

    // display value into input fields
    document.getElementById('editName').value = task.name;
    document.getElementById('editCategory').value = task.categoryId;
    document.getElementById('editSubject').value = task.subjectId;
    document.getElementById('editPriority').value = task.priorityId;
    document.getElementById('editStatus').value = task.statusId;
    document.getElementById('editEndDate').value = endDateFormat;
    document.getElementById('editEndTime').value = endTimeFormat;
    document.getElementById('taskId').value = task.id;
    
    // check if the subject value of the task is null
    var subjectContainer = document.getElementById('subject-container');
    // hide subject input if value is null
    if(task.subjectId === null) {
        subjectContainer.style.display = "none";
    } else {
        subjectContainer.style.display = "flex";
    }

    // open modal
    openEditTaskModal()
}

// display subject input field whenever 'Academic' value in category field is clicked
function showSubjects() {
    var subjectDiv = document.getElementById('subject-container');
    var categoryValue = document.getElementById('editCategory').value;

    // if the category value is 'Academic', display the subject field
    if(categoryValue === '2') {
        subjectDiv.style.display = "flex";
    } else {
        subjectDiv.style.display = "none";
    }
    
}

// open modal
function openEditTaskModal() {
    var modalEle = document.getElementById('edit-modal');
    var contentLayoutEle = document.getElementById('content-layout')

    // 'appear' mode for modal to appear
    modalEle.style.display = "block";
    // increase opacity, allow cursor only to default (else it still can select or click other things in the background) and no pointerevent
    contentLayoutEle.style.opacity = "0"
    contentLayoutEle.style.cursor = "cursor"
    // by setting pointerEvent to none, it only allow to interact with the modal only (cannot interact elements, etc in the background)
    contentLayoutEle.style.pointerEvents = "none"
}

// close modal
function closeEditTaskModal() {
    var modalEle = document.getElementById('edit-modal');
    var contentLayoutEle = document.getElementById('content-layout')

    // 'appear' mode for modal to appear
    modalEle.style.display = "none";
    // increase opacity, allow cursor only to default (else it still can select or click other things in the background) and no pointerevent
    contentLayoutEle.style.opacity = "1"
    contentLayoutEle.style.cursor = "default"
    // by setting pointerEvent to none, it only allow to interact with the modal only (cannot interact elements, etc in the background)
    contentLayoutEle.style.pointerEvents = "auto"
}

// close button in the modal
function closeEditButton() {
    closeEditTaskModal()
}

// listen to submit button when on clicked
document.getElementById('editForm').addEventListener("submit", function(event) {
    event.preventDefault();
    updateTask()
})

// submit updated data to the backend API
function updateTask() {
    var id = document.getElementById('taskId').value;
    var name = document.getElementById('editName').value;
    var categoryId = document.getElementById('editCategory').value;
    var subjectId = document.getElementById('editSubject').value;
    var priorityId = document.getElementById('editPriority').value;
    var statusId = document.getElementById('editStatus').value;
    var endDate = document.getElementById('editEndDate').value;
    var endTime = document.getElementById('editEndTime').value;

    if(name.trim() === '') {
        alert("Task name must not be empty!")
        return;
    }

    // sample data: 2026-11-01 14:00:00
    var [year, month] = endDate.split('-')
    var [hour, second] = endTime.split(':')
    // format hour
    hour = `${hour}:${second}`;

    // match numbers to month (words)
    const months = {
        "01": "Jan",
        "02": "Feb",
        "03": "Mar",
        "04": "Apr",
        "05": "May",
        "06": "Jun",
        "07": "Jul",
        "08": "Aug",
        "09": "Sep",
        "10": "Oct",
        "11": "Nov",
        "12": "Dec",
    }

    // if category is not "Academic", set the subjectId to null to prevent saving the previous subjectId value if any
    if(categoryId !== '2') {
        subjectId = null;
    }

    // create JSON object from input fields
    var jsonData = {
        name: name.trim(),
        categoryId: categoryId,
        subjectId: subjectId,
        priorityId: priorityId,
        statusId: statusId,
        month: months[month],
        year: year,
        hour: hour
    }

    // call the API and send updated task to DB
    sendUpdatedTask(id, jsonData)
}
// call API to update data in DB
async function sendUpdatedTask(id, jsonData) {
    try {
        const response = await fetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message ||'Server is not responding.');
        }

        console.log('updatedData', data);

        if (data.message == "Task updated successfully!") {
            alert("Task updated successfully!");
            closeEditTaskModal()
            showUpdatedSuccessNotifcation(data.task.name)
            viewTask();
            
        } else {
            alert("Unable to update task!");
        }

    } catch(error) {
        console.error(error);
    }
}

// display a notifiction top-right corner that task has been updated successfully
function showUpdatedSuccessNotifcation(name) {
    var notiContainer = document.getElementById('updatedNotificationContainer');
    var taskName = document.getElementById('updatedTaskName');

    taskName.innerText = `"${name}"`
    notiContainer.style.display = "block"

    setTimeout(() => {
        notiContainer.style.display = "none"
    }, 5000)
}