document.addEventListener('DOMContentLoaded', function() {
    const addUserForm = document.getElementById('add-user-form');
    const tableBody = document.getElementById('members-table-body');
    const statusMessage = document.getElementById('status-message');

    // Edit Modal elements
    const editModal = document.getElementById('editModal');
    const editUserForm = document.getElementById('edit-user-form');
    const closeEditModalBtn = editModal.querySelector('.close-btn');
    const cancelEditModalBtn = editModal.querySelector('.modal-btn.cancel');
    let rowToEdit = null;

    // Delete Modal elements
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = deleteModal.querySelector('.modal-btn.confirm');
    const cancelDeleteBtn = deleteModal.querySelector('.modal-btn.cancel');
    let rowToDelete = null;

    // --- UI/STATUS FUNCTIONS ---
    
    const showStatus = (message, type = 'success') => {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        setTimeout(() => { statusMessage.style.display = 'none'; }, 3000);
    };
    
    // --- MODAL FUNCTIONS ---

    const openEditModal = (row) => {
        rowToEdit = row;
        const cells = row.querySelectorAll('td');
        // Populate modal form
        editUserForm.querySelector('#editUserId').value = row.dataset.id;
        editUserForm.querySelector('#editUsername').value = cells[0].textContent;
        editUserForm.querySelector('#editName').value = cells[1].textContent;
        editUserForm.querySelector('#editRole').value = cells[2].textContent;
        editUserForm.querySelector('#editPassword').value = ''; // Clear password field
        editModal.style.display = 'flex';
    };

    const closeEditModal = () => {
        editModal.style.display = 'none';
        rowToEdit = null;
    };
    
    const openDeleteModal = (row) => {
        rowToDelete = row;
        deleteModal.style.display = 'flex';
    };

    const closeDeleteModal = () => {
        deleteModal.style.display = 'none';
        rowToDelete = null;
    };

    // --- EVENT LISTENERS ---

    // Table button clicks (Edit/Delete)
    tableBody.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            openEditModal(e.target.closest('tr'));
        }
        if (e.target.classList.contains('delete-btn')) {
            openDeleteModal(e.target.closest('tr'));
        }
    });

    // ADD User Form Submission
    addUserForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(addUserForm);
        const username = formData.get('username');
        const name = formData.get('name');
        const role = formData.get('role');
        
        const newId = Date.now();
        const newRow = document.createElement('tr');
        newRow.dataset.id = newId;
        newRow.innerHTML = `
            <td>${username}</td>
            <td>${name}</td>
            <td>${role}</td>
            <td>****</td>
            <td class="action-links"><a class="edit-btn">Edit</a> <a class="delete-btn">Delete</a></td>
        `;
        tableBody.appendChild(newRow);
        showStatus('User added successfully!');
        addUserForm.reset();
    });

    // EDIT User Modal Form Submission
    editUserForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(editUserForm);
        const username = formData.get('username');
        const name = formData.get('name');
        const role = formData.get('role');
        // Note: a backend would handle the new password if formData.get('password') is not empty

        if (rowToEdit) {
            const cells = rowToEdit.querySelectorAll('td');
            cells[0].textContent = username;
            cells[1].textContent = name;
            cells[2].textContent = role;
        }
        showStatus('User updated successfully!');
        closeEditModal();
    });

    // DELETE User Modal Confirmation
    confirmDeleteBtn.addEventListener('click', () => {
        if (rowToDelete) {
            rowToDelete.remove();
            showStatus('User deleted successfully.');
        }
        closeDeleteModal();
    });

    // Listeners to close modals
    closeEditModalBtn.addEventListener('click', closeEditModal);
    cancelEditModalBtn.addEventListener('click', closeEditModal);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);

    window.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
        if (e.target === editModal) closeEditModal();
    });
});
