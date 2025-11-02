// --- APPLICATION STATE (FRONT-END ONLY) ---
const MOCK_CURRENT_DATE = new Date('2025-10-16T15:40:00');

let currentMeetingData = {};
let allTasks = [];
let allMembers = [];
let profileData = {};
let calendarDate = new Date(MOCK_CURRENT_DATE);

// State for Add Task Modal
let assignedMemberIds = new Set();
let isDropdownOpen = false;

// State for Edit Task Modal
let taskIdToEdit = null;
let editAssignedMemberIds = new Set();
let isEditDropdownOpen = false;

let taskIdToDelete = null;
const contentMap = { 'dashboard': 'Dashboard', 'assign': 'Task', 'members': 'Members', 'profile': 'Profile Information' };

// --- HELPER FUNCTIONS ---
const getTaskStatus = (dueDate) => {
    if (!dueDate) return 'Pending';
    const due = new Date(dueDate + 'T23:59:59');
    const today = new Date(MOCK_CURRENT_DATE);
    today.setHours(0, 0, 0, 0);
    return due < today ? 'Overdue' : 'Pending';
};

const calculateProgress = (task) => {
    if (task.status === 'Done') return 100;
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const checkedCount = task.subtaskStatus.filter(Boolean).length;
    const total = task.subtasks.length;
    if (total === 0) return 0;
    return Math.round((checkedCount / total) * 100);
};

// --- INITIAL DATA ---
function loadInitialData() {
    profileData = { name: "Borloloy, Janjan", role: "Member", studentId: "240000000740", email: "borloloy@gmail.com", contact: "09685421388" };
    currentMeetingData = { date: "2025-10-17", time: "9:00 PM", link: "https://meet.google.com" };
    allMembers = [
        {id:"m1", name:"Junsoy LoveJun",role:"Designer", email: "junsoy.l@example.com", studentId: "24001", contact: "0911"}, {id:"m2", name:"Juneks",role:"P.I.O", email: "juneks@example.com", studentId: "24002", contact: "0912"},
        {id:"m3", name:"Douglas",role:"Auditor", email: "douglas@example.com", studentId: "24003", contact: "0913"}, {id:"m4", name:"Barkley",role:"Tresurer", email: "barkley@example.com", studentId: "24004", contact: "0914"},
        {id:"m5", name:"Wiggy",role:"Secretary", email: "wiggy@example.com", studentId: "24005", contact: "0915"}, {id:"m6", name:"Boss Ok",role:"1st Year rep", email: "boss.ok@example.com", studentId: "24006", contact: "0916"},
        {id:"m7", name:"CyberJorj",role:"President", email: "cyberjorj@example.com", studentId: "24007", contact: "0917"}, {id:"m8", name:"Janjan B",role:"Vice President", email: "janjan@example.com", studentId: "24008", contact: "0918"},
    ];
     allTasks = [
        { id: "t1", name: "Class meeting", assignedTo: ["m7", "m8"], status: "Done", dueDate: "2025-10-14", priority: "High", subtasks: [], subtaskStatus: [], submittedDate: '2025-10-13T10:00:00.000Z' },
        { id: "t2", name: "Team building plan", assignedTo: ["m2", "m5"], status: getTaskStatus("2025-10-20"), dueDate: "2025-10-20", priority: "Medium", subtasks: ["Finalize budget", "Book venue"], subtaskStatus: [true, false], submittedDate: null },
        { id: "t4", name: "Review Q3 Financials", assignedTo: ["m4", "m8"], status: getTaskStatus("2025-10-10"), dueDate: "2025-10-10", priority: "High", subtasks: [], subtaskStatus: [], submittedDate: null },
        { id: "t3", name: "Publish pubmats", assignedTo: ["m1"], status: getTaskStatus("2025-10-25"), dueDate: "2025-10-25", priority: "Low", subtasks: [], subtaskStatus: [], submittedDate: null },
        { id: "t5", name: "Prepare for November event", assignedTo: ["m1"], status: getTaskStatus("2025-11-05"), dueDate: "2025-11-05", priority: "Low", subtasks: [], subtaskStatus: [], submittedDate: null },
        { id: "t6", name: "Submit daily report", assignedTo: ["m8"], status: getTaskStatus("2025-10-16"), dueDate: "2025-10-16", priority: "High", subtasks: [], subtaskStatus: [], submittedDate: null },
        { id: "t7", name: "Organize Drive Files", assignedTo: ["m5"], status: "Done", dueDate: "2025-10-12", priority: "Low", subtasks: ["Create folders", "Upload documents"], subtaskStatus: [true, true], submittedDate: '2025-10-15T18:00:00.000Z' }
    ];
}

