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
const contentMap = { 'dashboard': 'Dashboard', 'assign': 'Assign Tasks', 'members': 'Members', 'profile': 'Profile Information' };

// --- HELPER FUNCTIONS ---
const getTaskStatus = (dueDate) => {
    if (!dueDate) return 'Pending';
    const due = new Date(dueDate + 'T23:59:59');
    const today = new Date(MOCK_CURRENT_DATE);
    today.setHours(0, 0, 0, 0);
    return due < today ? 'Overdue' : 'Pending';
};

// --- INITIAL DATA ---
function loadInitialData() {
    // BACKEND: This entire function should be replaced by API calls to your server 
    // to fetch the real data from your database (e.g., using PHP and SQL).

    // BACKEND: Replace this mock data by fetching the logged-in user's profile from the database.
    profileData = { name: "Borloloy, Janjan", role: "Admin", studentId: "240000000740", email: "borloloy@gmail.co", contact: "09685421388" };
    
    // BACKEND: Fetch meeting details from the database.
    currentMeetingData = { date: "2025-10-17", time: "9:00 PM", link: "https://meet.google." };
    
    // BACKEND: Fetch all team members from the database.
    allMembers = [
        {id:"m1", name:"Junsoy LoveJun",role:"Designer", email: "junsoy.l@example.com", studentId: "24001", contact: "0911"}, {id:"m2", name:"Juneks",role:"P.I.O", email: "juneks@example.com", studentId: "24002", contact: "0912"},
        {id:"m3", name:"Douglas",role:"Auditor", email: "douglas@example.com", studentId: "24003", contact: "0913"}, {id:"m4", name:"Barkley",role:"Tresurer", email: "barkley@example.com", studentId: "24004", contact: "0914"},
        {id:"m5", name:"Wiggy",role:"Secretary", email: "wiggy@example.com", studentId: "24005", contact: "0915"}, {id:"m6", name:"Boss Ok",role:"1st Year rep", email: "boss.ok@example.com", studentId: "24006", contact: "0916"},
        {id:"m7", name:"CyberJorj",role:"President", email: "cyberjorj@example.com", studentId: "24007", contact: "0917"}, {id:"m8", name:"Janjan B",role:"Vice President", email: "janjan@example.com", studentId: "24008", contact: "0918"},
    ];

    // BACKEND: Fetch all tasks from the database.
    allTasks = [
        { id: "t1", name: "Class meeting", assignedTo: ["m7", "m8"], status: "Done", dueDate: "2025-10-14", priority: "High", subtasks: [] },
        { id: "t2", name: "Team building plan", assignedTo: ["m2", "m5"], status: getTaskStatus("2025-10-20"), dueDate: "2025-10-20", priority: "Medium", subtasks: ["Finalize budget", "Book venue"] },
        { id: "t4", name: "Review Q3 Financials", assignedTo: ["m4", "m8"], status: getTaskStatus("2025-10-10"), dueDate: "2025-10-10", priority: "High", subtasks: [] },
        { id: "t3", name: "Publish pubmats", assignedTo: ["m1"], status: getTaskStatus("2025-10-25"), dueDate: "2025-10-25", priority: "Low", subtasks: [] },
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
window.showAddTaskModal = () => { document.getElementById('add-task-form').reset(); document.getElementById('subtask-list').innerHTML = ''; assignedMemberIds.clear(); renderMemberSelectionDropdown('add'); renderAssignedMembers('add'); addSubtaskInput('add'); document.getElementById('add-task-modal').classList.remove('hidden'); lucide.createIcons();};
window.hideAddTaskModal = () => document.getElementById('add-task-modal').classList.add('hidden');
window.saveNewTask = () => { 
    const title = document.getElementById('task-title').value, dueDate = document.getElementById('task-due-date').value, priority = document.getElementById('task-priority').value, subtasks = [...document.querySelectorAll('#subtask-list .subtask-input')].map(input => input.value.trim()).filter(Boolean); 
    if (!title || !dueDate) return; 
    const status = getTaskStatus(dueDate); 
    const newTask = { id: `t${Date.now()}`, name: title, subtasks, priority, dueDate, assignedTo: Array.from(assignedMemberIds), status }; 
    
    // BACKEND: Instead of pushing to a local array, send this 'newTask' object to the server 
    // (e.g., via a POST request) to be inserted into the database.
    allTasks.push(newTask); 
    
    hideAddTaskModal(); 
    // After a successful backend call, you would re-fetch the data or expect the updated list.
    // For this UI prototype, we just re-render the local data.
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

    // BACKEND: Send the updated task data to the server to update the corresponding record in the database using 'taskIdToEdit'.
    allTasks[taskIndex] = { ...allTasks[taskIndex], name: title, dueDate, priority, subtasks, assignedTo: Array.from(editAssignedMemberIds), status: allTasks[taskIndex].status === 'Done' ? 'Done' : getTaskStatus(dueDate), };
    
    hideEditTaskModal(); 
    // After a successful backend call, re-render the UI.
    renderAssignPage(); 
    renderDashboardTasks(); 
    renderCalendarModal();
};

// --- TASK DETAILS MODAL ---
window.showTaskDetailsModal = (taskId) => {
    const task = allTasks.find(t => t.id === taskId); if (!task) return;
    document.getElementById('details-task-title').textContent = task.name;
    const statusEl = document.getElementById('details-task-status');
    statusEl.textContent = task.status;
    statusEl.className = `status-badge status-${task.status.toLowerCase()}`;
    document.getElementById('details-task-priority').textContent = `${task.priority} Priority`;
    document.getElementById('details-task-due-date').textContent = task.dueDate;
    const membersContainer = document.getElementById('details-task-members');
    membersContainer.innerHTML = task.assignedTo.map(memberId => {
        const member = allMembers.find(m => m.id === memberId);
        if (!member) return '';
        return `<div class="flex items-center space-x-2">
                            <div class="w-10 h-10 bg-sites-light rounded-full flex items-center justify-center text-sites-dark font-bold text-lg">${member.name.charAt(0)}</div>
                            <span class="font-semibold">${member.name}</span>
                        </div>`;
    }).join('');
    const subtasksContainer = document.getElementById('details-task-subtasks');
    if (task.subtasks && task.subtasks.length > 0) {
        subtasksContainer.innerHTML = task.subtasks.map(subtask => 
            `<div class="flex items-center">
                        <i data-lucide="check-square" class="w-5 h-5 mr-3 text-sites-accent"></i>
                        <span>${subtask}</span>
                    </div>`
        ).join('');
    } else {
        subtasksContainer.innerHTML = `<p class="text-gray-500">No subtasks for this task.</p>`;
    }
    document.getElementById('task-details-modal').classList.remove('hidden');
    lucide.createIcons();
};
window.hideTaskDetailsModal = () => document.getElementById('task-details-modal').classList.add('hidden');

// --- OTHER MODALS ---
window.showDeleteConfirmationModal = (taskId) => { taskIdToDelete = taskId; document.getElementById('delete-task-modal').classList.remove('hidden'); lucide.createIcons(); };
const hideDeleteConfirmationModal = () => { taskIdToDelete = null; document.getElementById('delete-task-modal').classList.add('hidden'); };
const confirmDeleteTask = () => { 
    if (!taskIdToDelete) return; 
    // BACKEND: Send a request to the server to delete the task with the ID 'taskIdToDelete' from the database.
    allTasks = allTasks.filter(task => task.id !== taskIdToDelete); 
    // After a successful backend call, re-render the UI.
    renderAssignPage(); 
    renderDashboardTasks(); 
    renderCalendarModal(); 
    hideDeleteConfirmationModal(); 
};
window.showMemberDetailsModal = (memberId) => { const member = allMembers.find(m => m.id === memberId); if (!member) return; document.getElementById('modal-member-avatar').querySelector('span').textContent = member.name.charAt(0).toUpperCase(); document.getElementById('modal-member-name').textContent = member.name; document.getElementById('modal-member-role').textContent = member.role; document.getElementById('modal-member-email').textContent = member.email; document.getElementById('modal-member-student-id').textContent = member.studentId; document.getElementById('modal-member-contact').textContent = member.contact; const memberTasks = allTasks.filter(task => task.assignedTo.includes(memberId)); const tasksContainer = document.getElementById('modal-member-tasks'); if (memberTasks.length > 0) { tasksContainer.innerHTML = memberTasks.map(task => { const progress = task.status === 'Done' ? 100 : Math.floor(Math.random() * 81); return `<div><div class="flex justify-between items-center mb-1"><p class="font-semibold">${task.name}</p><span class="font-bold text-sites-accent text-sm">${progress}%</span></div><div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-sites-accent h-2 rounded-full" style="width: ${progress}%"></div></div></div>`; }).join(''); } else { tasksContainer.innerHTML = `<p class="text-gray-500 text-center">No tasks assigned.</p>`; } document.getElementById('member-details-modal').classList.remove('hidden'); };
window.hideMemberDetailsModal = () => document.getElementById('member-details-modal').classList.add('hidden');

window.showEditProfileModal = () => { 
    document.getElementById('edit-profile-modal').classList.remove('hidden'); 
    showEditView('main'); 
};
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
        input.oninput = () => { 
            if (input.value !== profileData[viewName]) { 
                saveBtn.classList.remove('hidden'); 
            } else { 
                saveBtn.classList.add('hidden'); 
            } 
        }; 
    } 
    lucide.createIcons(); 
};

