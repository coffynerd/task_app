
const TOKEN = "TWÓJ_GITHUB_TOKEN";
const owner = "TWÓJ_LOGIN";
const repo = "NAZWA_REPOZYTORIUM";
const path = "tasks.json";
const branch = "main";

async function fetchTasks() {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    const data = await response.json();
    return {tasks: JSON.parse(atob(data.content)), sha: data.sha};
}

async function updateTasks(tasks, sha) {
    const content = btoa(JSON.stringify(tasks, null, 2));
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: "PUT",
        headers: {
            "Authorization": `token ${TOKEN}`,
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "Update tasks status",
            content: content,
            sha: sha,
            branch: branch
        })
    });

    return response.ok;
}

async function renderTasks() {
    const {tasks, sha} = await fetchTasks();
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskDiv = document.createElement('div');
        taskDiv.classList.add('task');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.done;
        checkbox.addEventListener('change', async () => {
            tasks[index].done = checkbox.checked;
            const success = await updateTasks(tasks, sha);
            if (success) {
                taskDiv.classList.toggle('done', checkbox.checked);
                alert('Status zadania został zaktualizowany!');
            } else {
                alert('Błąd przy aktualizacji statusu zadania!');
                checkbox.checked = !checkbox.checked;
            }
        });
        taskDiv.classList.toggle('done', checkbox.checked);
        const content = document.createElement('span');
        content.textContent = ' ' + task.content;
        const assignees = document.createElement('div');
        assignees.classList.add('assignees');
        assignees.textContent = 'Przypisane osoby: ' + task.assignees.join(', ');
        taskDiv.appendChild(checkbox);
        taskDiv.appendChild(content);
        taskDiv.appendChild(assignees);
        taskList.appendChild(taskDiv);
    });
}
renderTasks();