// --- REFACTORED SHARED LOGIC for Add/Edit Modals ---
const addSubtaskInput = (context = 'add', value = '') => {
    const listId = context === 'add' ? 'subtask-list' : 'edit-subtask-list';
    const subtaskList = document.getElementById(listId);
    const subtaskItem = document.createElement('div');
    subtaskItem.className = 'subtask-item flex items-center gap-2';
    subtaskItem.innerHTML = `<input type="text" class="subtask-input w-full bg-white p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sites-accent" placeholder="Add a subtask..." value="${value}"><button type="button" class="remove-subtask text-red-500 hover:text-red-700 opacity-50 hover:opacity-100"><i data-lucide="x-circle" class="w-5 h-5"></i></button>`;
    const input = subtaskItem.querySelector('.subtask-input');
    input.addEventListener('input', () => {
        const allInputs = [...subtaskList.querySelectorAll('.subtask-input')];
        if (input === allInputs[allInputs.length - 1] && input.value.trim() !== '') { addSubtaskInput(context); }
    });
    subtaskList.appendChild(subtaskItem);
    lucide.createIcons();
};

const renderMemberSelectionDropdown = (context = 'add', filter = '') => {
    const listId = context === 'add' ? 'member-list' : 'edit-member-list';
    const list = document.getElementById(listId);
    const filteredMembers = allMembers.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()));
    list.innerHTML = filteredMembers.map(member => `<div class="p-2 hover:bg-gray-100 cursor-pointer" data-id="${member.id}">${member.name}</div>`).join('');
};

const toggleMemberAssignment = (context = 'add', memberId) => {
    const idSet = context === 'add' ? assignedMemberIds : editAssignedMemberIds;
    if (idSet.has(memberId)) { idSet.delete(memberId); } else { idSet.add(memberId); }
    renderAssignedMembers(context);
    const searchInputId = context === 'add' ? 'member-search' : 'edit-member-search';
    document.getElementById(searchInputId).focus();
};

const renderAssignedMembers = (context = 'add') => {
    const boxId = context === 'add' ? 'assign-member-box' : 'edit-assign-member-box';
    const placeholderId = context === 'add' ? 'assign-placeholder' : 'edit-assign-placeholder';
    const idSet = context === 'add' ? assignedMemberIds : editAssignedMemberIds;
    const box = document.getElementById(boxId);
    const placeholder = document.getElementById(placeholderId);
    const memberElements = Array.from(box.querySelectorAll('div'));
    memberElements.forEach(el => el.remove());
    if (idSet.size > 0) {
        placeholder.classList.add('hidden');
        idSet.forEach(id => {
            const member = allMembers.find(m => m.id === id);
            if(member) {
                const memberEl = document.createElement('div');
                memberEl.className = 'bg-sites-light text-sites-dark text-sm font-semibold px-2 py-1 rounded-full flex items-center gap-2';
                memberEl.innerHTML = `<span>${member.name}</span><button type="button" class="text-sites-dark/50 hover:text-sites-dark" data-id="${id}"><i data-lucide="x" class="w-4 h-4"></i></button>`;
                box.appendChild(memberEl);
            }
        });
    } else { placeholder.classList.remove('hidden'); }
    lucide.createIcons();
};

// --- ADD TASK MODAL ---
window.showAddTaskModal = () => { document.getElementById('add-task-modal').classList.remove('hidden'); lucide.createIcons();};
window.hideAddTaskModal = () => {
    document.getElementById('add-task-form').reset();
    document.getElementById('subtask-list').innerHTML = '';
    assignedMemberIds.clear();
    renderAssignedMembers('add');
    addSubtaskInput('add');
    document.getElementById('add-task-modal').classList.add('hidden');
};
window.saveNewTask = () => { 
    const title = document.getElementById('task-title').value, dueDate = document.getElementById('task-due-date').value, priority = document.getElementById('task-priority').value, subtasks = [...document.querySelectorAll('#subtask-list .subtask-input')].map(input => input.value.trim()).filter(Boolean); 
    if (!title || !dueDate) return; 
    const status = getTaskStatus(dueDate); 
    const newTask = { id: `t${Date.now()}`, name: title, subtasks, priority, dueDate, assignedTo: Array.from(assignedMemberIds), status, subtaskStatus: subtasks.map(() => false), submittedDate: null }; 
    allTasks.push(newTask); 
    hideAddTaskModal(); 
    renderAssignPage(); 
    renderDashboardTasks(); 
    renderCalendarModal(); 
};

// --- EDIT TASK MODAL ---
window.showEditTaskModal = (taskId) => {
    const task = allTasks.find(t => t.id === taskId); if (!task) return;
    taskIdToEdit = taskId;
    document.getElementById('edit-task-title').value = task.name;
    document.getElementById('edit-task-priority').value = task.priority;
    document.getElementById('edit-task-due-date').value = task.dueDate;
    const subtaskList = document.getElementById('edit-subtask-list');
    subtaskList.innerHTML = '';
    if (task.subtasks && task.subtasks.length > 0) { task.subtasks.forEach(subtaskText => addSubtaskInput('edit', subtaskText)); }
    addSubtaskInput('edit');
    editAssignedMemberIds = new Set(task.assignedTo);
    renderAssignedMembers('edit');
    renderMemberSelectionDropdown('edit');
    document.getElementById('edit-task-modal').classList.remove('hidden');
    lucide.createIcons();
};
window.hideEditTaskModal = () => { taskIdToEdit = null; document.getElementById('edit-task-modal').classList.add('hidden'); };
window.saveTaskChanges = () => {
    if (!taskIdToEdit) return;
    const taskIndex = allTasks.findIndex(t => t.id === taskIdToEdit); if (taskIndex === -1) return;
    const title = document.getElementById('edit-task-title').value, dueDate = document.getElementById('edit-task-due-date').value, priority = document.getElementById('edit-task-priority').value;
    const subtasks = [...document.querySelectorAll('#edit-subtask-list .subtask-input')].map(input => input.value.trim()).filter(Boolean);
    if (!title || !dueDate) return;
    
    const originalTask = allTasks[taskIndex];
    const originalSubtasks = JSON.stringify(originalTask.subtasks);

    allTasks[taskIndex] = { ...originalTask, name: title, dueDate, priority, subtasks, assignedTo: Array.from(editAssignedMemberIds), status: originalTask.status === 'Done' ? 'Done' : getTaskStatus(dueDate) };

    if (JSON.stringify(subtasks) !== originalSubtasks) {
         allTasks[taskIndex].subtaskStatus = subtasks.map(() => false);
    }

    hideEditTaskModal(); 
    renderAssignPage(); 
    renderDashboardTasks(); 
    renderCalendarModal();
};