window.saveProfileField = (fieldName) => { 
    const newValue = document.getElementById(`edit-input-${fieldName}`).value; 
    if (newValue === profileData[fieldName]) { 
        showEditView('main'); 
        return; 
    } 
    // BACKEND: Send the 'fieldName' and 'newValue' to the server to update the user's profile in the database.
    profileData[fieldName] = newValue; 
    // After successful backend update, re-render the UI.
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
    
    // BACKEND: Send these new meeting details to the server to update the database.
    currentMeetingData = { date: newDate, time: newTime, link: newLink }; 

    updateMeetingUI(currentMeetingData); 
    hideMeetingModal(); 
};

// --- UI RENDERING FUNCTIONS ---
const renderCalendarModal = () => { const calendarBody = document.getElementById('calendar-grid-body'), calendarHeader = document.getElementById('calendar-header'); if (!calendarBody || !calendarHeader) return; const month = calendarDate.getMonth(), year = calendarDate.getFullYear(), today = MOCK_CURRENT_DATE; calendarHeader.textContent = `${calendarDate.toLocaleString('default', { month: 'long' })} ${year}`; const firstDayOfMonth = new Date(year, month, 1), daysInMonth = new Date(year, month + 1, 0).getDate(), lastDayOfPrevMonth = new Date(year, month, 0).getDate(), startingDayOfWeek = firstDayOfMonth.getDay(); calendarBody.innerHTML = ''; let date = 1, nextMonthDate = 1; for (let i = 0; i < 42; i++) { if (i < startingDayOfWeek) { const day = lastDayOfPrevMonth - startingDayOfWeek + i + 1; calendarBody.innerHTML += `<div class="calendar-day other-month"><div class="calendar-day-number">${day}</div></div>`; } else if (date > daysInMonth) { calendarBody.innerHTML += `<div class="calendar-day other-month"><div class="calendar-day-number">${nextMonthDate++}</div></div>`; } else { const isToday = today.getDate() === date && today.getMonth() === month && today.getFullYear() === year; const tasksForDay = allTasks.filter(task => { const taskDate = new Date(task.dueDate + 'T00:00:00'); return taskDate.getDate() === date && taskDate.getMonth() === month && taskDate.getFullYear() === year; }); let tasksHtml = tasksForDay.map(task => `<div class="calendar-event priority-${task.priority?.toLowerCase() || 'medium'}">${task.name}</div>`).join(''); calendarBody.innerHTML += `<div class="calendar-day"><div class="calendar-day-number ${isToday ? 'today' : ''}">${date}</div>${tasksHtml}</div>`; date++; } } };
const renderCalendarWidget = () => { const grid = document.getElementById('calendar-widget-grid'), header = document.getElementById('calendar-widget-month'); if(!grid || !header) return; const today = MOCK_CURRENT_DATE, month = today.getMonth(), year = today.getFullYear(); header.textContent = today.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase(); const firstDayOfMonth = new Date(year, month, 1).getDay(), daysInMonth = new Date(year, month + 1, 0).getDate(); grid.innerHTML = ''; for (let i = 0; i < firstDayOfMonth; i++) grid.innerHTML += `<span></span>`; for (let day = 1; day <= daysInMonth; day++) grid.innerHTML += `<span class="${day === today.getDate() ? 'font-bold bg-sites-accent text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto' : ''}">${day}</span>`; };
const renderDashboardTasks=()=>{const list=document.getElementById("dashboard-task-list");if(!list)return;const tasksToShow=allTasks.filter(t=>t.status!=='Done').slice(0,4);if(tasksToShow.length===0){list.innerHTML='<p class="text-gray-500">No active tasks. Add one in "Assign Tasks".</p>';return}list.innerHTML=tasksToShow.map(task=>{const percentage=task.status==='Done'?100:Math.floor(Math.random()*61)+20;return`<div><div class="flex justify-between items-center mb-1"><p class="font-semibold">${task.name}</p><span class="font-bold text-sites-accent">${percentage}%</span></div><div class="w-full bg-gray-200 rounded-full h-2.5"><div class="bg-sites-accent h-2.5 rounded-full" style="width: ${percentage}%"></div></div></div>`}).join("")};
const renderAssignPage=()=>{const tbody=document.getElementById("assign-table-body");if(!tbody)return;if(allTasks.length===0){tbody.innerHTML='<tr><td colspan="5" class="text-center p-8 text-gray-500">No tasks found. Click "Add Task".</td></tr>';return}tbody.innerHTML=allTasks.map(task=>{const assignedMembersHtml=task.assignedTo?.map(id=>{const member=allMembers.find(m=>m.id===id);return member?`<div title="${member.name}" class="w-8 h-8 bg-sites-light rounded-full flex items-center justify-center text-sites-dark font-bold text-sm ring-2 ring-white">${member.name.charAt(0)}</div>`:'';}).join("")||'';return`<tr class="border-b hover:bg-gray-50"><td class="p-4 font-semibold"><button onclick="showTaskDetailsModal('${task.id}')" class="text-left hover:text-sites-accent">${task.name}</button></td><td class="p-4"><div class="flex -space-x-2">${assignedMembersHtml}</div></td><td class="p-4"><span class="status-badge status-${task.status.toLowerCase()}">${task.status}</span></td><td class="p-4">${task.dueDate}</td><td class="p-4"><div class="flex space-x-2"><button onclick="showEditTaskModal('${task.id}')" class="text-gray-500 hover:text-sites-accent"><i data-lucide="pencil" class="w-5 h-5"></i></button><button onclick="showDeleteConfirmationModal('${task.id}')" class="text-gray-500 hover:text-red-600"><i data-lucide="trash-2" class="w-5 h-5"></i></button></div></td></tr>`}).join("");lucide.createIcons()};
const renderMembersPage=()=>{const grid=document.getElementById("members-grid");if(!grid)return;if(allMembers.length===0){grid.innerHTML='<p class="text-gray-500 col-span-full text-center">No members found.</p>';return}grid.innerHTML=allMembers.map(member=>`<button onclick="showMemberDetailsModal('${member.id}')" class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl hover:-translate-y-1 transition-all"><div class="w-24 h-24 bg-sites-light rounded-full mx-auto flex items-center justify-center mb-4 ring-4 ring-white shadow-inner"><span class="text-4xl font-bold text-sites-dark">${member.name.charAt(0).toUpperCase()}</span></div><h4 class="font-bold text-xl">${member.name}</h4><p class="text-gray-500">${member.role}</p></button>`).join("")};
const formatMeetingDate=dateString=>{if(!dateString)return"Date not set";try{const date=new Date(dateString+"T00:00:00"),today=new Date(MOCK_CURRENT_DATE);today.setHours(0,0,0,0);const tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);const meetingDate=new Date(date);meetingDate.setHours(0,0,0,0);if(meetingDate.getTime()===today.getTime())return"Today";if(meetingDate.getTime()===tomorrow.getTime())return"Tomorrow";return date.toLocaleString("en-US",{weekday:"long",month:"long",day:"numeric"})}catch(e){return dateString}};
const updateMeetingUI=data=>{document.getElementById("meeting-date").textContent=formatMeetingDate(data.date);document.getElementById("meeting-time").textContent=data.time||"N/A";const linkElement=document.getElementById("meeting-link");linkElement.textContent=data.link||"No Link";linkElement.href=data.link||"#"};
const updateProfileUI=data=>{ const name=data.name||"User",role=data.role||"Member",studentId=data.studentId||"0",email=data.email||"e@example.com",contact=data.contact||"N/A",firstInitial=name.charAt(0).toUpperCase(),displayName=name.split(",")[0]||"User"; document.getElementById("sidebar-user-name").textContent=name; document.getElementById("sidebar-user-role").textContent=role; document.getElementById("sidebar-user-id").textContent=`ID: ${studentId}`; document.getElementById("sidebar-initial-avatar").textContent=firstInitial; document.getElementById("welcome-message").textContent=`Welcome back, ${displayName}!`; document.getElementById("profile-full-name-card").textContent=name; document.getElementById("profile-role-card").textContent=role; document.getElementById("profile-student-id-card").textContent=`ID: ${studentId}`; document.getElementById("profile-email-card").textContent=email; document.getElementById("profile-student-id-main").textContent=studentId; document.getElementById("profile-contact-card").textContent=contact; document.getElementById("profile-card-avatar").textContent=firstInitial; };

