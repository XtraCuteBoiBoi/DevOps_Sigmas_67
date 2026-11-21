# DevOps Project Part 1
## Name of application: SigTask Anchovy

A web-based task management application developed as part of a DevOps group project: Part 1. The application helps users organise, manage, and track their tasks through a simple and user-friendly interface.

The project also demonstrates collaborative software development practices such as Git branching, pull requests, code review, merge conflict resolution, and version control.

## Features

The application is designed to support the following functionalities:
| Feature | Description |
|:--------|:------------|
| Create Tasks | Add new tasks with relevant information such as name, category, priority, status, and due date. |
| View Tasks | Display existing tasks in a structured table (up to 5 rows) with pagination. |
| Edit Tass | Modify information associated with existing tasks. |
| Delete Tasks | Remove tasks that are no longer required. |
| Sort Tasks | Sort tasks alphabetically, by priority, or chronologically, in ascending or descending order. |
| Filter Tasks | Filter tasks by category and status, with an additional subject filter for Academic tasks. |
| Search Tasks | Search for specific tasks by name |

### Additional interface features:

- Simultaneous sorting and filtering
- Conditional Subject dropdown for Academic tasks
- Clear All Filters button
- Dynamic task counts and pagination
- Empty-state feedback when no tasks match the selected filters

## Technologies Used

| Technology | Purpose |
|:-----------|:--------|
| HTML5 | Structure of the web application |
| CSS3 | Interface styling and responsive layout |
| JavaScript | Frontend functionality and user interactions |
| Node.js | Server-side JavaScript runtime |
| Express.js | Backend server and REST API endpoints |
| JSON | Task data storage |
| Git | Version control |
| GitHub/GitHub Desktop | Repository hosting and collaboration, and visual git workflow management |
| Postman | API Testing |
| Visual Studio Code | Code development and debugging |
| Jira | Project planning and task tracing |

## Project Structure

The project follows a separation between frontend resources, backend utilities, and task data.
``` bash
project-root/
├── models/
│   ├── Task.js
│   ├── Category.js
│   ├── Priority.js
│   ├── Subject.js
│   └── Status.js
│
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── images/
│   │   └── [icons.svg]
│   ├── js/
│   │   └── ayers.js
│   │   └── jana.js
│   │   └── jorell.js
│   │   └── weiye.js
│   └── index.html
│
├── utils/
│   ├── AyersUtil.js
│   ├── JanaUtil.js
│   ├── JorellUtil.js
│   ├── WeiYeUtil.js
│   ├── task.json
│   ├── category.template.json
│   ├── priority.template.json
│   ├── status.template.json
│   ├── subject.template.json
│   └── task.template.json
│
├── index.js
├── .gitattributes
├── package.json
└── README.md
```

### Directory descriptions:
- models/ ── Contains data models used by the application
- public/ ── Contains the frontend HTML, CSS, and JavaScript files
- utils/ ── Contains backend utility functions and JSON task data
- index.js ── Configures the Express server and registers API routes

## Installation and Setup

1. Clone the repository.
2. Install the required dependencies:

   ```npm install```

3. Start the server:

   ```node index.js```

4. Open http://localhost:5050 in your browser.

## Task Data Structure

Tasks are stored as JSON objects.

Example:
``` bash
{
  "id": "1",
  "name": "Complete DevOps Report",
  "categoryId": "2",
  "subjectId": "4",
  "priorityId": "1",
  "statusId": "2",
  "month": "Nov",
  "year": "2026",
  "hour": "23:59"
}
```

Task attributes include:
- id — Unique task identifier
- name — Task name
- categoryId — Category identifier
- subjectId — Subject identifier, where applicable
- priorityId — Priority identifier
- statusId — Status identifier
- month, year, hour — Due date and time information

The application uses predefined identifiers to represent categories, priorities, statuses, and academic subjects/modules.

## Version Control and Collaboration

The project uses Git and GtHub to support collaborative development.

### Branching Strategy

The ```main``` branch serves as the primary integration branch.

Individual features are developed on separate branches, such as:
``` bash
main
├── view-task
├── edit-task
├── create-task
├── delete-task
├── filter-tasks
├── sort-tasks
└── Search-task
```

### Development Workflow
- Create/Switch to the relevant feature branch
- Test API endpoints using Postman
- Implement and test frontend & backend functionality
- Commit changes with descriptive messages
- Push the feature branch to GitHub
- Create a pull request targeting main
- Review and resolve any merge conflicts
- Merge approved changes into main

### Source Control Practices

The team applied the following processes:
- Feature-based branching
- Descriptive commit messages
- Pull requests for feature integration
- Code reviews before merging
- Regular integration of changes from ```main```
- Manual merge conflict resolution when necessary

### Testing

Backend functionality is tested through Postman, while frontend functionality is tested through browser interactions.

Testing covers:
- Successful retrieval of task data
- Successful creation of task data
- Successful updating of task data
- Successful deletion of task data
- Sorting by name, priority, and date
- Filtering by category, status, and subject
- Multiple filtering conditions
- Simultaneous sorting and filtering
- Resetting filtering selections
- Empty filtering results
- Searching tasks by name
- Pagination and task count updates
- Invalid API query parameters

## Project Management

Jira was used to organise development tools, user stories, tasks, and sprint activities. 

The project is divided into feature-related work items, allowing development progress to be tracked throughout the sprint.

## Contributors

This project was developed by a team of four students as part of the DevOps Essentials module.

| Contributor | Responsibilities |
|-------------|------------------|
| Jorell | Create and Delete Tasks |
| Wei Ye | View and Edit Tasks |
| Jana | Sort and Filter Tasks |
| Ayers | Search Tasks |

## Teaching Tutor
Mr Allen

## License

Developed for educational purposes.
