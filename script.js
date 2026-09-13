// ==========================================
// 1. SELEÇÃO DOS ELEMENTOS DO HTML (DOM)
// ==========================================
// Aqui pegamos os elementos da página pelo ID ou classe para podermos interagir com eles via JavaScript.
const taskForm = document.getElementById('task-form');           // O formulário de envio
const taskInput = document.getElementById('task-input');         // O campo de texto onde o usuário digita
const taskList = document.getElementById('task-list');           // A lista (<ul>) onde as tarefas serão exibidas
const taskCounter = document.getElementById('task-counter');     // O texto que mostra a quantidade de pendências
const clearAllBtn = document.getElementById('clear-all-btn');     // O botão para limpar tarefas concluídas
const filterButtons = document.querySelectorAll('.filter-btn');  // Todos os botões de filtro (Todas, Pendentes, Concluídas)

// ==========================================
// 2. ESTADO DA APLICAÇÃO (DADOS NA MEMÓRIA)
// ==========================================
// Busca as tarefas salvas no navegador (localStorage).
// Se não houver nada salvo ainda, inicializa 'tasks' como uma lista vazia ([]).
// O JSON.parse converte o texto salvo no navegador de volta para um array de objetos.
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Guarda o filtro selecionado no momento (padrão: 'all' = todas)
let currentFilter = 'all';

// ==========================================
// 3. FUNÇÃO PARA SALVAR NO NAVEGADOR
// ==========================================
// O localStorage só aceita texto puro.
// JSON.stringify transforma nossa lista de objetos em texto antes de salvar.
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ==========================================
// 4. ATUALIZAR O CONTADOR DE TAREFAS
// ==========================================
function updateCounter() {
  // O método .filter cria uma lista apenas com as tarefas que NÃO estão completas (!t.completed)
  const pendingCount = tasks.filter(t => !t.completed).length;
  // Atualiza o texto na tela com a contagem atualizada
  taskCounter.textContent = `${pendingCount} tarefa(s) pendente(s)`;
}

// ==========================================
// 5. RENDERIZAR (DESENHAR) AS TAREFAS NA TELA
// ==========================================
function renderTasks() {
  // Limpa o conteúdo atual da lista na tela para não duplicar tarefas ao redesenhar
  taskList.innerHTML = '';

  // Filtra quais tarefas devem aparecer com base no botão de filtro ativo
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'pending') return !task.completed; // Só tarefas não concluídas
    if (currentFilter === 'completed') return task.completed; // Só tarefas concluídas
    return true; // Se for 'all', exibe todas
  });

  // Percorre cada tarefa do array filtrado e cria os elementos visuais no HTML
  filteredTasks.forEach(task => {
    // Cria a linha da lista (<li>)
    const li = document.createElement('li');
    // Adiciona a classe base e, caso a tarefa esteja concluída, adiciona a classe 'completed' para riscar o texto
    li.className = `task-item ${task.completed ? 'completed' : ''}`;

    // Cria a caixinha de marcar (checkbox)
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    // Quando o usuário clica no checkbox, dispara a função toggleTask para inverter o status da tarefa
    checkbox.addEventListener('change', () => toggleTask(task.id));

    // Cria o texto da tarefa (<span>)
    const span = document.createElement('span');
    span.textContent = task.text;
    // Permite clicar no próprio texto da tarefa para marcá-la como concluída
    span.addEventListener('click', () => toggleTask(task.id));

    // Cria o botão de excluir (✕)
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.className = 'delete-btn';
    // Quando clicado, executa a função deleteTask passando o ID único da tarefa
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    // Monta a estrutura colocando o checkbox, o texto e o botão dentro do item da lista (<li>)
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    // Adiciona o item da lista finalizado dentro da lista principal (<ul>) na tela
    taskList.appendChild(li);
  });

  // Atualiza o número de pendências no rodapé
  updateCounter();
}

// ==========================================
// 6. FUNÇÃO PARA ADICIONAR NOVA TAREFA
// ==========================================
function addTask(text) {
  // Cria um objeto representando a nova tarefa
  const newTask = {
    id: Date.now(),      // Gera um número único com base no milissegundo atual (ID único)
    text: text,          // O texto que a pessoa digitou
    completed: false     // Toda nova tarefa começa como não concluída (falsa)
  };

  // Adiciona o novo objeto no final do array de tarefas
  tasks.push(newTask);
  saveTasks();    // Salva a lista atualizada no navegador
  renderTasks();  // Atualiza a tela com a nova tarefa
}

// ==========================================
// 7. ALTERNAR STATUS (CONCLUÍDA / PENDENTE)
// ==========================================
function toggleTask(id) {
  // O método .map percorre todo o array: se encontrar o ID clicado, ele inverte o completed (true vira false, e vice-versa)
  tasks = tasks.map(task => 
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();    // Salva a alteração
  renderTasks();  // Atualiza a tela
}

// ==========================================
// 8. DELETAR UMA TAREFA ESPECÍFICA
// ==========================================
function deleteTask(id) {
  // O método .filter mantém na lista todas as tarefas, EXCETO a que possui o ID que queremos apagar
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();    // Salva a remoção
  renderTasks();  // Atualiza a tela
}

// ==========================================
// 9. EVENTOS DE INTERAÇÃO DO USUÁRIO (LISTENERS)
// ==========================================

// Evento disparado quando o formulário é enviado (ao clicar em "Adicionar" ou apertar Enter)
taskForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Impede o comportamento padrão do navegador de recarregar a página inteira
  const text = taskInput.value.trim(); // Pega o texto digitado e remove espaços em branco sobrando nas pontas
  
  if (text) {           // Se o campo não estiver vazio:
    addTask(text);      // Cria a tarefa
    taskInput.value = ''; // Limpa o campo de texto para a próxima digitação
  }
});

// Evento para alternar entre os filtros (Todas / Pendentes / Concluídas)
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove a classe visual de botão ativo de todos os botões
    filterButtons.forEach(b => b.classList.remove('active'));
    // Adiciona a classe ativa apenas no botão que acabou de ser clicado
    btn.classList.add('active');
    
    // Atualiza a variável de controle com o valor do data-filter do HTML ('all', 'pending' ou 'completed')
    currentFilter = btn.dataset.filter;
    renderTasks(); // Redesenha a tela exibindo apenas o grupo selecionado
  });
});

// Evento do botão "Limpar concluídas"
clearAllBtn.addEventListener('click', () => {
  // Mantém no array apenas as tarefas que NÃO estão completadas
  tasks = tasks.filter(task => !task.completed);
  saveTasks();    // Salva a nova lista no navegador
  renderTasks();  // Atualiza a tela
});

// ==========================================
// 10. INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================
// Chama a função uma primeira vez logo ao carregar a página para exibir o que já estava salvo no navegador
renderTasks();