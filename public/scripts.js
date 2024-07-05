let tasksByStage = {
    ready: [],
    progress: [],
    review: [],
    done: []
};
fetch('http://localhost:3000/api/v1/tasks')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Распределение заданий по массивам в зависимости от стадии
        data.tasks.forEach(task => {
            switch (task.stage) {
                case '665c6ed00e70091d14a276dd': // ID стадии "ready"
                    tasksByStage.ready.push(task);
                    break;
                case '665c6ed00e70091d14a276de': // ID стадии "progress"
                    tasksByStage.progress.push(task);
                    break;
                case '665c6ed00e70091d14a276df': // ID стадии "review"
                    tasksByStage.review.push(task);
                    break;
                case '665c6ed00e70091d14a276e0': // ID стадии "done"
                    tasksByStage.done.push(task);
                    break;
                default:
                    // Обработка случаев, если стадия не соответствует ожидаемым значениям
                    break;
            }
        });

        // Вызываем функцию для отображения задач на странице
        renderTasksOnPage();
    })
    .catch(error => {
        console.error('Fetch error:', error);
        // Обработка ошибок при запросе
    });

// Функция для отображения задач на странице
function renderTasksOnPage() {
    Object.keys(tasksByStage).forEach(stage => {
        const container = document.querySelector(`.task-list-${stage}`);
        container.innerHTML = ''; // Очищаем содержимое контейнера

        tasksByStage[stage].forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.classList.add('task');

            const creationDate = new Date(task.creationDate).toLocaleDateString();
            const expiredDate = new Date(task.expiredDate).toLocaleDateString();
            const progressPercentage = task.completeProgress || 0;

            taskElement.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.value}</p>
                <span>Дата создания: ${creationDate}</span><br>
                <span>Дата планируемого завершения: ${expiredDate}</span>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progressPercentage}%;"></div>
                </div>
                <button class="task-options-btn"><i class="fas fa-ellipsis-h"></i></button>
                <div class="task-options-menu" style="display: none;">
                    <button class="edit-task-btn">Редактировать</button>
                    <button class="delete-task-btn">Удалить</button>
                </div>
            `;

            taskElement.style.background = "#FFFFFF";
            taskElement.style.padding = "10px";
            taskElement.style.margin = "10px";
            taskElement.style.borderRadius = "8px";
            taskElement.style.position = "relative";

            const taskOptionsBtn = taskElement.querySelector('.task-options-btn');
            taskOptionsBtn.style.position = "absolute";
            taskOptionsBtn.style.top = "5px";
            taskOptionsBtn.style.right = "5px";
            taskOptionsBtn.style.background = "none";
            taskOptionsBtn.style.border = "none";
            taskOptionsBtn.style.cursor = "pointer";

            taskOptionsBtn.addEventListener('click', () => {
                const optionsMenu = taskElement.querySelector('.task-options-menu');
                optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
            });

            const editTaskBtn = taskElement.querySelector('.edit-task-btn');
            editTaskBtn.addEventListener('click', () => {
                const editTaskModal = document.getElementById('edit-task-modal');
                document.getElementById('task-title').value = task.title;
                document.getElementById('task-stage').value = task.stage;
                document.getElementById('planned-completion-date').value = new Date(task.expiredDate).toISOString().split('T')[0];
                document.getElementById('task-description').value = task.value;
                document.getElementById('task-progress').value = task.completeProgress;
                document.getElementById('progress-value').innerText = `${task.completeProgress}%`;
                editTaskModal.dataset.taskId = task._id;
                editTaskModal.classList.remove('hidden');
            });

            const deleteTaskBtn = taskElement.querySelector('.delete-task-btn');
            deleteTaskBtn.addEventListener('click', () => {
                const deleteModal = document.getElementById('delete-confirmation-modal');
                deleteModal.dataset.taskId = task._id;
                deleteModal.classList.remove('hidden');
            });

            container.appendChild(taskElement);
        });
    });
}

document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    document.getElementById('delete-confirmation-modal').classList.add('hidden');
});
//Удаление
document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    const deleteModal = document.getElementById('delete-confirmation-modal');
    const taskId = deleteModal.dataset.taskId;
    fetch(`http://localhost:3000/api/v1/tasks/${taskId}`, {
        method: 'DELETE'
    }).then(response => {
        if (response.ok) {
            deleteModal.classList.add('hidden');
            renderTasksOnPage(); // Обновляем список задач после удаления
        } else {
            console.error('Failed to delete task:', response.statusText);
        }
    }).catch(error => {
        console.error('Error deleting task:', error);
    });
});
//Редактирование
document.getElementById('edit-task-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const editTaskModal = document.getElementById('edit-task-modal');
    const taskId = editTaskModal.dataset.taskId;
    const updatedTask = {
        title: document.getElementById('task-title').value,
        stage: document.getElementById('task-stage').value,
        expiredDate: document.getElementById('planned-completion-date').value,
        value: document.getElementById('task-description').value,
        completeProgress: document.getElementById('task-progress').value
    };

    fetch(`http://localhost:3000/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask)
    }).then(response => {
        if (response.ok) {
            editTaskModal.classList.add('hidden');
            fetchTasksAndRender(); // Обновляем список задач после редактирования
        } else {
            console.error('Failed to update task:', response.statusText);
        }
    }).catch(error => {
        console.error('Error updating task:', error);
    });
});

document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('edit-task-modal').classList.add('hidden');
});

document.getElementById('task-progress').addEventListener('input', (event) => {
    document.getElementById('progress-value').innerText = `${event.target.value}%`;
});

//Добавление
document.getElementById('add-task-btn').addEventListener('click', function() {
    // Минимальный набор данных для создания задачи
    const taskData = {
        title: 'Task Manager',
        value: 'Текст таска',
        expiredDate: new Date().valueOf(),
        stage: '665c6ed00e70091d14a276dd'
    };

    fetch('http://localhost:3000/api/v1/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            renderTasksOnPage(); // Обновляем список задач после добавления
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});




