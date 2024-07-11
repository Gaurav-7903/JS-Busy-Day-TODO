const API_KEY = "9b740d3a887a698b9872524b3397fac6";
const API = `https://api.openweathermap.org/data/2.5/weather?lat=22.3039&lon=70.8022&appid=${API_KEY}`;

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthsOfYear = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
let totalTodo = 1;

let originalTaskOrder = new Map();

if (!localStorage.getItem("userName")) {
    const userName = prompt("Enter your Name");
    localStorage.setItem("userName", userName);
}
const user = localStorage.getItem("userName");
document.getElementById("userName").textContent = user;

const add_new_list = document.querySelector(".add-list-btn");
const mainTodoContainer = document.querySelector(".main-wrapper");

const filters = document.getElementById("filter");
const sorting = document.getElementById("sorting");
const searchInput = document.getElementById('search')

// filer task
function filterTasks() {
    const filterValue = filters.value;
    document.querySelectorAll(".todo-wrapper").forEach((list) => {
        list.querySelectorAll(".todo-item").forEach((task) => {
            const isCompleted = task.querySelector("input[type='checkbox']").checked;
            if (
                filterValue === "all" ||
                (filterValue === "completed" && isCompleted) ||
                (filterValue === "pending" && !isCompleted)
            ) {
                task.style.display = "flex";
            } else {
                task.style.display = "none";
            }
        });
    });
}
filters.addEventListener("change", filterTasks);


// sorting task
function sortTasks() {
    const sortingValue = sorting.value;
    console.log(sortingValue);
    document.querySelectorAll(".todo-wrapper").forEach((list) => {


        const mapKey = list.querySelector('h2').textContent;
        console.log("Map Key",originalTaskOrder.get(mapKey));

        const tasksArray = Array.from(list.querySelectorAll(".todo-item"));
        console.log(tasksArray);
        tasksArray.sort((a, b) => {
            const aText = a.querySelector(".task-text").innerText.toLowerCase();
            const bText = b.querySelector(".task-text").innerText.toLowerCase();
            
            if (sortingValue === "asc") {
                return aText.localeCompare(bText);
            } else if (sortingValue === "desc") {
                return bText.localeCompare(aText);  
            } else if (sortingValue === "oldest") {
                // Assuming tasks have a data attribute for their creation date
                const aDate = new Date(a.getAttribute("data-created"));
                const bDate = new Date(b.getAttribute("data-created"));
                return aDate - bDate;
            } else if (sortingValue === "newest") {
                // Assuming tasks have a data attribute for their creation date
                const aDate = new Date(a.getAttribute("data-created"));
                const bDate = new Date(b.getAttribute("data-created"));
                return bDate - aDate;
            }
        }).forEach((task) => list.querySelector("ul").appendChild(task));
    });
}

sorting.addEventListener("change", sortTasks);

// searching for tasks
function searchTasks() {
    const searchValue = searchInput.value.toLowerCase();

    document.querySelectorAll(".todo-wrapper").forEach((list) => {
        const title = list.querySelector(".editable-title").textContent.toLowerCase();
        const tasks = list.querySelectorAll(".todo-item");
        let listMatches = false;

        // Check if the title matches the search value
        if (title.includes(searchValue)) {
            listMatches = true;
            list.style.display = "block";
            tasks.forEach((task) => {
                task.style.display = "flex"; // Show all tasks if the title matches
            });
        } else {
            // Check if any task matches the search value
            tasks.forEach((task) => {
                const taskText = task.querySelector(".task-text").textContent.toLowerCase();
                if (taskText.includes(searchValue)) {
                    task.style.display = "flex";
                    listMatches = true;
                } else {
                    task.style.display = "none";
                }
            });
            if (!listMatches) {
                list.style.display = "none";
            }
        }
    });
}

searchInput.addEventListener('input', searchTasks);

// adding new list
add_new_list.addEventListener("click", addNewList);

