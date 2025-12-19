let TODOS = [];
let DOM;//lets store dom references
let ThreeChar = 3;
let sorting;

const handleTaskDelete = (taskIdToDelete) => {
    if (!window.confirm("Are you sure you want to delete this task?")) { return }
    TODOS = TODOS.filter((task) => task.taskId != taskIdToDelete)
    saveTodosInLocalStorage(TODOS)
    updateTaskCounts();
    const listITemToBeRemoved = document.getElementById(taskIdToDelete);
    listITemToBeRemoved.remove();

}
const handleSorting = (e) => {
    const sortType = e.target.value;

    if (sortType === sorting.newestFirst) {
        TODOS.sort((a, b) => b.createdAt - a.createdAt);
    }
    else if (sortType === sorting.oldestFirst) {
        TODOS.sort((a, b) => a.createdAt - b.createdAt);
    }
    else if (sortType === sorting.completedLast) {
        TODOS.sort((a, b) => {
            if (a.isTaskDone === b.isTaskDone) return 0;// 0 means no change in order
            return a.isTaskDone ? 1 : -1;
            // if a is done,then move it after b
            // if a is not done,then move it before b
            //all incomplete tasks appear first all completed tasks appear last
        });
    }

    saveTodosInLocalStorage(TODOS);
    DOM.tasksContainer.innerHTML = "";
    renderTodos(TODOS);
    updateTaskCounts()



}

const updateTaskCounts = () => {
    const totaltasks = TODOS.length;
    const completedTasks = TODOS.filter(todo => todo.isTaskDone).length;
    DOM.totalCountElement ? DOM.totalCountElement.textContent = totaltasks : null;
    DOM.completedCountElement ? DOM.completedCountElement.textContent = completedTasks : null;

}
const handleTaskEdit = (tasksIdToEdit, taskTextPTag) => {
    const originalText = taskTextPTag.textContent.trim();

    taskTextPTag.setAttribute("contenteditable", "true");
    taskTextPTag.classList.remove('task-done')


    taskTextPTag.focus()



    const handleKeydown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();


            taskTextPTag.setAttribute("contenteditable", "false");
            let updatedText = taskTextPTag.textContent.trim();
            if (!updatedText) {
                window.alert("enter task")
                taskTextPTag.textContent = originalText;
            }
            //arr changes
            TODOS = TODOS.map((taskElement) => taskElement.taskId === tasksIdToEdit ?
                { ...taskElement, taskText: updatedText } : taskElement)



            saveTodosInLocalStorage(TODOS);
            updateTaskCounts();


            taskTextPTag.removeEventListener("keydown", handleKeydown);// remove event listeners after usage to avoid memory leaks
            //Memory leak- when a program doesnt release memory it no longer needs ,causing memory usage to keep growing until the app slow down or crashes

            // taskTextPTag.setAttribute("style", "filter: blur(0.5px)")
        }
        if (e.key == "Escape") {
            e.preventDefault();
            taskTextPTag.textContent = originalText;
            taskTextPTag.setAttribute("contenteditable", "false");
            taskTextPTag.removeEventListener("keydown", handleKeydown)

        }
    }
    taskTextPTag.addEventListener("keydown", handleKeydown);


}

const handlerClearDoneTasks = () => {



    TODOS = TODOS.filter((taskElement) => taskElement.isTaskDone === false)
    saveTodosInLocalStorage(TODOS)

    DOM.tasksContainer.innerHTML = "";
    renderTodos(TODOS)
    updateTaskCounts();


}

const handleSubmit = (e) => {
    e.preventDefault();


    newTaskFunction();



    saveTodosInLocalStorage(TODOS)

    DOM.taskInput.value = "";
    DOM.taskInput.focus();

}

const newTaskFunction = () => {
    //trim removes whitespace between start and end
    const formatCurrDateTime = (ISOString) => {
        const date = new Date(ISOString);//string to date obj
        const currDateTime = new Date();


        //create today date with time set to zero
        //it helps while comparing dates 
        const today = new Date(
            currDateTime.getFullYear(),
            currDateTime.getMonth(),
            currDateTime.getDate(),

        );

        //create yesterday by copying todays date
        const yesterday = new Date(today);

        yesterday.setDate(today.getDate() - 1);

        const dateMessage = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()

        )

        const time = date.toLocaleTimeString([], {
            hour: "numeric",//hour (1-12)
            minute: "2-digit",
            hour12: true,
        })

        if (dateMessage.getTime() === today.getTime()) {
            return `Today,${time}`;
        }

        if (dateMessage.getTime() === yesterday.getTime()) {
            return `Yesterday,${time}`;
        }

        const formattedDate = date.toLocaleDateString()//for old date,show full date with time

        return `${formattedDate},${time}}`;




    }


    if (!DOM.taskInput.value.trim() || DOM.taskInput.value.trim().length <= ThreeChar) {
        DOM.taskInput.setAttribute("placeholder", "ENTER CORRECT TASK")
        DOM.taskInput.classList.add("input-error");


        return;
        //js comes out of function
    }
    else {
        DOM.taskInput.setAttribute("placeholder", "Enter Today's Task")
        DOM.taskInput.classList.remove("input-error");
    }



    const newTask = {
        taskId: Math.random(),
        taskText: DOM.taskInput.value.trim(),
        isTaskDone: false,
        timeStamp: formatCurrDateTime(new Date().toISOString()),//converting timeStampe into isoString and passing as argument
        createdAt: Date.now(),//we need new timestamp because existing timestamp is sorted
    }
    createAndPushPtag(newTask);
    TODOS.push(newTask)
    updateTaskCounts();


}