// --- TASK DETAILS MODAL ---
window.showTaskDetailsModal = (taskId) => { document.getElementById('task-details-modal').classList.remove('hidden'); lucide.createIcons();};
window.hideTaskDetailsModal = () => document.getElementById('task-details-modal').classList.add('hidden');

// --- TASK PROGRESS MODAL ---
window.showTaskProgressModal = (taskId) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('progress-task-title').textContent = task.name;
    document.getElementById('progress-task-date').textContent = `Due: ${task.dueDate}`;
    const subtaskList = document.getElementById('progress-subtask-list');
    subtaskList.innerHTML = '';

    const submitBtn = document.getElementById('progress-submit-btn');
    const unsubmitBtn = document.getElementById('progress-unsubmit-btn');
    const editBtn = document.getElementById('progress-edit-btn');
    
    submitBtn.onclick = () => submitTaskProgress(taskId);
    unsubmitBtn.onclick = () => unsubmitTask(taskId);
    editBtn.onclick = () => editTaskFromProgress(taskId);

    editBtn.style.display = (profileData.role === 'Admin') ? 'block' : 'none';

    const isDone = task.status === 'Done';
    const isOverdue = getTaskStatus(task.dueDate) === 'Overdue' && !isDone;
    
    if (isDone) {
        submitBtn.classList.add('hidden');
        unsubmitBtn.classList.remove('hidden');
    } else {
        submitBtn.classList.remove('hidden');
        unsubmitBtn.classList.add('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = isOverdue ? 'Submit Late' : 'Submit';
    }

    if (task.subtasks && task.subtasks.length > 0) {
        if (!task.subtaskStatus || task.subtaskStatus.length !== task.subtasks.length) {
            task.subtaskStatus = Array(task.subtasks.length).fill(false);
        }
        task.subtasks.forEach((subtaskText, index) => {
            const subtaskEl = document.createElement('label');
            subtaskEl.className = "flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer";
            const isChecked = task.subtaskStatus[index] ? 'checked' : '';
            const isDisabled = isDone ? 'disabled' : '';
            subtaskEl.innerHTML = `
                <input type="checkbox" onchange="updateTaskProgress('${taskId}')" class="progress-checkbox h-5 w-5 rounded border-gray-300 text-sites-accent focus:ring-sites-accent" ${isChecked} ${isDisabled}>
                <span class="text-gray-700">${subtaskText}</span>`;
            subtaskList.appendChild(subtaskEl);
        });
    } else {
        subtaskList.innerHTML = `<div class="text-center text-gray-500 p-4">This task has no subtasks to track.</div>`;
    }
    
    updateTaskProgress(taskId, true);
    document.getElementById('task-progress-modal').classList.remove('hidden');
    lucide.createIcons();
};

window.updateTaskProgress = (taskId, isInitial = false) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (!isInitial) {
        const checkboxes = document.querySelectorAll('#task-progress-modal .progress-checkbox');
        task.subtaskStatus = Array.from(checkboxes).map(cb => cb.checked);
        renderDashboardTasks(); // Update dashboard when progress changes
    }
    
    const total = task.subtasks.length;
    let checkedCount = 0;
    if (task.subtaskStatus) {
        checkedCount = task.subtaskStatus.filter(Boolean).length;
    }
    const percentage = total > 0 ? Math.round((checkedCount / total) * 100) : 100;

    document.getElementById('progress-bar-fill').style.width = `${percentage}%`;
    document.getElementById('progress-bar-text').textContent = `${percentage}%`;
};

window.submitTaskProgress = (taskId) => {
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    allTasks[taskIndex].status = 'Done';
    allTasks[taskIndex].submittedDate = MOCK_CURRENT_DATE.toISOString();
    
    // Re-render the modal content to reflect "Done" state
    showTaskProgressModal(taskId);

    // Re-render the background lists
    renderAssignPage();
    renderDashboardTasks();
    renderCalendarModal();
};

window.unsubmitTask = (taskId) => {
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        allTasks[taskIndex].status = getTaskStatus(allTasks[taskIndex].dueDate);
        allTasks[taskIndex].submittedDate = null;
        
        // Re-render modal to reflect the new state
        showTaskProgressModal(taskId);
        
        // Re-render background lists
        renderAssignPage();
        renderDashboardTasks();
        renderCalendarModal();
    }
};

