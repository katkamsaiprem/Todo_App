/* 
--store todo data inside obj without empty string✔️

-- newListItem -class name taskItem✔️
-- checkBoxInput -type checkbox , checked should be value of obj prop✔️

-- taskContentContainer ✔️
-- taskTextPTag -class name task, textContent = obj prop✔️
-- timeStampPTag -textContent=obj prop✔️

--make two elements as child of taskContentContainer✔️

--taskActionButtonContainer✔️
--editButton -textContent = edit✔️
--deleteButton -AeL click and callback✔️

--same for deleteButton✔️

-append these two as child of taskActionButtonContainer✔️


make taskActionButtonContainer ,taskContentContainer and checkBoxinput as child of newLIstItem✔️

newListItem as child of tasksContainer✔️




--------------Edit-feature------------------✔️✔️✔️✔️✔️
--update local arr
--map throught local arr and compare value and datatye (===) of each element's id prop with given id ? create  shallow copy of element using spread operator and change prop and return : original element
----------------------------------------------------
// Line 143 - createAndPushPtag is the OUTER function
const createAndPushPtag = (task) => {
    // task is a variable in outer function
    
    const editButton = document.createElement("button");
    
    // This arrow function is the INNER function (closure)
    editButton.addEventListener("click", () => handleTaskEdit(task.taskId, taskTextPTag))
    //                                    ↑
    //                          Inner function uses task from outer function
}
------------------------------------------------------------
-- now update localStorage


Task 1. Edit Task Functionality ✔️
Task 2. Visual Done State ✔️
Task 3. Delete Confirmation✔️
Task 4. Task Sorting
Task 5. Clear Completed Tasks ✔️
Task 6. Task Count Indicator 
Task 7. Input Validation Improvements 
Task 8. Keyboard Accessibility ✔️
Task 9. Timestamp Formatting✔️
Task 10. App Initialization Cleanup ✔️

*/