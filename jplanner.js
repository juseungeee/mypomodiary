const selectedDate = localStorage.getItem('selectedDate');
const dateTitle = document.getElementById('date-title');
const todoList = document.getElementById('todo-list');
const newTodoInput = document.getElementById('new-todo-input');
const addTodoButton = document.getElementById('add-todo-button');

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
  window.location.href = 'jmainpage.html'; 
});

let tasks = [];

async function loadTasks() {
  if (!selectedDate) return;

  try {
    const docRef = db.collection('todos').doc(selectedDate);
    const docSnap = await docRef.get();
    tasks = docSnap.exists ? docSnap.data().tasks || [] : [];
    renderTasks();
  } catch (error) {
    console.error('할 일 불러오기 실패', error);
  }
}

function renderTasks() {
  todoList.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('data-id', task.id);
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
    deleteButton.textContent = '삭제';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', async () => {
      tasks = tasks.filter(t => t.id !== task.id);
      await saveTasks();
      renderTasks();
    });

    const editButton = document.createElement('button');
    editButton.textContent = '수정';
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
      saveButton.textContent = '저장';
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

    li.appendChild(checkbox);
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
    completed: false
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
      const textSpan = li.querySelector('span');
      const matchingTask = tasks.find(task => task.text === textSpan.textContent);
      if (matchingTask) {
        newTasks.push(matchingTask);
      }
    });

    tasks = newTasks;
    await saveTasks();
  }
});

loadTasks();