window.editTaskFromProgress = (taskId) => {
    hideTaskProgressModal();
    showEditTaskModal(taskId);
};

window.hideTaskProgressModal = () => document.getElementById('task-progress-modal').classList.add('hidden');

// --- OTHER MODALS ---
window.showDeleteConfirmationModal = (taskId) => { taskIdToDelete = taskId; document.getElementById('delete-task-modal').classList.remove('hidden'); lucide.createIcons(); };
window.hideDeleteConfirmationModal = () => { taskIdToDelete = null; document.getElementById('delete-task-modal').classList.add('hidden'); };
const confirmDeleteTask = () => { 
    if (!taskIdToDelete) return; 
    allTasks = allTasks.filter(task => task.id !== taskIdToDelete); 
    renderAssignPage(); 
    renderDashboardTasks(); 
    renderCalendarModal(); 
    hideDeleteConfirmationModal(); 
};
window.showMemberDetailsModal = (memberId) => {
    const member = allMembers.find(m => m.id === memberId); if (!member) return; 
    document.getElementById('modal-member-avatar').querySelector('span').textContent = member.name.charAt(0).toUpperCase(); 
    document.getElementById('modal-member-name').textContent = member.name; 
    document.getElementById('modal-member-role').textContent = member.role; 
    document.getElementById('modal-member-email').textContent = member.email; 
    document.getElementById('modal-member-student-id').textContent = member.studentId; 
    document.getElementById('modal-member-contact').textContent = member.contact; 
    const memberTasks = allTasks.filter(task => task.assignedTo.includes(memberId)); 
    const tasksContainer = document.getElementById('modal-member-tasks'); 
    if (memberTasks.length > 0) { 
        tasksContainer.innerHTML = memberTasks.map(task => { 
            const progress = task.status === 'Done' ? 100 : Math.floor(Math.random() * 81); 
            return `<div><div class="flex justify-between items-center mb-1"><p class="font-semibold">${task.name}</p><span class="font-bold text-sites-accent text-sm">${progress}%</span></div><div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-sites-accent h-2 rounded-full" style="width: ${progress}%"></div></div></div>`; 
        }).join(''); 
    } else { 
        tasksContainer.innerHTML = `<p class="text-gray-500 text-center">No tasks assigned.</p>`; 
    } 
    document.getElementById('member-details-modal').classList.remove('hidden'); 
};
window.hideMemberDetailsModal = () => document.getElementById('member-details-modal').classList.add('hidden');
window.showEditProfileModal = () => { document.getElementById('edit-profile-modal').classList.remove('hidden'); showEditView('main'); };
window.hideEditProfileModal = () => document.getElementById('edit-profile-modal').classList.add('hidden');
window.showEditView = (viewName) => { 
    document.querySelectorAll('.edit-profile-view').forEach(v => v.classList.remove('active')); 
    document.getElementById(`edit-profile-${viewName}-view`).classList.add('active'); 
    if (viewName === 'main') { 
        document.getElementById('edit-modal-avatar').querySelector('span').textContent = (profileData.name || 'U').charAt(0).toUpperCase(); 
    } else if(viewName !== 'password' && viewName !== 'studentId') { 
        const input = document.getElementById(`edit-input-${viewName}`); 
        const saveBtn = document.getElementById(`save-${viewName}-btn`); 
        input.value = profileData[viewName] || ''; 
        saveBtn.classList.add('hidden'); 
        input.oninput = () => { if (input.value !== profileData[viewName]) { saveBtn.classList.remove('hidden'); } else { saveBtn.classList.add('hidden'); } }; 
    } 
    lucide.createIcons(); 
};
window.saveProfileField = (fieldName) => { 
    const newValue = document.getElementById(`edit-input-${fieldName}`).value; 
    if (newValue === profileData[fieldName]) { showEditView('main'); return; } 
    profileData[fieldName] = newValue; 
    updateProfileUI(profileData); 
    showEditView('main'); 
};
window.showCalendarModal = () => { calendarDate = new Date(MOCK_CURRENT_DATE); renderCalendarModal(); document.getElementById('calendar-modal').classList.remove('hidden'); };
window.hideCalendarModal = () => document.getElementById('calendar-modal').classList.add('hidden');
window.showMeetingModal=()=>{document.getElementById("edit-meeting-date").value=currentMeetingData.date||"";document.getElementById("edit-meeting-time").value=currentMeetingData.time||"";document.getElementById("edit-meeting-link").value=currentMeetingData.link||"";document.getElementById("meeting-modal").classList.remove("hidden")};
window.hideMeetingModal=()=>document.getElementById("meeting-modal").classList.add("hidden");
window.saveMeetingDetails=()=>{
    const newDate=document.getElementById("edit-meeting-date").value,newTime=document.getElementById("edit-meeting-time").value,newLink=document.getElementById("edit-meeting-link").value;
    if(!newDate||!newTime||!newLink)return; 
    currentMeetingData = { date: newDate, time: newTime, link: newLink }; 
    updateMeetingUI(currentMeetingData); 
    hideMeetingModal(); 
};

