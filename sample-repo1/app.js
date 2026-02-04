(function(){
  const LS_KEY = 'contacts_v1';
  let contacts = [];
  let bsModal;

  function qs(id){ return document.getElementById(id); }

  function loadContacts(){
    try{
      contacts = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    }catch(e){ contacts = []; }
  }

  function saveContacts(){
    localStorage.setItem(LS_KEY, JSON.stringify(contacts));
  }

  function render(){
    const tbody = qs('contactsTbody');
    tbody.innerHTML = '';
    if(!contacts || contacts.length === 0){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="empty-row" colspan="5">No contacts yet — click "Add Contact" to create one.</td>`;
      tbody.appendChild(tr);
      return;
    }

    contacts.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.email || '')}</td>
        <td>${escapeHtml(c.phone || '')}</td>
        <td>${escapeHtml(c.company || '')}</td>
        <td class="text-end action-btns">
          <button class="btn btn-sm btn-outline-secondary" data-action="edit" data-id="${c.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${c.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(str){
    return String(str || '').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; });
  }

  function openAdd(){
    qs('modalTitle').textContent = 'Add Contact';
    qs('contactId').value = '';
    qs('name').value = '';
    qs('email').value = '';
    qs('phone').value = '';
    qs('company').value = '';
    bsModal.show();
  }

  function openEdit(id){
    const c = contacts.find(x=>x.id === id);
    if(!c) return;
    qs('modalTitle').textContent = 'Edit Contact';
    qs('contactId').value = c.id;
    qs('name').value = c.name;
    qs('email').value = c.email || '';
    qs('phone').value = c.phone || '';
    qs('company').value = c.company || '';
    bsModal.show();
  }

  function deleteContact(id){
    if(!confirm('Delete this contact?')) return;
    contacts = contacts.filter(c=>c.id !== id);
    saveContacts();
    render();
  }

  function onFormSubmit(e){
    e.preventDefault();
    const id = qs('contactId').value;
    const name = qs('name').value.trim();
    if(!name){ qs('name').focus(); return; }
    const email = qs('email').value.trim();
    const phone = qs('phone').value.trim();
    const company = qs('company').value.trim();

    if(id){
      const idx = contacts.findIndex(c=>c.id === id);
      if(idx !== -1){
        contacts[idx].name = name;
        contacts[idx].email = email;
        contacts[idx].phone = phone;
        contacts[idx].company = company;
      }
    } else {
      const newContact = { id: String(Date.now()), name, email, phone, company };
      contacts.push(newContact);
    }

    saveContacts();
    render();
    bsModal.hide();
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    loadContacts();
    render();

    bsModal = new bootstrap.Modal(document.getElementById('contactModal'));

    qs('addContactBtn').addEventListener('click', openAdd);
    qs('contactForm').addEventListener('submit', onFormSubmit);

    qs('contactsTbody').addEventListener('click', function(e){
      const btn = e.target.closest('button');
      if(!btn) return;
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      if(action === 'edit') openEdit(id);
      if(action === 'delete') deleteContact(id);
    });
  });
})();
