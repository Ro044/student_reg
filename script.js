/* ============================================================
   Student Registration System - JavaScript (Task 6)
   Features:
     • Add new student records
     • Edit existing records
     • Delete records (with confirmation)
     • Persist data via localStorage (survives page refresh)
     • Field validation (name, ID, email, contact)
     • Prevents empty rows / duplicate Student IDs
     • Dynamic vertical scrollbar (toggled by JS)
   ============================================================ */

(function () {
    'use strict';

    /* ---------- State ---------- */
    let students = [];
    let editMode = false;
    let editStudentId = null;          // Student ID currently being edited

    const STORAGE_KEY = 'studentRegistry';
    const SCROLL_ROW_THRESHOLD = 5;    // Show scrollbar after this many rows
    const TABLE_MAX_HEIGHT = 420;      // px

    /* ---------- DOM References ---------- */
    const form          = document.getElementById('studentForm');
    const nameInput     = document.getElementById('studentName');
    const idInput       = document.getElementById('studentId');
    const emailInput    = document.getElementById('emailId');
    const contactInput  = document.getElementById('contactNo');

    const addBtn        = document.getElementById('addBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const resetBtn      = document.getElementById('resetBtn');

    const tableBody     = document.getElementById('tableBody');
    const studentTable  = document.getElementById('studentTable');
    const tableWrapper  = document.querySelector('.table-wrapper');
    const studentCount  = document.getElementById('studentCount');

    const nameError     = document.getElementById('nameError');
    const idError       = document.getElementById('idError');
    const emailError    = document.getElementById('emailError');
    const contactError  = document.getElementById('contactError');

    /* ---------- Validation Rules ---------- */
    const NAME_REGEX    = /^[A-Za-z\s]+$/;
    const ID_REGEX      = /^\d+$/;
    const EMAIL_REGEX   = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    const CONTACT_REGEX = /^\d{10,}$/;

    function validateName(v)    { return v.trim() !== '' && NAME_REGEX.test(v.trim()); }
    function validateId(v)      { return v.trim() !== '' && ID_REGEX.test(v.trim()); }
    function validateEmail(v)   { return v.trim() !== '' && EMAIL_REGEX.test(v.trim()); }
    function validateContact(v) { return v.trim() !== '' && CONTACT_REGEX.test(v.trim()); }

    /* ---------- Error Display Helpers ---------- */
    function setFieldValidity(input, errorEl, isValid, message) {
        if (isValid) {
            input.classList.remove('invalid');
            errorEl.classList.remove('show');
        } else {
            input.classList.add('invalid');
            if (message) errorEl.innerText = message;
            errorEl.classList.add('show');
        }
    }

    function clearAllErrors() {
        [nameInput, idInput, emailInput, contactInput].forEach(i => i.classList.remove('invalid'));
        [nameError, idError, emailError, contactError].forEach(e => e.classList.remove('show'));
        idError.innerText   = 'Student ID must contain numbers only.';
        nameError.innerText = 'Only letters and spaces are allowed.';
    }

    /* ---------- localStorage Helpers ---------- */
    function loadFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            students = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            students = [];
        }
    }

    function saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    }

    /* ---------- XSS-safe text escape ---------- */
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, function (m) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[m];
        });
    }

    /* ---------- Render Table ---------- */
    function renderTable() {
        if (students.length === 0) {
            tableBody.innerHTML =
                '<tr class="empty-row"><td colspan="5">No students registered yet. Add your first student!</td></tr>';
            studentCount.innerText = '0 records';
            updateScrollbar();
            return;
        }

        let rowsHtml = '';
        students.forEach(function (student) {
            rowsHtml +=
                '<tr data-id="' + escapeHtml(student.id) + '">' +
                    '<td>' + escapeHtml(student.name)    + '</td>' +
                    '<td>' + escapeHtml(student.id)      + '</td>' +
                    '<td>' + escapeHtml(student.email)   + '</td>' +
                    '<td>' + escapeHtml(student.contact) + '</td>' +
                    '<td class="action-btns">' +
                        '<button class="edit-btn"   data-id="' + escapeHtml(student.id) + '">Edit</button>' +
                        '<button class="delete-btn" data-id="' + escapeHtml(student.id) + '">Delete</button>' +
                    '</td>' +
                '</tr>';
        });
        tableBody.innerHTML = rowsHtml;

        const count = students.length;
        studentCount.innerText = count + ' record' + (count !== 1 ? 's' : '');

        updateScrollbar();
    }

    /* ---------- Dynamic Scrollbar ----------
       Adds vertical scrollbar only when row count exceeds threshold
       OR table content overflows the configured max height.
    ------------------------------------------ */
    function updateScrollbar() {
        if (!tableWrapper) return;

        const needsScroll =
            students.length > SCROLL_ROW_THRESHOLD ||
            studentTable.offsetHeight > TABLE_MAX_HEIGHT;

        if (needsScroll) {
            tableWrapper.style.maxHeight = TABLE_MAX_HEIGHT + 'px';
            tableWrapper.classList.add('scrollable');
        } else {
            tableWrapper.style.maxHeight = 'none';
            tableWrapper.classList.remove('scrollable');
        }
    }

    /* ---------- Duplicate ID Check ---------- */
    function isDuplicateId(id, ignoreId) {
        return students.some(function (s) {
            return s.id === id && s.id !== ignoreId;
        });
    }

    /* ---------- Add / Update Student ---------- */
    function handleSubmit(event) {
        event.preventDefault();

        const name    = nameInput.value.trim();
        const id      = idInput.value.trim();
        const email   = emailInput.value.trim();
        const contact = contactInput.value.trim();

        // Empty-row check (covers all four fields at once)
        if (!name && !id && !email && !contact) {
            alert('Cannot add an empty row. Please fill in the form.');
            return;
        }

        // Per-field validation
        const nameOk    = validateName(name);
        const idOk      = validateId(id);
        const emailOk   = validateEmail(email);
        const contactOk = validateContact(contact);

        setFieldValidity(nameInput,    nameError,    nameOk);
        setFieldValidity(idInput,      idError,      idOk);
        setFieldValidity(emailInput,   emailError,   emailOk);
        setFieldValidity(contactInput, contactError, contactOk);

        if (!(nameOk && idOk && emailOk && contactOk)) {
            alert('Please fix the highlighted errors before submitting.');
            return;
        }

        // Duplicate Student ID check
        const ignoreId = editMode ? editStudentId : null;
        if (isDuplicateId(id, ignoreId)) {
            setFieldValidity(idInput, idError, false, 'A student with this ID already exists.');
            alert('Student ID "' + id + '" already exists. Please use a unique ID.');
            return;
        }

        const studentRecord = { name: name, id: id, email: email, contact: contact };

        if (editMode) {
            const index = students.findIndex(function (s) { return s.id === editStudentId; });
            if (index !== -1) students[index] = studentRecord;
            exitEditMode();
        } else {
            students.push(studentRecord);
        }

        saveToStorage();
        renderTable();
        form.reset();
        clearAllErrors();
    }

    /* ---------- Edit ---------- */
    function startEdit(studentId) {
        const student = students.find(function (s) { return s.id === studentId; });
        if (!student) return;

        nameInput.value    = student.name;
        idInput.value      = student.id;
        emailInput.value   = student.email;
        contactInput.value = student.contact;

        editMode = true;
        editStudentId = student.id;
        addBtn.innerText = 'Update Student';
        cancelEditBtn.style.display = 'inline-block';
        clearAllErrors();
        nameInput.focus();
    }

    function exitEditMode() {
        editMode = false;
        editStudentId = null;
        addBtn.innerText = 'Add Student';
        cancelEditBtn.style.display = 'none';
    }

    /* ---------- Delete ---------- */
    function deleteStudent(studentId) {
        const student = students.find(function (s) { return s.id === studentId; });
        if (!student) return;

        const confirmed = confirm('Delete student "' + student.name + '" (ID: ' + studentId + ')?');
        if (!confirmed) return;

        students = students.filter(function (s) { return s.id !== studentId; });
        saveToStorage();
        renderTable();

        if (editMode && editStudentId === studentId) {
            form.reset();
            exitEditMode();
            clearAllErrors();
        }
    }

    /* ---------- Event Listeners ---------- */
    form.addEventListener('submit', handleSubmit);

    cancelEditBtn.addEventListener('click', function () {
        form.reset();
        exitEditMode();
        clearAllErrors();
    });

    resetBtn.addEventListener('click', function () {
        clearAllErrors();
        if (editMode) exitEditMode();
    });

    // Event delegation for Edit/Delete buttons (works for dynamically rendered rows)
    studentTable.addEventListener('click', function (event) {
        const target = event.target;
        const id = target.getAttribute('data-id');
        if (!id) return;

        if (target.classList.contains('edit-btn')) {
            startEdit(id);
        } else if (target.classList.contains('delete-btn')) {
            deleteStudent(id);
        }
    });

    /* ---------- Live Inline Validation ---------- */
    nameInput.addEventListener('input', function () {
        setFieldValidity(nameInput, nameError, validateName(nameInput.value));
    });
    idInput.addEventListener('input', function () {
        setFieldValidity(idInput, idError, validateId(idInput.value),
                         'Student ID must contain numbers only.');
    });
    emailInput.addEventListener('input', function () {
        setFieldValidity(emailInput, emailError, validateEmail(emailInput.value));
    });
    contactInput.addEventListener('input', function () {
        setFieldValidity(contactInput, contactError, validateContact(contactInput.value));
    });

    // Recompute scrollbar on window resize (responsive support)
    window.addEventListener('resize', updateScrollbar);

    /* ---------- Init ---------- */
    function init() {
        loadFromStorage();
        renderTable();
    }

    init();
})();