window.closeModal = (event, modalId) => {
    if (event.target.id === modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }
};

// --- UI RENDERING FUNCTIONS ---
const renderCalendarModal = () => { const calendarBody = document.getElementById('calendar-grid-body'), calendarHeader = document.getElementById('calendar-header'); if (!calendarBody || !calendarHeader) return; const month = calendarDate.getMonth(), year = calendarDate.getFullYear(), today = MOCK_CURRENT_DATE; calendarHeader.textContent = `${calendarDate.toLocaleString('default', { month: 'long' })} ${year}`; const firstDayOfMonth = new Date(year, month, 1), daysInMonth = new Date(year, month + 1, 0).getDate(), lastDayOfPrevMonth = new Date(year, month, 0).getDate(), startingDayOfWeek = firstDayOfMonth.getDay(); calendarBody.innerHTML = ''; let date = 1, nextMonthDate = 1; for (let i = 0; i < 42; i++) { if (i < startingDayOfWeek) { const day = lastDayOfPrevMonth - startingDayOfWeek + i + 1; calendarBody.innerHTML += `<div class="calendar-day other-month"><div class="calendar-day-number">${day}</div></div>`; } else if (date > daysInMonth) { calendarBody.innerHTML += `<div class="calendar-day other-month"><div class="calendar-day-number">${nextMonthDate++}</div></div>`; } else { const isToday = today.getDate() === date && today.getMonth() === month && today.getFullYear() === year; const tasksForDay = allTasks.filter(task => { const taskDate = new Date(task.dueDate + 'T00:00:00'); return taskDate.getDate() === date && taskDate.getMonth() === month && taskDate.getFullYear() === year; }); let tasksHtml = tasksForDay.map(task => `<div onclick="openTaskFromCalendar('${task.id}')" class="calendar-event priority-${task.priority?.toLowerCase() || 'medium'} cursor-pointer hover:opacity-75 transition-opacity">${task.name}</div>`).join(''); calendarBody.innerHTML += `<div class="calendar-day"><div class="calendar-day-number ${isToday ? 'today' : ''}">${date}</div>${tasksHtml}</div>`; date++; } } };
window.openTaskFromCalendar = (taskId) => {
    hideCalendarModal();
    navigate('assign');
    showTaskProgressModal(taskId);
};
const renderCalendarWidget = () => { const grid = document.getElementById('calendar-widget-grid'), header = document.getElementById('calendar-widget-month'); if(!grid || !header) return; const today = MOCK_CURRENT_DATE, month = today.getMonth(), year = today.getFullYear(); header.textContent = today.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase(); const firstDayOfMonth = new Date(year, month, 1).getDay(), daysInMonth = new Date(year, month + 1, 0).getDate(); grid.innerHTML = ''; for (let i = 0; i < firstDayOfMonth; i++) grid.innerHTML += `<span></span>`; for (let day = 1; day <= daysInMonth; day++) grid.innerHTML += `<span class="${day === today.getDate() ? 'font-bold bg-sites-accent text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto' : ''}">${day}</span>`; };

const renderDashboardTasks = () => {
    const container = document.getElementById("dashboard-task-list");
    if (!container) return;

    const activeTasks = allTasks.filter(t => t.status !== 'Done');

    if (activeTasks.length === 0) {
        container.innerHTML = '<div class="text-center py-8"><i data-lucide="party-popper" class="w-12 h-12 mx-auto text-green-500"></i><h4 class="mt-4 font-bold">All tasks completed!</h4><p class="text-gray-500">No active tasks at the moment.</p></div>';
        lucide.createIcons();
        return;
    }

    const tasksWithProgress = activeTasks.map(task => ({
        ...task,
        progress: calculateProgress(task)
    }));

    const topTask = tasksWithProgress.sort((a, b) => b.progress - a.progress)[0];
    const otherTasks = tasksWithProgress.filter(t => t.id !== topTask.id).slice(0, 3);

    let topTaskHtml = '';
    if (topTask) {
        const assignedMembers = topTask.assignedTo
            .map(id => allMembers.find(m => m.id === id)?.name || '')
            .filter(Boolean)
            .join(', ');

        topTaskHtml = `
            <div class="border-2 border-sites-accent rounded-lg p-4 bg-sites-accent/5">
                <h4 class="font-bold text-gray-500 mb-3 text-sm uppercase tracking-wider">Task with Most Progress</h4>
                <button onclick="showTaskProgressModal('${topTask.id}')" class="w-full text-left group">
                    <div class="flex justify-between items-center mb-2">
                        <p class="font-bold text-lg text-sites-dark group-hover:underline">${topTask.name}</p>
                        <span class="font-extrabold text-sites-accent text-xl">${topTask.progress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div class="bg-sites-accent h-3 rounded-full transition-all duration-500" style="width: ${topTask.progress}%"></div>
                    </div>
                    <p class="text-xs text-gray-500 truncate">Assigned to: <strong>${assignedMembers || 'N/A'}</strong></p>
                </button>
            </div>
        `;
    }

    let otherTasksHtml = '';
    if (otherTasks.length > 0) {
        otherTasksHtml = `
            <div class="mt-6 pt-6 border-t">
                 <h4 class="font-bold text-gray-500 mb-4 text-sm uppercase tracking-wider">Other Active Tasks</h4>
                 <div class="space-y-4">
                    ${otherTasks.map(task => `
                        <button onclick="showTaskProgressModal('${task.id}')" class="w-full text-left group">
                            <div class="flex justify-between items-center mb-1">
                                <p class="font-semibold text-gray-700 group-hover:text-sites-accent">${task.name}</p>
                                <span class="font-bold text-gray-500 text-sm">${task.progress}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-gray-400 h-2 rounded-full transition-all duration-500" style="width: ${task.progress}%"></div>
                            </div>
                        </button>
                    `).join("")}
                 </div>
            </div>`;
    }

    container.innerHTML = topTaskHtml + otherTasksHtml;
    lucide.createIcons();
};

