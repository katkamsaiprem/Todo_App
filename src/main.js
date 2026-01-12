import { Client, TablesDB, Permission, Role, ID } from "appwrite";





let TODOS = [];
let DOM;//lets store dom references
let ThreeChar = 3;
let sorting;

const handleTaskDelete = async (taskIdToDelete) => {
  if (!window.confirm("Are you sure you want to delete this task?")) { return }

  const taskToDelete = TODOS.find(task => task.$id === taskIdToDelete)

  const listITemToBeRemoved = document.getElementById(taskIdToDelete);

  if (!taskToDelete || !taskIdToDelete) {
    return console.error("Task not forund");
  }

  try {
    await DeleteTaskFromDB(taskIdToDelete)
    TODOS = TODOS.filter((task) => task.$id !== taskIdToDelete)

    updateTaskCounts();

    listITemToBeRemoved.remove();
  }
  catch (error) {
    console.error("Error deleting task: ", error)
  }





}

const DeleteTaskFromDB = async ($id) => {
  const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('695cd776000c67f22dd2'); // Your project ID

  const tablesDB = new TablesDB(client);

  const result = await tablesDB.deleteRow({
    databaseId: '695e3add0000ece1e383',
    tableId: 'taskstable',
    rowId: $id,

  });

  console.log("Task deleted");

  console.log(result);
  return result;


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



  const handleKeydown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();


      taskTextPTag.setAttribute("contenteditable", "false");
      let updatedText = taskTextPTag.textContent.trim();

      if (!updatedText) {
        window.alert("enter task")
        taskTextPTag.textContent = originalText;
        taskTextPTag.removeEventListener("keydown", handleKeydown);
        return;
      }

      //update local array
      TODOS = TODOS.map((taskElement) => taskElement.$id === tasksIdToEdit ?
        { ...taskElement, taskText: updatedText } : taskElement)

      try {//update in appWriterDB
        await updateTaskInDB(tasksIdToEdit, {
          taskText: updatedText
        })
      }
      catch (error) {
        console.error("Failed to update task text:", error)

        //update original Text
        taskTextPTag.textContent = originalText;
        TODOS = TODOS.map((taskElement) => taskElement.$id === tasksIdToEdit ?
          { ...taskElement, taskText: originalText } : taskElement)

      }


      updateTaskCounts();


      taskTextPTag.removeEventListener("keydown", handleKeydown);// remove event listeners after usage to avoid memory leaks
      //Memory leak- when a program doesnt release memory it no longer needs ,causing memory usage to keep growing until the app slow down or crashes

      // taskTextPTag.setAttribute("style", "filter: blur(0.5px)")
    }
    if (e.key === "Escape") {
      e.preventDefault();
      taskTextPTag.textContent = originalText;
      taskTextPTag.setAttribute("contenteditable", "false");
      taskTextPTag.removeEventListener("keydown", handleKeydown)

    }
  }
  taskTextPTag.addEventListener("keydown", handleKeydown);


}

const handlerClearDoneTasks = async () => {

  const completedTasks = TODOS.filter(task => task.isTaskDone === true);

  try {
    //delete all completedTasks from AppWriterDB
    //converts array of task obj to arr of promises
    //resolves only when every promise successfull
    //promise.all waits for all delete operations to complete
    await Promise.all(
      completedTasks.map(task => DeleteTaskFromDB(task.$id))
    )


    //local update
    TODOS = TODOS.filter((taskElement) => taskElement.isTaskDone === false)



    DOM.tasksContainer.innerHTML = "";
    renderTodos(TODOS)
    updateTaskCounts();


  }
  catch (error) {
    console.error("Failed to clear completed tasks ", error);

  }





}

const handleSubmit = (e) => {
  e.preventDefault();


  newTaskFunction();





  DOM.taskInput.value = "";
  DOM.taskInput.focus();

}

const newTaskFunction = async () => {
  //trim removes whitespace between start and end



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

    taskText: DOM.taskInput.value.trim(),
    isTaskDone: false,
    timeStamp: formatCurrDateTime(new Date().toISOString()),//converting timeStampe into isoString and passing as argument
    createdAt: Date.now(),//we need new timestamp because existing timestamp is sorted
  }


  await createTodoInAppWriteDB(newTask);


  updateTaskCounts();


}

