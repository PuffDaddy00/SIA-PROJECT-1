document.addEventListener('DOMContentLoaded', function() {
    const addUserForm = document.getElementById('add-user-form');
    const tableBody = document.getElementById('members-table-body');
    const statusMessage = document.getElementById('status-message');
    
    // Add User form profile pic elements
    const addProfilePicInput = document.getElementById('profilePic');
    const addProfilePicPreview = document.getElementById('addProfilePicPreview');

    // Edit Modal elements
    const editModal = document.getElementById('editModal');
    const editUserForm = document.getElementById('edit-user-form');
    const closeEditModalBtn = editModal.querySelector('.close-btn');
    const cancelEditModalBtn = editModal.querySelector('.modal-btn.cancel');
    const editProfilePicInput = document.getElementById('editProfilePic');
    const editProfilePicPreview = document.getElementById('editProfilePicPreview');
    let rowToEdit = null;

    // Delete Modal elements
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = deleteModal.querySelector('.modal-btn.confirm');
    const cancelDeleteBtn = deleteModal.querySelector('.modal-btn.cancel');
    let rowToDelete = null;

    // Image Preview Modal elements
    const imagePreviewModal = document.getElementById('imagePreviewModal');
    const modalImage = document.getElementById('modalImage');
    const closeImagePreviewBtn = imagePreviewModal.querySelector('.close-btn');

    // --- HELPER FUNCTIONS ---
    
    const showStatus = (message, type = 'success') => {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        setTimeout(() => { statusMessage.style.display = 'none'; }, 3000);
    };

    const handleImagePreview = (input, preview) => {
        input.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => { preview.src = e.target.result; }
                reader.readAsDataURL(this.files[0]);
            }
        });
    };

    // New function to handle rendering a table row to reduce repetition
    const renderTableRow = (row, data) => {
        row.innerHTML = `
            <td><img src="${data.profilePicSrc}" alt="${data.name}" class="profile-pic-table"></td>
            <td>${data.username}</td>
            <td>${data.name}</td>
            <td>${data.role}</td>
            <td>****</td>
            <td class="action-links"><a class="edit-btn">Edit</a> <a class="delete-btn">Delete</a></td>
        `;
    };
    
    // --- MODAL FUNCTIONS ---
    const openImagePreviewModal = (src) => {
        modalImage.src = src;
        imagePreviewModal.style.display = 'flex';
    };

    const closeImagePreviewModal = () => {
        imagePreviewModal.style.display = 'none';
    };

    const openEditModal = (row) => {
        rowToEdit = row;
        const cells = row.querySelectorAll('td');
        
        editUserForm.querySelector('#editUserId').value = row.dataset.id;
        editProfilePicPreview.src = cells[0].querySelector('img').src;
        editUserForm.querySelector('#editUsername').value = cells[1].textContent;
        editUserForm.querySelector('#editName').value = cells[2].textContent;
        editUserForm.querySelector('#editRole').value = cells[3].textContent;
        editUserForm.querySelector('#editPassword').value = ''; 
        editUserForm.querySelector('#confirmEditPassword').value = ''; 
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

    handleImagePreview(addProfilePicInput, addProfilePicPreview);
    handleImagePreview(editProfilePicInput, editProfilePicPreview);

    tableBody.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) openEditModal(e.target.closest('tr'));
        if (e.target.classList.contains('delete-btn')) openDeleteModal(e.target.closest('tr'));
        if (e.target.classList.contains('profile-pic-table')) openImagePreviewModal(e.target.src);
    });

    addUserForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(addUserForm);
        const userData = {
            username: formData.get('username'),
            name: formData.get('name'),
            role: formData.get('role'),
            profilePicSrc: addProfilePicPreview.src
        };
        
        const newRow = tableBody.insertRow();
        newRow.dataset.id = Date.now();
        renderTableRow(newRow, userData);

        showStatus('User added successfully!');
        addUserForm.reset();
        addProfilePicPreview.src = 'https://placehold.co/100x100/EFEFEF/AAAAAA?text=PREVIEW';
    });

    editUserForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(editUserForm);
        const newPassword = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (newPassword !== confirmPassword) {
            showStatus('Passwords do not match.', 'error');
            return;
        }

        if (rowToEdit) {
            const userData = {
                username: formData.get('username'),
                name: formData.get('name'),
                role: formData.get('role'),
                profilePicSrc: editProfilePicPreview.src
            };
            renderTableRow(rowToEdit, userData);
        }
        showStatus('User updated successfully!');
        closeEditModal();
    });

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
    closeImagePreviewBtn.addEventListener('click', closeImagePreviewModal);

    window.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
        if (e.target === editModal) closeEditModal();
        if (e.target === imagePreviewModal) closeImagePreviewModal();
    });
});