function setDate() {
    var today = new Date();
    var formattedDate =
        daysOfWeek[today.getDay()] +
        ", " +
        monthsOfYear[today.getMonth()] +
        " " +
        today.getDate();
    document.getElementById("date").textContent = formattedDate;
}
setDate();


function decideDay(date) {
    const today = new Date();
    const dateObj = new Date(date);
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    const dayDiff = (dateObj - today) / (1000 * 60 * 60 * 24);
    console.log(dayDiff);
    if (dayDiff === 0) {
        return "Today";
    } else if (dayDiff === 1) {
        return `Tomorrow, ${date.toLocaleString().slice(4)}`;
    } else {
        return date; // Or you could return any other string
    }
}

function kelvinToCelsius(kelvin) {
    return kelvin - 273.15;
}

async function fetchTemperature() {
    const response = await fetch(API);
    const data = await response.json();
    document.getElementById("temperature").textContent = `${Math.trunc(
        kelvinToCelsius(data.main.temp)
    )}C`;
    document.getElementById(
        "temperature-icon"
    ).src = `assets/weather/${data.weather[0].icon}.svg`;
}
fetchTemperature();

function addNewList( event, listData = undefined, id = Date.now().toString() , heading = "Add title", date = new Date().toDateString(), contenteditable = true
) {
    console.log("ListData  ", listData);
    let bg_index = totalTodo % 5;
    totalTodo++;
    const newTodoContainer = document.createElement("li");
    newTodoContainer.classList.add("todo-wrapper");
    newTodoContainer.setAttribute("list-id", id);
    newTodoContainer.innerHTML = `
        <div class="card bg-color-${bg_index}">
              <div class="todo-header flex">
                <h2 class="fs-todo-heading | editable-title" contenteditable=${contenteditable}>${heading}</h2>
                <button visible="false" class="delete-list">
                  <img src="assets/delete_icon.svg" alt="" />
                </button>
              </div>

              <div class="todo-date">
                <button class="cal-btn" visible="false"><img src="assets/calendar.svg" alt="Calendar Icon" class="calendar-icon"></button>
                <input type="text" class="due-date">
                <p>${date.startsWith("Today") || date.startsWith("Tomorrow") ?date : decideDay(date)}</p>
            </div>

              <ul class="todo-list" role="list">
            </ul>
                <div class="task-input-container">
                  <input type="text" name="" id="" placeholder="Add a Task" class="add-new-task" />
                </div>
            </div>
    `;

    if (listData) {
        console.log("This is List Data of Loading", listData);
        const listId = id;
        const ul = newTodoContainer.querySelector("ul");
        originalTaskOrder.set(listId, []);
        listData.forEach((taskData) => {
            console.log(taskData);
            const task = document.createElement("li");
            task.setAttribute("data-created", taskData.created);
            task.classList.add("todo-item");
            task.innerHTML = `
            <input type="checkbox" ${taskData.completed ? "checked" : ""
                } class="task-check"> 
            <span class="task-text">${taskData.text}</span> 
            <img src="assets/close_icon.svg" alt="" class="icon delete-task | delete-icon" />`;
            ul.appendChild(task);
            originalTaskOrder.get(listId).push(task);
            setupTaskDeleteButton(task.querySelector(".delete-task"));
            setupTaskCheckbox(task.querySelector(".task-check")); // Set up checkbox
        });
    }
    mainTodoContainer.prepend(newTodoContainer);
    setupTitle(newTodoContainer.querySelector(".editable-title"));
    setupTaskInput( newTodoContainer.querySelector(".add-new-task"),newTodoContainer);
    setupDeleteButton(newTodoContainer.querySelector(".delete-list"),newTodoContainer);
 
}


document.querySelectorAll(".add-new-task").forEach((input) => {
    setupTaskInput(input, input.closest(".todo-wrapper"));
});

document.querySelectorAll(".editable-title").forEach((title) => {
    setupTitle(title);
});