const handleTaskDone = (taskIdToUpdateIsTaskDone, taskTextPTag) => {
    for (let index = 0; index < TODOS.length; index++) {
        if (TODOS[index].taskId == taskIdToUpdateIsTaskDone) {
            TODOS[index].isTaskDone = !TODOS[index].isTaskDone;
            TODOS[index].isTaskDone ? taskTextPTag.classList.add("task-done") : taskTextPTag.classList.remove("task-done");

        }
        saveTodosInLocalStorage(TODOS)
    }
    updateTaskCounts();

}
const initDOM = () => {
    DOM = {};
    //----------DOM nodes---------
    DOM.taskform = document.querySelector(".taskform")
    DOM.taskInput = document.querySelector(".taskInput")
    DOM.ddTaskBtn = document.querySelector(".taskBtn")
    DOM.tasksContainer = document.querySelector(".tasksContainer")
    DOM.clearButton = document.querySelector(".clear-button")
    DOM.totalCountElement = document.getElementById("total-count");
    DOM.completedCountElement = document.getElementById("completed-count")
    DOM.sortingSelecteElement = document.getElementById("sorting");

}



const saveTodosInLocalStorage = (todos) => {
    const stringifiedTodos = JSON.stringify(todos);
    localStorage.setItem("todos", stringifiedTodos);
    return;
}


function loadTodos() {//gets the string array from local storage ,then converts into orignal data form , if array contains data then create copy of it then push to TODOS
    const stringifiedTodos = localStorage.getItem("todos");
    const todosArray = JSON.parse(stringifiedTodos)
    if (todosArray && todosArray.length) {
        TODOS = todosArray;//using spread operator, we are creating Shallow copy of todosArray

        return true
    }
    return false
}

const renderTodos = (todos) => {
    for (let index = 0; index < todos.length; index++) {
        createAndPushPtag(todos[index])
    }
}

const createAndPushPtag = (task) => {


    const newListItem = document.createElement("li");
    newListItem.setAttribute("class", "taskItem");
    newListItem.setAttribute("id", task.taskId)

    const checkBoxInput = document.createElement("input");
    checkBoxInput.setAttribute("type", "checkbox");
    checkBoxInput.classList.add("checkbox")
    checkBoxInput.addEventListener("change", () => handleTaskDone(task.taskId, taskTextPTag))


    checkBoxInput.checked = task.isTaskDone;




    const taskContentContainer = document.createElement("div");

    const taskTextPTag = document.createElement("p");
    taskTextPTag.setAttribute("class", "task")
    taskTextPTag.textContent = task.taskText;

    const timeStampPTag = document.createElement("p");
    timeStampPTag.textContent = task.timeStamp;

    taskContentContainer.appendChild(taskTextPTag);
    taskContentContainer.appendChild(timeStampPTag);

    const taskActionButtonContainer = document.createElement("div")
    taskActionButtonContainer.classList.add("taskActionButtonContainer")

    const editButton = document.createElement("button");
    editButton.classList.add("taskBtn");
    editButton.classList.add("editBtn")
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => handleTaskEdit(task.taskId, taskTextPTag))

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("taskBtn");
    deleteButton.classList.add("deleteBtn");

    deleteButton.addEventListener("click", () => handleTaskDelete(task.taskId))

    taskActionButtonContainer.appendChild(editButton);
    taskActionButtonContainer.appendChild(deleteButton)

    newListItem.appendChild(taskContentContainer);
    newListItem.appendChild(taskActionButtonContainer);
    newListItem.appendChild(checkBoxInput)

    DOM.tasksContainer.prepend(newListItem)

    task.isTaskDone ? taskTextPTag.classList.add("task-done") : false




}

document.addEventListener("DOMContentLoaded", function initApp() {//executes when browser renders the html, this event will trigger after js runs

    initDOM();

    sorting = {
        newestFirst: "NewestFirst",
        oldestFirst: "OldestFirst",
        completedLast: "CompletedLast"
    }

    DOM.taskform.addEventListener("submit", handleSubmit)
    DOM.clearButton.addEventListener("click", handlerClearDoneTasks)
    DOM.sortingSelecteElement.addEventListener("change", (e) => handleSorting(e))


    const areTodosLoaded = loadTodos()
    areTodosLoaded && renderTodos(TODOS)//shorthand code for if condition

    updateTaskCounts();

})



