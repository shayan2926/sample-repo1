// Contact Management App
class ContactManager {
    constructor() {
        this.contacts = JSON.parse(localStorage.getItem('contacts')) || [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayContacts();
    }

    setupEventListeners() {
        // Form submission for adding new contact
        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addContact();
        });

        // Search functionality
        document.getElementById('searchBox').addEventListener('input', (e) => {
            this.searchContacts(e.target.value);
        });

        // Edit Modal Save Button
        document.getElementById('saveEditBtn').addEventListener('click', () => {
            this.saveEdit();
        });

        // Delete Confirmation
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.deleteContact(this.currentDeleteId);
        });

        // Cancel Edit Button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelEdit();
        });
    }

    addContact() {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value.trim();
        const zip = document.getElementById('zip').value.trim();

        // Validate email format
        if (!this.validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Validate phone format (basic validation)
        if (!this.validatePhone(phone)) {
            alert('Please enter a valid phone number');
            return;
        }

        // Check for duplicate email
        if (this.contacts.some(contact => contact.email === email)) {
            alert('A contact with this email already exists');
            return;
        }

        const contact = {
            id: Date.now(),
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            state,
            zip,
            createdAt: new Date().toLocaleDateString()
        };

        this.contacts.push(contact);
        this.saveToLocalStorage();
        this.displayContacts();
        this.clearForm();
        this.showSuccessMessage('Contact added successfully!');
    }

    displayContacts() {
        const contactsList = document.getElementById('contactsList');
        const emptyState = document.getElementById('emptyState');
        const contactCount = document.getElementById('contactCount');

        if (this.contacts.length === 0) {
            contactsList.innerHTML = '';
            emptyState.style.display = 'block';
            contactCount.textContent = '0';
            return;
        }

        emptyState.style.display = 'none';
        contactCount.textContent = this.contacts.length;

        contactsList.innerHTML = this.contacts.map(contact => `
            <div class="contact-card">
                <div class="contact-header">
                    <h5 class="contact-name">${this.escapeHtml(contact.firstName)} ${this.escapeHtml(contact.lastName)}</h5>
                    <span class="badge bg-primary">${contact.id}</span>
                </div>
                
                <div class="contact-detail">
                    <i class="fas fa-envelope"></i>
                    <strong>Email:</strong> ${this.escapeHtml(contact.email)}
                </div>
                
                <div class="contact-detail">
                    <i class="fas fa-phone"></i>
                    <strong>Phone:</strong> ${this.escapeHtml(contact.phone)}
                </div>
                
                ${contact.address ? `
                    <div class="contact-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <strong>Address:</strong> ${this.escapeHtml(contact.address)}
                    </div>
                ` : ''}
                
                ${contact.city || contact.state || contact.zip ? `
                    <div class="contact-detail">
                        <i class="fas fa-city"></i>
                        <strong>Location:</strong> ${this.escapeHtml(contact.city)}${contact.city && (contact.state || contact.zip) ? ', ' : ''}${this.escapeHtml(contact.state)}${(contact.city || contact.state) && contact.zip ? ' ' : ''}${this.escapeHtml(contact.zip)}
                    </div>
                ` : ''}
                
                <div class="contact-actions">
                    <button class="btn btn-warning btn-sm" onclick="contactManager.openEditModal(${contact.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="contactManager.openDeleteModal(${contact.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    openEditModal(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (!contact) return;

        this.currentEditId = id;

        // Populate edit form
        document.getElementById('editFirstName').value = contact.firstName;
        document.getElementById('editLastName').value = contact.lastName;
        document.getElementById('editEmail').value = contact.email;
        document.getElementById('editPhone').value = contact.phone;
        document.getElementById('editAddress').value = contact.address;
        document.getElementById('editCity').value = contact.city;
        document.getElementById('editState').value = contact.state;
        document.getElementById('editZip').value = contact.zip;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
    }

    saveEdit() {
        const contact = this.contacts.find(c => c.id === this.currentEditId);
        if (!contact) return;

        const firstName = document.getElementById('editFirstName').value.trim();
        const lastName = document.getElementById('editLastName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const phone = document.getElementById('editPhone').value.trim();
        const address = document.getElementById('editAddress').value.trim();
        const city = document.getElementById('editCity').value.trim();
        const state = document.getElementById('editState').value.trim();
        const zip = document.getElementById('editZip').value.trim();

        // Validate email
        if (!this.validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Validate phone
        if (!this.validatePhone(phone)) {
            alert('Please enter a valid phone number');
            return;
        }

        // Check for duplicate email (excluding current contact)
        if (this.contacts.some(c => c.email === email && c.id !== this.currentEditId)) {
            alert('A contact with this email already exists');
            return;
        }

        // Update contact
        contact.firstName = firstName;
        contact.lastName = lastName;
        contact.email = email;
        contact.phone = phone;
        contact.address = address;
        contact.city = city;
        contact.state = state;
        contact.zip = zip;

        this.saveToLocalStorage();
        this.displayContacts();

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
        this.showSuccessMessage('Contact updated successfully!');
    }

    openDeleteModal(id) {
        this.currentDeleteId = id;
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    }

    deleteContact(id) {
        this.contacts = this.contacts.filter(c => c.id !== id);
        this.saveToLocalStorage();
        this.displayContacts();
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
        this.showSuccessMessage('Contact deleted successfully!');
    }

    searchContacts(query) {
        const searchTerm = query.toLowerCase();

        if (!searchTerm) {
            this.displayContacts();
            return;
        }

        const filtered = this.contacts.filter(contact => {
            return (
                contact.firstName.toLowerCase().includes(searchTerm) ||
                contact.lastName.toLowerCase().includes(searchTerm) ||
                contact.email.toLowerCase().includes(searchTerm) ||
                contact.phone.includes(searchTerm) ||
                contact.city.toLowerCase().includes(searchTerm)
            );
        });

        this.displaySearchResults(filtered);
    }

    displaySearchResults(filtered) {
        const contactsList = document.getElementById('contactsList');
        const emptyState = document.getElementById('emptyState');
        const contactCount = document.getElementById('contactCount');

        if (filtered.length === 0) {
            contactsList.innerHTML = '';
            emptyState.innerHTML = `
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <p class="text-muted">No contacts found matching your search.</p>
            `;
            emptyState.style.display = 'block';
            contactCount.textContent = '0';
            return;
        }

        emptyState.style.display = 'none';
        contactCount.textContent = filtered.length;

        contactsList.innerHTML = filtered.map(contact => `
            <div class="contact-card">
                <div class="contact-header">
                    <h5 class="contact-name">${this.escapeHtml(contact.firstName)} ${this.escapeHtml(contact.lastName)}</h5>
                    <span class="badge bg-primary">${contact.id}</span>
                </div>
                
                <div class="contact-detail">
                    <i class="fas fa-envelope"></i>
                    <strong>Email:</strong> ${this.escapeHtml(contact.email)}
                </div>
                
                <div class="contact-detail">
                    <i class="fas fa-phone"></i>
                    <strong>Phone:</strong> ${this.escapeHtml(contact.phone)}
                </div>
                
                ${contact.address ? `
                    <div class="contact-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <strong>Address:</strong> ${this.escapeHtml(contact.address)}
                    </div>
                ` : ''}
                
                ${contact.city || contact.state || contact.zip ? `
                    <div class="contact-detail">
                        <i class="fas fa-city"></i>
                        <strong>Location:</strong> ${this.escapeHtml(contact.city)}${contact.city && (contact.state || contact.zip) ? ', ' : ''}${this.escapeHtml(contact.state)}${(contact.city || contact.state) && contact.zip ? ' ' : ''}${this.escapeHtml(contact.zip)}
                    </div>
                ` : ''}
                
                <div class="contact-actions">
                    <button class="btn btn-warning btn-sm" onclick="contactManager.openEditModal(${contact.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="contactManager.openDeleteModal(${contact.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    cancelEdit() {
        this.currentEditId = null;
        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    }

    saveToLocalStorage() {
        localStorage.setItem('contacts', JSON.stringify(this.contacts));
    }

    clearForm() {
        document.getElementById('contactForm').reset();
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^[0-9+\-\s()]*$/;
        return phoneRegex.test(phone) && phone.length >= 10;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    showSuccessMessage(message) {
        // Create a temporary alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            <i class="fas fa-check-circle"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Insert at the top of container
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.contactManager = new ContactManager();
});