// --- NAVIGATION ---
const navigate=pageId=>{
    document.querySelectorAll(".content-page").forEach(p=>p.classList.remove("active"));
    document.getElementById(`${pageId}-content`).classList.add("active");
    document.querySelectorAll("#sidebar-nav .nav-link").forEach(link=>{
        // Reset to default inactive state
        link.classList.remove("sidebar-item-active", "font-bold");
        link.classList.add("hover:bg-white/10", "rounded-lg", "mx-3", "text-sites-light", "font-semibold");
        
        // Apply active state if it matches
        if(link.dataset.page===pageId){
            link.classList.add("sidebar-item-active", "font-bold");
            link.classList.remove("hover:bg-white/10", "rounded-lg", "mx-3", "text-sites-light", "font-semibold");
        }
    });
    document.getElementById("header-title").textContent=contentMap[pageId]||"Dashboard";
    const editProfileFAB = document.getElementById('edit-profile-fab');
    if (pageId === 'profile') {
        editProfileFAB.classList.remove('hidden');
    } else {
        editProfileFAB.classList.add('hidden');
    }
    lucide.createIcons();
};
const setupNavigation=()=>{document.getElementById("sidebar-nav").addEventListener("click",event=>{const link=event.target.closest(".nav-link");if(link&&link.dataset.page){event.preventDefault();navigate(link.dataset.page)}})};
const setupCalendarControls = () => { document.getElementById('calendar-prev-btn').onclick = () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendarModal(); }; document.getElementById('calendar-next-btn').onclick = () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendarModal(); }; document.getElementById('calendar-today-btn').onclick = () => { calendarDate = new Date(MOCK_CURRENT_DATE); renderCalendarModal(); }; };