const renderAssignPage = () => {
    const assignContent = document.getElementById("assign-content");
    if (!assignContent) return;

    const adminControls = profileData.role === 'Admin' 
        ? `<div class="flex justify-end"><button onclick="showAddTaskModal()" class="bg-sites-accent text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"><i data-lucide="plus" class="w-5 h-5"></i>Add New Task</button></div>` 
        : '';

    assignContent.innerHTML = `
        <div class="space-y-6">
            ${adminControls}
            <div id="task-summary-cards" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>
            <div id="task-tabs" class="border-b border-gray-300">
                <nav class="flex space-x-8 -mb-px">
                    <button data-tab="todo" class="tab-button py-4 px-1 text-sites-dark border-b-2 border-sites-dark font-semibold whitespace-nowrap">To-do</button>
                    <button data-tab="done" class="tab-button py-4 px-1 text-gray-500 hover:text-gray-800 border-b-2 border-transparent whitespace-nowrap">Done</button>
                    <button data-tab="overdue" class="tab-button py-4 px-1 text-gray-500 hover:text-gray-800 border-b-2 border-transparent whitespace-nowrap">Overdue</button>
                </nav>
            </div>
            <div id="task-accordion-container" class="space-y-3"></div>
        </div>
    `;
    const summaryContainer = document.getElementById('task-summary-cards');
    summaryContainer.innerHTML = `
        <div class="flex items-center p-5 bg-purple-600 text-white rounded-xl shadow-lg"><i data-lucide="list-checks" class="w-12 h-12 mr-6"></i><div><p class="text-4xl font-bold" id="todo-count">0</p><p class="font-medium">To-do</p></div></div>
        <div class="flex items-center p-5 bg-orange-500 text-white rounded-xl shadow-lg"><i data-lucide="calendar-clock" class="w-12 h-12 mr-6"></i><div><p class="text-4xl font-bold" id="pending-count">0</p><p class="font-medium">Pending</p></div></div>
        <div class="flex items-center p-5 bg-green-600 text-white rounded-xl shadow-lg"><i data-lucide="check-circle-2" class="w-12 h-12 mr-6"></i><div><p class="text-4xl font-bold" id="done-count">0</p><p class="font-medium">Done</p></div></div>
        <div class="flex items-center p-5 bg-red-600 text-white rounded-xl shadow-lg"><i data-lucide="alarm-clock" class="w-12 h-12 mr-6"></i><div><p class="text-4xl font-bold" id="overdue-count">0</p><p class="font-medium">Over Due</p></div></div>
    `;
    
    const doneTasks = allTasks.filter(t => t.status === 'Done');
    const overdueTasks = allTasks.filter(t => t.status === 'Overdue');
    const pendingTasks = allTasks.filter(t => t.status === 'Pending');
    const toDoTasks = [...pendingTasks, ...overdueTasks];
    document.getElementById('todo-count').textContent = toDoTasks.length;
    document.getElementById('pending-count').textContent = pendingTasks.length;
    document.getElementById('done-count').textContent = doneTasks.length;
    document.getElementById('overdue-count').textContent = overdueTasks.length;
    
    const today = new Date(MOCK_CURRENT_DATE); today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6);
    const startOfNextWeek = new Date(endOfWeek); startOfNextWeek.setDate(endOfWeek.getDate() + 1);
    const endOfNextWeek = new Date(startOfNextWeek); endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

    const createAccordionHTML = (taskCategories, alwaysShowCategories = false) => {
        const accordionContainer = document.getElementById('task-accordion-container');
        accordionContainer.innerHTML = '';
        
        for (const category in taskCategories) {
            const tasks = taskCategories[category];
            const accordionItem = document.createElement('div');
            accordionItem.className = 'bg-white rounded-lg shadow-sm';
            const taskListHtml = tasks.length > 0
                ? tasks.map(task => {
                    let lateIndicator = '';
                    if (task.status === 'Done' && task.submittedDate) {
                        const submitted = new Date(task.submittedDate);
                        const due = new Date(task.dueDate + 'T23:59:59');
                        if (submitted > due) {
                            lateIndicator = `<span class="ml-2 text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Late</span>`;
                        }
                    }
                    const taskNameButton = `<button onclick="showTaskProgressModal('${task.id}')" class="text-left flex-1 hover:text-sites-accent flex items-center">${task.name}${lateIndicator}</button>`;
                    const editButton = profileData.role === 'Admin' 
                        ? `<button onclick="showEditTaskModal('${task.id}')" class="text-gray-400 hover:text-sites-accent"><i data-lucide="edit-3" class="w-4 h-4"></i></button>`
                        : '';

                    return `
                    <div class="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                        ${taskNameButton}
                        <div class="flex items-center gap-4 pl-4">
                            <span class="text-sm text-gray-500">${task.dueDate}</span>
                            ${editButton}
                        </div>
                    </div>`;
                }).join('')
                : `<div class="px-6 py-3 border-t border-gray-200 text-center text-gray-400">No tasks in this period.</div>`;

            accordionItem.innerHTML = `
                <button class="accordion-header w-full flex justify-between items-center p-4 text-left font-semibold">
                    <span>${category}</span>
                    <div class="flex items-center space-x-4"><span class="text-gray-600">${tasks.length}</span><i data-lucide="chevron-up" class="accordion-arrow transition-transform duration-300"></i></div>
                </button>
                <div class="accordion-content">${taskListHtml}</div>
            `;
            accordionContainer.appendChild(accordionItem);
        }
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                header.nextElementSibling.classList.toggle('open');
                header.querySelector('.accordion-arrow').classList.toggle('open');
            });
        });
        lucide.createIcons();
    };
    
    const renderToDoAccordion = () => {
        createAccordionHTML({ 
            'Earlier': toDoTasks.filter(t => new Date(t.dueDate) < startOfWeek), 
            'This Week': toDoTasks.filter(t => { const d = new Date(t.dueDate); return d >= startOfWeek && d <= endOfWeek; }), 
            'Next Week': toDoTasks.filter(t => { const d = new Date(t.dueDate); return d >= startOfNextWeek && d <= endOfNextWeek; }), 
            'Later': toDoTasks.filter(t => new Date(t.dueDate) > endOfNextWeek) 
        }, true);
    };

    const renderDoneAccordion = () => {
         const taskCategories = {
            'Done Early': doneTasks.filter(t => new Date(t.dueDate) > endOfNextWeek),
            'Next Week': doneTasks.filter(t => { const d = new Date(t.dueDate); return d >= startOfNextWeek && d <= endOfNextWeek; }),
            'This Week': doneTasks.filter(t => { const d = new Date(t.dueDate); return d >= startOfWeek && d <= endOfWeek; }),
            'Earlier': doneTasks.filter(t => new Date(t.dueDate) < startOfWeek)
        };
        createAccordionHTML(taskCategories, true);
    };

    const renderOverdueAccordion = () => {
        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfWeek.getDate() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);

        const taskCategories = {
            'This Week': overdueTasks.filter(t => {
                const dueDate = new Date(t.dueDate);
                return dueDate >= startOfWeek && dueDate < today;
            }),
            'Last Week': overdueTasks.filter(t => {
                const dueDate = new Date(t.dueDate);
                return dueDate >= startOfLastWeek && dueDate <= endOfLastWeek;
            }),
            'Earlier': overdueTasks.filter(t => {
                const dueDate = new Date(t.dueDate);
                return dueDate < startOfLastWeek;
            })
        };
        createAccordionHTML(taskCategories, true);
    };
    
    const taskTabs = document.getElementById('task-tabs');
    if (taskTabs) {
        const buttons = taskTabs.querySelectorAll('button[data-tab]');
        taskTabs.addEventListener('click', (e) => {
            const clickedButton = e.target.closest('button[data-tab]');
            if (!clickedButton) return;

            buttons.forEach(btn => {
                btn.className = 'tab-button py-4 px-1 text-gray-500 hover:text-gray-800 border-b-2 border-transparent whitespace-nowrap';
            });
            clickedButton.className = 'tab-button py-4 px-1 text-sites-dark border-b-2 border-sites-dark font-semibold whitespace-nowrap';
            
            const tabName = clickedButton.dataset.tab;
            if (tabName === 'done') {
                renderDoneAccordion();
            } else if (tabName === 'overdue') {
                renderOverdueAccordion();
            } else {
                renderToDoAccordion();
            }
        });
    }

    renderToDoAccordion();
    lucide.createIcons();
};

