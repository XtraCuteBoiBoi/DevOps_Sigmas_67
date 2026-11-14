// Pre-fill data to the input elements in the modal pop-up
function displayDataInModal(data) {
    var selectedTask = JSON.parse(data);
    console.log('selectedTask:', selectedTask)
    // // Pre-fill the modal input fields with the current task details
    document.getElementById('editName').value = selectedTask.name;
    document.getElementById('editCategory').value = selectedTask.categoryId;
    document.getElementById('editPriority').value = selectedTask.priorityId;
    document.getElementById('editStatus').value = selectedTask.statusId;
    document.getElementById('editMonth').value = selectedTask.month;
    document.getElementById('editYear').value = selectedTask.year;
    document.getElementById('editHour').value = selectedTask.hour;
    // depends what id on the code of where is the modal at
    document.getElementById('modal').style.display = "block"
    
}

// Send updated task data to the backend API
async function updateTask(id) {
    // var response = "";
    // create JSON object from input fields
    var jsonData = {
        name: document.getElementById('editName').value,
        categoryId: document.getElementById('editCategory').value ,
        priorityId: document.getElementById('editPriority').value,
        statusId: document.getElementById('editStatus').value,
        month: document.getElementById('editMonth').value,
        year: document.getElementById('editYear').value,
        hour: document.getElementById('editHour').value
    }
    // Basic validation to ensure all fields are filled
    if(jsonData.name == "" || 
        jsonData.categoryId == "" || 
        jsonData.priorityId == "" || 
        jsonData.statusId == "" || 
        jsonData.month == "" || 
        jsonData.year == "" || 
        jsonData.hour == ""
    ) {
        alert("All fields are required!");
        return;
    }

    // Configure the request as PUT to the task-resource endpoint with the resource ID
    const formElement = document.getElementById('update-task-form');
    const formData = new FormData(formElement);
    const taskData = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`/edit-task/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })

        if (!response.ok) {
            throw new Error('Server is not responding.');
        }

        const data = await response.json();

        console.log('data', data);

        if (data.message == "Task updated successfully!") {
            alert("Task updated successfully!");
            document.getElementById('modal').style.display = "none";
            viewTasks();
        } else {
            alert("Unable to update task!");
        }

    } catch(error) {
        console.error()
    }
};

