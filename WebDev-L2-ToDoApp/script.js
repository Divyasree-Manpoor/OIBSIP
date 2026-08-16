/* =========================================
   DOM ELEMENTS
========================================= */

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const filterButtons = document.querySelectorAll(".filter-button");


/* =========================================
   APPLICATION STATE
========================================= */

let tasks = loadTasks();
let currentFilter = "all";


/* =========================================
   LOCAL STORAGE
========================================= */

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem("taskManagerTasks");

        return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
        console.error("Unable to load tasks:", error);

        return [];
    }
}


function saveTasks() {
    localStorage.setItem(
        "taskManagerTasks",
        JSON.stringify(tasks)
    );
}


/* =========================================
   ADD TASK
========================================= */

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (!taskText) {
        taskInput.focus();
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    tasks.unshift(newTask);

    saveTasks();

    taskInput.value = "";

    taskInput.focus();

    renderTasks();
});


/* =========================================
   FILTER TASKS
========================================= */

filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        currentFilter = button.dataset.filter;

        filterButtons.forEach(function (item) {
            item.classList.remove("active");
        });

        button.classList.add("active");

        renderTasks();
    });
});


/* =========================================
   GET FILTERED TASKS
========================================= */

function getFilteredTasks() {

    if (currentFilter === "pending") {
        return tasks.filter(function (task) {
            return !task.completed;
        });
    }

    if (currentFilter === "completed") {
        return tasks.filter(function (task) {
            return task.completed;
        });
    }

    return tasks;
}


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

    const filteredTasks = getFilteredTasks();

    taskList.innerHTML = "";

    updateCounters();

    if (filteredTasks.length === 0) {

        emptyState.style.display = "flex";

        updateEmptyState();

        return;
    }

    emptyState.style.display = "none";

    filteredTasks.forEach(function (task) {

        const taskElement = createTaskElement(task);

        taskList.appendChild(taskElement);
    });
}


/* =========================================
   CREATE TASK ELEMENT
========================================= */

function createTaskElement(task) {

    const li = document.createElement("li");

    li.className = "task-item";

    if (task.completed) {
        li.classList.add("completed");
    }


    /* Checkbox */

    const completeButton = document.createElement("button");

    completeButton.type = "button";

    completeButton.className = "complete-button";

    completeButton.setAttribute(
        "aria-label",
        task.completed
            ? "Mark task as pending"
            : "Mark task as completed"
    );

    completeButton.textContent = task.completed ? "✓" : "";

    completeButton.addEventListener("click", function () {

        toggleTask(task.id);

    });


    /* Task Content */

    const taskContent = document.createElement("div");

    taskContent.className = "task-content";


    const taskText = document.createElement("span");

    taskText.className = "task-text";

    taskText.textContent = task.text;


    taskContent.appendChild(taskText);


    /* Actions */

    const actions = document.createElement("div");

    actions.className = "task-actions";


    /* Edit */

    const editButton = document.createElement("button");

    editButton.type = "button";

    editButton.className = "task-action";

    editButton.setAttribute(
        "aria-label",
        "Edit task"
    );

    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {

        startEditing(
            li,
            task,
            taskContent
        );

    });


    /* Delete */

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className = "task-action delete";

    deleteButton.setAttribute(
        "aria-label",
        "Delete task"
    );

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {

        deleteTask(task.id);

    });


    actions.appendChild(editButton);

    actions.appendChild(deleteButton);


    li.appendChild(completeButton);

    li.appendChild(taskContent);

    li.appendChild(actions);


    return li;
}


/* =========================================
   TOGGLE TASK
========================================= */

function toggleTask(taskId) {

    tasks = tasks.map(function (task) {

        if (task.id === taskId) {

            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();

    renderTasks();
}


/* =========================================
   DELETE TASK
========================================= */

function deleteTask(taskId) {

    tasks = tasks.filter(function (task) {
        return task.id !== taskId;
    });

    saveTasks();

    renderTasks();
}


/* =========================================
   EDIT TASK
========================================= */

function startEditing(
    listItem,
    task,
    taskContent
) {

    taskContent.innerHTML = "";


    const editInput = document.createElement("input");

    editInput.type = "text";

    editInput.className = "edit-input";

    editInput.value = task.text;

    editInput.maxLength = 150;

    taskContent.appendChild(editInput);

    editInput.focus();

    editInput.select();


    function finishEditing() {

        const updatedText = editInput.value.trim();

        if (!updatedText) {
            renderTasks();
            return;
        }

        tasks = tasks.map(function (item) {

            if (item.id === task.id) {

                return {
                    ...item,
                    text: updatedText
                };
            }

            return item;
        });

        saveTasks();

        renderTasks();
    }


    editInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                finishEditing();
            }


            if (event.key === "Escape") {

                renderTasks();
            }
        }
    );


    editInput.addEventListener(
        "blur",
        finishEditing
    );
}


/* =========================================
   COUNTERS
========================================= */

function updateCounters() {

    const total = tasks.length;

    const completed = tasks.filter(
        function (task) {
            return task.completed;
        }
    ).length;

    const pending = total - completed;


    totalCount.textContent = total;

    pendingCount.textContent = pending;

    completedCount.textContent = completed;
}


/* =========================================
   EMPTY STATE
========================================= */

function updateEmptyState() {

    const title = emptyState.querySelector("h2");

    const description = emptyState.querySelector("p");


    if (currentFilter === "pending") {

        title.textContent = "No pending tasks";

        description.textContent =
            "All your tasks are completed.";

        return;
    }


    if (currentFilter === "completed") {

        title.textContent = "No completed tasks";

        description.textContent =
            "Complete a task and it will appear here.";

        return;
    }


    title.textContent = "No tasks yet";

    description.textContent =
        "Add your first task to get started.";
}


/* =========================================
   INITIAL RENDER
========================================= */

renderTasks();