const updateAdminUI = () => {
    const is_admin = profileData.role === 'Admin';
    const meetingCard = document.getElementById('meeting-card');

    if (meetingCard) {
        if (is_admin) {
            meetingCard.onclick = showMeetingModal;
            meetingCard.classList.add('cursor-pointer', 'hover:shadow-2xl', 'hover:-translate-y-1');
        } else {
            meetingCard.onclick = null;
            meetingCard.classList.remove('cursor-pointer', 'hover:shadow-2xl', 'hover:-translate-y-1');
        }
    }
};

const renderMembersPage=()=>{const grid=document.getElementById("members-grid");if(!grid)return;if(allMembers.length===0){grid.innerHTML='<p class="text-gray-500 col-span-full text-center">No members found.</p>';return}grid.innerHTML=allMembers.map(member=>`<button onclick="showMemberDetailsModal('${member.id}')" class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl hover:-translate-y-1 transition-all"><div class="w-24 h-24 bg-sites-light rounded-full mx-auto flex items-center justify-center mb-4 ring-4 ring-white shadow-inner"><span class="text-4xl font-bold text-sites-dark">${member.name.charAt(0).toUpperCase()}</span></div><h4 class="font-bold text-xl">${member.name}</h4><p class="text-gray-500">${member.role}</p></button>`).join("")};
const formatMeetingDate=dateString=>{if(!dateString)return"Date not set";try{const date=new Date(dateString+"T00:00:00"),today=new Date(MOCK_CURRENT_DATE);today.setHours(0,0,0,0);const tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);const meetingDate=new Date(date);meetingDate.setHours(0,0,0,0);if(meetingDate.getTime()===today.getTime())return"Today";if(meetingDate.getTime()===tomorrow.getTime())return"Tomorrow";return date.toLocaleString("en-US",{weekday:"long",month:"long",day:"numeric"})}catch(e){return dateString}};
const updateMeetingUI=data=>{document.getElementById("meeting-date").textContent=formatMeetingDate(data.date);document.getElementById("meeting-time").textContent=data.time||"N/A";const linkElement=document.getElementById("meeting-link");linkElement.textContent=data.link||"No Link";linkElement.href=data.link||"#"};
const updateProfileUI=data=>{ const name=data.name||"User",role=data.role||"Member",studentId=data.studentId||"0",email=data.email||"e@example.com",contact=data.contact||"N/A",firstInitial=name.charAt(0).toUpperCase(),displayName=name.split(",")[0]||"User"; document.getElementById("sidebar-user-name").textContent=name; document.getElementById("sidebar-user-role").textContent=role; document.getElementById("sidebar-user-id").textContent=`ID: ${studentId}`; document.getElementById("sidebar-initial-avatar").textContent=firstInitial; document.getElementById("welcome-message").textContent=`Welcome back, ${displayName}!`; document.getElementById("profile-full-name-card").textContent=name; document.getElementById("profile-role-card").textContent=role; document.getElementById("profile-student-id-card").textContent=`ID: ${studentId}`; document.getElementById("profile-email-card").textContent=email; document.getElementById("profile-student-id-main").textContent=studentId; document.getElementById("profile-contact-card").textContent=contact; document.getElementById("profile-card-avatar").textContent=firstInitial; };

