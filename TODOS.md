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
Task 6. Task Count Indicator ✔️
Task 7. Input Validation Improvements ✔️
Task 8. Keyboard Accessibility ✔️
Task 9. Timestamp Formatting✔️
Task 10. App Initialization Cleanup ✔️

*/



--------------------------------------Array.sort()------------------------
# How Array.sort() Works Internally

## Basic Concept

When you call `array.sort()`, JavaScript uses a **sorting algorithm** to rearrange elements. The exact algorithm varies by browser, but modern engines typically use **Timsort** (a hybrid of merge sort and insertion sort).

## The Comparator Function

```javascript
TODOS.sort((a, b) => b.taskId - a.taskId);
```

### How It Works:

1. **JavaScript picks two elements** from the array (`a` and `b`)
2. **Passes them to your comparator function**
3. **Uses the return value** to decide their order:

```javascript
Return Value     |  Meaning
-----------------|---------------------------------
Negative (< 0)   |  Put 'a' BEFORE 'b'
Zero (= 0)       |  Keep original order
Positive (> 0)   |  Put 'a' AFTER 'b'
```

## Example with Your Code

```javascript
// Newest First: b.taskId - a.taskId
TODOS = [
    {taskId: 0.123, taskText: "Old task"},
    {taskId: 0.789, taskText: "New task"}
]

// Comparison:
a = {taskId: 0.123}
b = {taskId: 0.789}

b.taskId - a.taskId = 0.789 - 0.123 = 0.666 (POSITIVE)
// Result: Put 'a' AFTER 'b' → New task comes first
```

## Step-by-Step Process

Let's say you have 4 tasks:

```javascript
TODOS = [
    {taskId: 0.2, text: "Task 2"},
    {taskId: 0.8, text: "Task 4"},
    {taskId: 0.1, text: "Task 1"},
    {taskId: 0.5, text: "Task 3"}
]
```

### When you call `TODOS.sort((a, b) => a.taskId - b.taskId)`:

**Round 1:** Compare Task 2 (0.2) vs Task 4 (0.8)
- `0.2 - 0.8 = -0.6` (negative)
- Keep Task 2 before Task 4 ✓

**Round 2:** Compare Task 4 (0.8) vs Task 1 (0.1)
- `0.8 - 0.1 = 0.7` (positive)
- Swap! Task 1 moves before Task 4

**Round 3:** Compare Task 1 (0.1) vs Task 2 (0.2)
- `0.1 - 0.2 = -0.1` (negative)
- Swap! Task 1 moves to the front

...continues until fully sorted...

**Final Result:**
```javascript
[
    {taskId: 0.1, text: "Task 1"},  // Oldest
    {taskId: 0.2, text: "Task 2"},
    {taskId: 0.5, text: "Task 3"},
    {taskId: 0.8, text: "Task 4"}   // Newest
]
```

## Completed Last Sort

```javascript
TODOS.sort((a, b) => {
    if (a.isTaskDone === b.isTaskDone) return 0;  // Same status, don't change
    return a.isTaskDone ? 1 : -1;  // If 'a' is done, move it after 'b'
});
```

**Logic:**
- Both incomplete → return `0` (keep order)
- Both complete → return `0` (keep order)
- `a` is complete, `b` is incomplete → return `1` (move `a` after `b`)
- `a` is incomplete, `b` is complete → return `-1` (keep `a` before `b`)

## Important Notes

1. **Mutates original array**: `sort()` changes `TODOS` directly, doesn't create a new array
2. **In-place sorting**: Modifies the array where it is
3. **Without comparator**: Converts elements to strings and sorts alphabetically (usually not what you want)

```javascript
[1, 10, 2].sort()  // Result: [1, 10, 2] ❌ (string comparison)
[1, 10, 2].sort((a,b) => a-b)  // Result: [1, 2, 10] ✓ (numeric)
```
-------------------------------------------------------------------------------------------------