function setupTitle(title) {
    title.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            title.setAttribute("contenteditable", "false");
        }
    });

    title.addEventListener("blur", function () {
        title.setAttribute("contenteditable", "false");
    });

    title.addEventListener("dblclick", function () {
        title.setAttribute("contenteditable", "true");
        title.focus();
    });
}

function setupTaskInput(input, listContainer) {
    input.addEventListener("keypress", function (e) {
        if (e.key === "Enter" && input.value.trim() !== "") {
            const newTask = document.createElement("li");
            newTask.classList.add("todo-item");
            newTask.setAttribute("data-created", new Date().toISOString());
            newTask.innerHTML = `
            <input type="checkbox" class="task-check"> 
            <span class="task-text">${input.value}</span> 
            <img src="assets/close_icon.svg" alt="" class="icon delete-task | delete-icon" />`;
            input.parentNode.parentNode.querySelector("ul").appendChild(newTask);

            const listId = listContainer.getAttribute("list-id");
            if (!originalTaskOrder.has(listId)) {
                originalTaskOrder.set(listId, []);
            }
            originalTaskOrder.get(listId).push(newTask);
            input.value = "";
            setupTaskDeleteButton(newTask.querySelector(".delete-task"));
            setupTaskCheckbox(newTask.querySelector(".task-check")); // Set up checkbox
        }
    });
}

document.querySelectorAll(".delete-list").forEach((list) => {
    setupDeleteButton(list, list.closest(".todo-wrapper"));
});

function setupTaskCheckbox(checkbox) {
    checkbox.addEventListener("click", function () {
        filterTasks();
    });
}

function setupDeleteButton(button, listContainer) {
    button.addEventListener("click", function () {
        const listId = listContainer.getAttribute('list-id');
        originalTaskOrder.delete(listId);
        console.log(originalTaskOrder);
        listContainer.remove();
    });
}

function setupTaskDeleteButton(button) {
    button.addEventListener("click", function () {
        const task = button.parentNode;
        const listId = task.closest(".todo-wrapper").getAttribute('list-id');
        const taskList = originalTaskOrder.get(listId);
        taskList.splice(taskList.indexOf(task), 1);
        task.remove();
    });
}

function loadData() {
    const lists = JSON.parse(localStorage.getItem("toDoLists"));
    console.log("List", lists);
    if (lists) {
        lists.forEach((list) => {
            console.log("New list: " + list);
            addNewList(undefined, list.tasks, list.id, list.title, list.dueDate, false);
        });
    }
}

function saveData() {
    const lists = [];
    document.querySelectorAll(".todo-wrapper").forEach((list) => {
        console.log(list);

        const listData = {
            id : list.getAttribute('list-id'),
            title: list.querySelector("h2").innerText,
            dueDate: list.querySelector("p").textContent,
            tasks: [],
        };
        console.log(listData);
        const listId = listData.id;
        console.log(listId);
        const taskList = originalTaskOrder.get(listId) || [];
        console.log(taskList);
        taskList.forEach((task) => {
            listData.tasks.push({
                text: task.querySelector(".task-text").innerText.trim(),
                completed: task.querySelector("input").checked,
                created: task.getAttribute("data-created"),
            });
        });
        lists.push(listData);
    });
    lists.reverse();
    localStorage.setItem("toDoLists", JSON.stringify(lists));
}

window.addEventListener("beforeunload", saveData);
document.addEventListener("DOMContentLoaded", loadData);



function setUpTaskDate(dueDate, dateContainer) {
    $(dueDate).datepicker({
        dateFormat: "D M d yy",
        onSelect: function(dateText) {
            dateContainer.textContent = decideDay(dateText);
        }
    });
}

mainTodoContainer.addEventListener("click", function(event) {
    const target = event.target;
    if (target && target.closest(".cal-btn")) {
        const todoContainer = target.closest(".todo-wrapper");
        if (todoContainer) {
            const dueDate = todoContainer.querySelector(".due-date");
            const dateDisplay = todoContainer.querySelector('p');
            setUpTaskDate(dueDate, dateDisplay);
            $(dueDate).datepicker("show");
        }
    }
});