// --- APP INITIALIZATION ---
window.onload = () => {
    loadInitialData();
    updateProfileUI(profileData); updateMeetingUI(currentMeetingData);
    renderDashboardTasks(); renderAssignPage(); renderMembersPage(); renderCalendarWidget(); renderCalendarModal();
    setupNavigation(); setupCalendarControls();
    
    // Event Listeners for Add Task Modal
    const assignWrapper = document.getElementById('assign-member-wrapper');
    const dropdown = document.getElementById('member-selection-dropdown');
    assignWrapper.addEventListener('click', e => { const box=e.target.closest('#assign-member-box'),item=e.target.closest('#member-list > div'),btn=e.target.closest('button[data-id]'); if(box){isDropdownOpen=!isDropdownOpen;dropdown.classList.toggle('hidden',!isDropdownOpen);} else if(item){toggleMemberAssignment('add',item.dataset.id);} if(btn){e.stopPropagation();toggleMemberAssignment('add',btn.dataset.id);} });
    document.getElementById('member-search').addEventListener('input', e => renderMemberSelectionDropdown('add', e.target.value));
    document.getElementById('subtask-list').addEventListener('click', e => { const btn = e.target.closest('.remove-subtask'); if(btn){ const items = document.querySelectorAll('#subtask-list .subtask-item'); if(items.length > 1){btn.closest('.subtask-item').remove();} else {btn.closest('.subtask-item').querySelector('input').value='';}}});
    
    // Event Listeners for Edit Task Modal
    const editAssignWrapper = document.getElementById('edit-assign-member-wrapper');
    const editDropdown = document.getElementById('edit-member-selection-dropdown');
    editAssignWrapper.addEventListener('click', e => { const box=e.target.closest('#edit-assign-member-box'),item=e.target.closest('#edit-member-list > div'),btn=e.target.closest('button[data-id]'); if(box){isEditDropdownOpen=!isEditDropdownOpen;editDropdown.classList.toggle('hidden',!isEditDropdownOpen);} else if(item){toggleMemberAssignment('edit',item.dataset.id);} if(btn){e.stopPropagation();toggleMemberAssignment('edit',btn.dataset.id);} });
    document.getElementById('edit-member-search').addEventListener('input', e => renderMemberSelectionDropdown('edit', e.target.value));
    document.getElementById('edit-subtask-list').addEventListener('click', e => { const btn = e.target.closest('.remove-subtask'); if(btn){ const items = document.querySelectorAll('#edit-subtask-list .subtask-item'); if(items.length > 1){btn.closest('.subtask-item').remove();} else {btn.closest('.subtask-item').querySelector('input').value='';}}});
    
    // Global listeners
    document.addEventListener('click', e => { if (!assignWrapper.contains(e.target)) { isDropdownOpen = false; dropdown.classList.add('hidden'); } if (!editAssignWrapper.contains(e.target)) { isEditDropdownOpen = false; editDropdown.classList.add('hidden'); } });
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDeleteTask);
    document.getElementById('cancel-delete-btn').addEventListener('click', hideDeleteConfirmationModal);
    document.getElementById('edit-profile-fab').addEventListener('click', showEditProfileModal);

    navigate('dashboard'); 
};