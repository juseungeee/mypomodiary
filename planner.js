const selectedDate = localStorage.getItem('selectedDate');
const dateTitle = document.getElementById('date-title');
const todoList = document.getElementById('todo-list');
const newTodoInput = document.getElementById('new-todo-input');
const addTodoButton = document.getElementById('add-todo-button');
const completeButton = document.getElementById('complete-button');

if (selectedDate) {
  const dateObj = new Date(selectedDate);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const date = dateObj.getDate();
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const day = dayNames[dateObj.getDay()];
  dateTitle.innerText = `${year}년 ${month}월 ${date}일 ${day}`;
} else {
  dateTitle.innerText = "날짜가 선택되지 않았습니다.";
}

document.getElementById('go-to-main').addEventListener('click', () => {
  window.location.href = 'mainpage.html';
});

function checkAndLockPlanner() {
  const isCompleted = localStorage.getItem(`completed-flag-${selectedDate}`) === 'true';
  if (isCompleted) {
    newTodoInput.disabled = true;
    addTodoButton.disabled = true;
    completeButton.disabled = true;
    document.querySelectorAll('#todo-list li').forEach(li => {
      const checkbox = li.querySelector('input[type="checkbox"]');
      const editButton = li.querySelector('.edit-button');
      const deleteButton = li.querySelector('.delete-button');
      if (checkbox) checkbox.disabled = true;
      if (editButton) editButton.disabled = true;
      if (deleteButton) deleteButton.disabled = true;
    });
  }
}

let tasks = [];

async function loadTasks() {
  if (!selectedDate) return;
  try {
    const docRef = db.collection('todos').doc(selectedDate);
    const docSnap = await docRef.get();
    tasks = docSnap.exists ? docSnap.data().tasks || [] : [];
    renderTasks();
    checkAndLockPlanner();
  } catch (error) {
    console.error('할 일 불러오기 실패', error);
  }
}

function renderTasks() {
  todoList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.setAttribute('data-id', task.id);

    const label = document.createElement('label');
    label.className = 'emoji-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('data-id', task.id);

    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'emoji';

    label.appendChild(checkbox);
    label.appendChild(emojiSpan);

    checkbox.addEventListener('change', async () => {
      const changedId = checkbox.getAttribute('data-id');
      const targetTask = tasks.find(task => task.id === changedId);
      if (targetTask) {
        targetTask.completed = checkbox.checked;
        await saveTasks();
        renderTasks();
      }
    });

    const textSpan = document.createElement('span');
    textSpan.textContent = task.text;
    if (task.completed) {
      textSpan.style.textDecoration = 'line-through';
      textSpan.style.color = 'gray';
    }

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '❌';
    deleteButton.classList.add('delete-button');

    const editButton = document.createElement('button');
    editButton.textContent = '✏️';
    editButton.classList.add('edit-button');

    editButton.addEventListener('click', () => {
      textSpan.style.display = 'none';
      editButton.style.display = 'none';
      deleteButton.style.display = 'none';

      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = task.text;
      editInput.classList.add('edit-input');
      li.appendChild(editInput);

      const saveButton = document.createElement('button');
      saveButton.textContent = '🍅';
      saveButton.classList.add('save-button');
      li.appendChild(saveButton);

      saveButton.addEventListener('click', async () => {
        const newText = editInput.value.trim();
        if (newText !== '') {
          const targetTask = tasks.find(t => t.id === task.id);
          if (targetTask) {
            targetTask.text = newText;
            await saveTasks();
            renderTasks();
          }
        }
      });
    });

    deleteButton.addEventListener('click', async () => {
      tasks = tasks.filter(t => t.id !== task.id);
      await saveTasks();
      renderTasks();
    });

    li.appendChild(label);
    li.appendChild(textSpan);
    li.appendChild(editButton);
    li.appendChild(deleteButton);
    todoList.appendChild(li);
  });
}

async function saveTasks() {
  if (!selectedDate) return;
  try {
    await db.collection('todos').doc(selectedDate).set({ tasks });
    console.log('할 일 저장 성공');
  } catch (error) {
    console.error('할 일 저장 실패', error);
  }
}

async function addTask() {
  const text = newTodoInput.value.trim();
  if (text === '') return;

  const newTask = {
    id: Date.now().toString(),
    text: text,
    completed: false,
  };

  tasks.push(newTask);
  await saveTasks();
  renderTasks();
  newTodoInput.value = '';
}

addTodoButton.addEventListener('click', addTask);

const sortable = new Sortable(todoList, {
  animation: 150,
  onEnd: async function () {
    const newTasks = [];
    const listItems = todoList.querySelectorAll('li');
    listItems.forEach(li => {
      const taskId = li.getAttribute('data-id');
      const matchingTask = tasks.find(task => task.id === taskId);
      if (matchingTask) {
        newTasks.push(matchingTask);
      }
    });
    tasks = newTasks;
    await saveTasks();
  }
});

completeButton.addEventListener('click', async () => {
  const confirmComplete = confirm('모든 할 일을 완료하면 수정이 불가능합니다.\n정말 완료 처리할까요?');
  if (!confirmComplete) return;

  const allCompleted = tasks.length > 0 && tasks.every(task => task.completed);
  if (allCompleted) {
    try {
      await db.collection('completedRecords').doc(selectedDate).set({ completed: true });
      localStorage.setItem(`completed-flag-${selectedDate}`, 'true');
      alert("오늘 계획 완료! 🍅");
      window.location.href = 'mainpage.html';
    } catch (error) {
      console.error("완료 저장 실패", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  } else {
    alert("아직 완료되지 않은 할 일이 있습니다!");
  }
});

loadTasks();