// --- NAVIGATION ---
const navigate=pageId=>{
    document.querySelectorAll(".content-page").forEach(p=>p.classList.remove("active"));
    document.getElementById(`${pageId}-content`).classList.add("active");
    document.querySelectorAll("#sidebar-nav .nav-link").forEach(link=>{
        link.classList.remove("sidebar-item-active", "font-bold");
        link.classList.add("hover:bg-white/10", "rounded-lg", "mx-3", "text-sites-light", "font-semibold");
        if(link.dataset.page===pageId){
            link.classList.add("sidebar-item-active", "font-bold");
            link.classList.remove("hover:bg-white/10", "rounded-lg", "mx-3", "text-sites-light", "font-semibold");
        }
    });
    document.getElementById("header-title").textContent=contentMap[pageId]||"Dashboard";
    const editProfileFAB = document.getElementById('edit-profile-fab');
    if (pageId === 'profile') { editProfileFAB.classList.remove('hidden'); } else { editProfileFAB.classList.add('hidden'); }
    if (pageId === 'assign') { renderAssignPage(); }
    lucide.createIcons();
};
const setupNavigation=()=>{document.getElementById("sidebar-nav").addEventListener("click",event=>{const link=event.target.closest(".nav-link");if(link&&link.dataset.page){event.preventDefault();navigate(link.dataset.page)}})};
const setupCalendarControls = () => { document.getElementById('calendar-prev-btn').onclick = () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendarModal(); }; document.getElementById('calendar-next-btn').onclick = () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendarModal(); }; document.getElementById('calendar-today-btn').onclick = () => { calendarDate = new Date(MOCK_CURRENT_DATE); renderCalendarModal(); }; };

// --- APP INITIALIZATION ---
window.onload = () => {
    loadInitialData();
    updateProfileUI(profileData); 
    updateMeetingUI(currentMeetingData);
    renderDashboardTasks(); 
    renderAssignPage(); 
    renderMembersPage(); 
    renderCalendarWidget(); 
    renderCalendarModal();
    updateAdminUI();
    setupNavigation(); 
    setupCalendarControls();
    
    document.addEventListener('click', e => {
        const assignWrapper = document.getElementById('assign-member-wrapper');
        const editAssignWrapper = document.getElementById('edit-assign-member-wrapper');
        if (assignWrapper && !assignWrapper.contains(e.target)) {
            isDropdownOpen = false;
            document.getElementById('member-selection-dropdown').classList.add('hidden');
        }
        if (editAssignWrapper && !editAssignWrapper.contains(e.target)) {
            isEditDropdownOpen = false;
            document.getElementById('edit-member-selection-dropdown').classList.add('hidden');
        }
    });

    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDeleteTask);
    document.getElementById('cancel-delete-btn').addEventListener('click', hideDeleteConfirmationModal);
    document.getElementById('edit-profile-fab').addEventListener('click', showEditProfileModal);
    
    navigate('dashboard'); 
};