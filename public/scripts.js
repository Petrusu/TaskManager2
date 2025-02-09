let tasksByStage = {
    ready: [],
    progress: [],
    review: [],
    done: []
};
let stages = [];

async function fetchStages() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/stages');
        const data = await response.json();
        stages = data.stages;
    } catch (error) {
        console.error('Error fetching stages:', error);
        stages = [];
    }
}
async function fetchTasksAndRender() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/tasks');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Очистка объектов для каждой стадии
        tasksByStage.ready = [];
        tasksByStage.progress = [];
        tasksByStage.review = [];
        tasksByStage.done = [];

        // Распределение заданий по массивам в зависимости от стадии
        data.tasks.forEach(task => {
            const stage = stages.find(stage => stage._id === task.stage);
            if (stage) {
                switch (stage.name) {
                    case 'ready':
                        tasksByStage.ready.push(task);
                        break;
                    case 'progress':
                        tasksByStage.progress.push(task);
                        break;
                    case 'review':
                        tasksByStage.review.push(task);
                        break;
                    case 'done':
                        tasksByStage.done.push(task);
                        break;
                    default:
                        // Обработка случаев, если стадия не соответствует ожидаемым значениям
                        break;
                }
            }
        });

        // Вызываем функцию для отображения задач на странице
        renderTasksOnPage();
        updateTaskProgress();
    } catch (error) {
        console.error('Fetch error:', error);
        // Обработка ошибок при запросе
    }
}
fetchStages().then(fetchTasksAndRender);
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
                const formTitle = editTaskModal.querySelector('h2');
                const stageLabel = editTaskModal.querySelector('label[for="task-stage"]');
                const stageSelect = editTaskModal.querySelector('#task-stage');
                formTitle.textContent = 'Edit Task';

                stageLabel.style.display = '';
                stageSelect.style.display = '';

                document.getElementById('task-title').value = task.title;
                document.getElementById('task-stage').value = stages.find(stage => stage._id === task.stage).name;
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
function updateTaskProgress() {
    Object.keys(tasksByStage).forEach(stage => {
        const tasks = document.querySelectorAll(`.task-list-${stage} .task`).length;
        const totalTasks = document.querySelectorAll('.task').length;
        const progressValue = totalTasks ? Math.round((tasks / totalTasks) * 100) : 0;
        document.getElementById(`progress-${stage}`).value = progressValue;
        document.getElementById(`progress-${stage}-value`).textContent = `${progressValue}%`;
    });
}

document.addEventListener('DOMContentLoaded', updateTaskProgress);

document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    document.getElementById('delete-confirmation-modal').classList.add('hidden');
});

// Удаление
document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    const deleteModal = document.getElementById('delete-confirmation-modal');
    const taskId = deleteModal.dataset.taskId;
    fetch(`http://localhost:3000/api/v1/tasks/${taskId}`, {
        method: 'DELETE'
    }).then(response => {
        if (response.ok) {
            deleteModal.classList.add('hidden');
            fetchTasksAndRender(); // Обновляем список задач после удаления
        } else {
            console.error('Failed to delete task:', response.statusText);
        }
    }).catch(error => {
        console.error('Error deleting task:', error);
    });
    updateTaskProgress();
});

// Редактирование
document.getElementById('edit-task-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const editTaskModal = document.getElementById('edit-task-modal');
    const formTitle = editTaskModal.querySelector('h2');
    const taskId = editTaskModal.dataset.taskId;
    const dataValue = document.getElementById("planned-completion-date").value;
    const expiredDate = new Date(dataValue);
    const stageValue = document.getElementById('task-stage').value;
    const stageObj = stages.find(stage => stage.name === stageValue);

    const newTask = {
        title: document.getElementById('task-title').value,
        stage: stageObj ? stageObj._id : stageValue,
        expiredDate: expiredDate.valueOf(),
        value: document.getElementById('task-description').value,
        completeProgress: document.getElementById('task-progress').value
    };
    if (taskId) {
        // Редактирование задачи
        try {
            const response = await fetch(`http://localhost:3000/api/v1/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });
            if (response.ok) {
                editTaskModal.classList.add('hidden');
                fetchTasksAndRender();
            } else {
                console.error('Failed to update task:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    } else {
        // Добавление новой задачи
        try {
            const response = await fetch('http://localhost:3000/api/v1/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });
            if (response.ok) {
                editTaskModal.classList.add('hidden');
                fetchTasksAndRender();
            } else {
                console.error('Failed to add task:', response.statusText);
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }
    updateTaskProgress();
});


document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('edit-task-modal').classList.add('hidden');
});

document.getElementById('task-progress').addEventListener('input', (event) => {
    document.getElementById('progress-value').innerText = `${event.target.value}%`;
});

// Добавление
document.getElementById('add-task-btn').addEventListener('click', () => {
    const editTaskModal = document.getElementById('edit-task-modal');
    const formTitle = editTaskModal.querySelector('h2');
    const stageLabel = editTaskModal.querySelector('label[for="task-stage"]');
    const stageSelect = editTaskModal.querySelector('#task-stage');

    editTaskModal.dataset.taskId = '';
    editTaskModal.classList.remove('hidden');
    document.getElementById('edit-task-form').reset();
    document.getElementById('progress-value').innerText = '0%';


    stageLabel.style.display = 'none';
    stageSelect.style.display = 'none';


    formTitle.textContent = 'Add Task';

    updateTaskProgress();
});



document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('edit-task-modal').classList.add('hidden');
});

document.getElementById('task-progress').addEventListener('input', (event) => {
    document.getElementById('progress-value').innerText = `${event.target.value}%`;
});
document.addEventListener('DOMContentLoaded', () => {
    const sortButtons = document.querySelectorAll('.ellipsis-btn-sort, .ellipsis-btn-sort-progress, .ellipsis-btn-sort-review, .ellipsis-btn-sort-done');

    sortButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const dropdownContent = event.currentTarget.nextElementSibling;
            dropdownContent.classList.toggle('show');
        });
    });

    const sortByLinks = document.querySelectorAll('.sort-by');

    sortByLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sortBy = event.currentTarget.dataset.sort;
            const stage = event.currentTarget.dataset.stage;
            sortTasksBy(sortBy, stage);
        });
    });
});

function sortTasksBy(criteria, stage) {
    switch (criteria) {
        case 'creationDate':
            tasksByStage[stage].sort((a, b) => new Date(a.creationDate) - new Date(b.creationDate));
            break;
        case 'expiredDate':
            tasksByStage[stage].sort((a, b) => new Date(a.expiredDate) - new Date(b.expiredDate));
            break;
        case 'title':
            tasksByStage[stage].sort((a, b) => a.title.localeCompare(b.title));
            break;
        default:
            break;
    }

    renderTasksOnPage();
}