const handleTaskDone = async (taskIdToUpdateIsTaskDone, taskTextPTag) => {
  for (let index = 0; index < TODOS.length; index++) {
    if (TODOS[index].$id === taskIdToUpdateIsTaskDone) {
      TODOS[index].isTaskDone = !TODOS[index].isTaskDone;
      TODOS[index].isTaskDone ? taskTextPTag.classList.add("task-done") : taskTextPTag.classList.remove("task-done");

      //update in AppWriterDB
      try {
        await updateTaskInDB(taskIdToUpdateIsTaskDone, {
          isTaskDone: TODOS[index].isTaskDone,
        })

      }
      catch (error) {
        console.error("Failed to update task status:", error);

      }
      break;
    }

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



const createTodoInAppWriteDB = async (newTask) => {
  // const stringifiedTodos = JSON.stringify(todos);
  // localStorage.setItem("todos", stringifiedTodos);
  const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('695cd776000c67f22dd2'); // Your project ID

  const tablesDB = new TablesDB(client);

  const result = await tablesDB.createRow({
    databaseId: '695e3add0000ece1e383',
    tableId: 'taskstable',
    rowId: ID.unique(),
    data: {
      "taskText": newTask.taskText,
    },

  });
  console.log(result);
  console.log("row created and Saved to AppWriteDB");


  const taskWithId = {
    //use $id form AppWriterDB
    $id: result.$id,
    taskText: result.taskText,
    isTaskDone: result.isTaskDone || false,
    timeStamp: formatCurrDateTime(result.$createdAt),
    createdAt: new Date(result.$createdAt).getTime(),
  }

  //now after we got id from DB ,now push to TODOS arr
  TODOS.push(taskWithId)

  //Render the object
  createAndPushPtag(result, newTask);



}
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


const RetriveTodosFromDB = async () => {//gets the string array from local storage ,then converts into orignal data form , if array contains data then create copy of it then push to TODOS
  // const stringifiedTodos = localStorage.getItem("todos");
  // const todosArray = JSON.parse(stringifiedTodos)
  // if (todosArray && todosArray.length) {
  //   TODOS = todosArray;//using spread operator, we are creating Shallow copy of todosArray

  //   return true
  // }
  // return false


  try {



    const client = new Client()
      .setEndpoint('https://sgp.cloud.appwrite.io/v1') // Your API Endpoint
      .setProject('695cd776000c67f22dd2'); // Your project ID

    const tablesDB = new TablesDB(client);

    const result = await tablesDB.listRows({
      databaseId: '695e3add0000ece1e383',
      tableId: 'taskstable',

    });

    if (result.rows && result.rows.length) {
      TODOS = result.rows.map(row => ({
        $id: row.$id,//id for appwirte operations
        taskText: row.taskText,
        isTaskDone: row.isTaskDone || false,
        timeStamp: formatCurrDateTime(row.$createdAt),
        createdAt: new Date(row.$createdAt).getTime(),
      }));





      console.log(result);
      console.log("rows from table loaded");
      console.log(TODOS);
      return true;




    }
  }
  catch (error) {
    console.error("Error while retriving todos:", error);
    return false;
  }

}

const updateTaskInDB = async (taskId, updateData) => {

  const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('695cd776000c67f22dd2'); // Your project ID

  const tablesDB = new TablesDB(client);

  const result = await tablesDB.updateRow({
    databaseId: '695e3add0000ece1e383',
    tableId: 'taskstable',
    rowId: taskId,
    data: updateData,

  });

  console.log(result);

}
const renderTodos = (todos) => {
  for (let index = 0; index < todos.length; index++) {
    createAndPushPtag(todos[index])
  }
}

//Render the obj
const createAndPushPtag = (task, newTaskObj) => {


  const newListItem = document.createElement("li");
  newListItem.setAttribute("class", "taskItem");
  newListItem.setAttribute("id", task.$id)

  const checkBoxInput = document.createElement("input");
  checkBoxInput.setAttribute("type", "checkbox");
  checkBoxInput.classList.add("checkbox")
  checkBoxInput.addEventListener("change", () => handleTaskDone(task.$id, taskTextPTag))


  checkBoxInput.checked = task.isTaskDone;


  const taskContentContainer = document.createElement("div");

  const taskTextPTag = document.createElement("p");
  taskTextPTag.setAttribute("class", "task")
  taskTextPTag.textContent = task.taskText;

  const timeStampPTag = document.createElement("p");
  timeStampPTag.textContent = newTaskObj ? newTaskObj.timeStamp : task.timeStamp;

  taskContentContainer.appendChild(taskTextPTag);
  taskContentContainer.appendChild(timeStampPTag);

  const taskActionButtonContainer = document.createElement("div")
  taskActionButtonContainer.classList.add("taskActionButtonContainer")

  const editButton = document.createElement("button");
  editButton.classList.add("taskBtn");
  editButton.classList.add("editBtn")
  editButton.textContent = "Edit";

  editButton.addEventListener("click", () => handleTaskEdit(task.$id, taskTextPTag))

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.classList.add("taskBtn");
  deleteButton.classList.add("deleteBtn");

  deleteButton.addEventListener("click", () => handleTaskDelete(task.$id))

  taskActionButtonContainer.appendChild(editButton);
  taskActionButtonContainer.appendChild(deleteButton)

  newListItem.appendChild(taskContentContainer);
  newListItem.appendChild(taskActionButtonContainer);
  newListItem.appendChild(checkBoxInput)

  DOM.tasksContainer.prepend(newListItem)

  task.isTaskDone ? taskTextPTag.classList.add("task-done") : false




}

document.addEventListener("DOMContentLoaded", async function initApp() {//executes when browser renders the html, this event will trigger after js runs


  const areTodosLoaded = await RetriveTodosFromDB()

  initDOM();

  sorting = {
    newestFirst: "NewestFirst",
    oldestFirst: "OldestFirst",
    completedLast: "CompletedLast"
  }

  DOM.taskform.addEventListener("submit", handleSubmit)
  DOM.clearButton.addEventListener("click", handlerClearDoneTasks)
  DOM.sortingSelecteElement.addEventListener("change", (e) => handleSorting(e))



  areTodosLoaded && renderTodos(TODOS)//shorthand code for if condition

  updateTaskCounts();

})



