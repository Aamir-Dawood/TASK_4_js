console.log("Script loaded");

const dataForm = document.getElementById("dataForm");
const tableBody = document.getElementById("table-body");
const showFormBtn = document.getElementById("showFormBtn");
const resetBtn = document.getElementById("rst");
let rowToDelete = null;
let employees = [];
let currentPage = 1;
const rowsPerPage = 5;
let editingIndex = null;

// Modal utility
function showModal({ title, messages, buttonText, onButtonClick }) {
  const modal = document.getElementById("myModal");
  modal.style.display = "block";
  modal.querySelector("h2").textContent = title;
  modal.querySelector("p").innerHTML = Array.isArray(messages)
    ? messages.map(msg => `• ${msg}`).join("<br>")
    : messages;
  const modalBtn = modal.querySelector(".modal-content button");
  modalBtn.textContent = buttonText;
  modalBtn.onclick = function() {
    modal.style.display = "none";
    if (onButtonClick) onButtonClick();
  };
}

// Delete row with confirmation
function deleteRow(deleteButton) {
  const row = deleteButton.closest("tr");
  if (row) {
    const index = parseInt(row.getAttribute('data-index'));
    rowToDelete = index;
    showModal({
      title: "Warning",
      messages: "Do you really want to delete the entry?",
      buttonText: "Delete",
      onButtonClick: function() {
        if (rowToDelete !== null) {
          employees.splice(rowToDelete, 1);
          if (employees.length % rowsPerPage === 0 && currentPage > 1) currentPage--;
          renderTable();
          renderPagination();
        }
        rowToDelete = null;
      }
    });
  }
}

// Modal close handlers
document.querySelector("#myModal .close-btn").addEventListener("click", function() {
  document.getElementById("myModal").style.display = "none";
  rowToDelete = null;
});
window.onclick = function(event) {
  const modal = document.getElementById("myModal");
  if (event.target === modal) {
    modal.style.display = "none";
    rowToDelete = null;
  }
};

// Edit row
function editRow(editButton) {
  const row = editButton.closest("tr");
  const index = parseInt(row.getAttribute('data-index'));
  const emp = employees[index];
  document.getElementById("EmpID").value = emp.empID;
  document.getElementById("Name").value = emp.name;
  document.getElementById("DOB").value = emp.dob;
  document.getElementById("Age").value = emp.age;
  document.getElementById("course").value = emp.course;
  document.getElementById("Sal").value = emp.salary;
  editingIndex = index;
}

// Age calculation
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

// Format date for British locale
function formatDateBritish(dateStr) {
  if (!dateStr) return "";
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("en-GB");
}

// Form submit handler
function formSubmit(event) {
  event.preventDefault();
  const errmsg = [];

  // Gather form values
  const eEmpID = document.getElementById("EmpID").value.trim();
  const eName = document.getElementById("Name").value.trim();
  const eDOB = document.getElementById("DOB").value;
  const ecourse = document.getElementById("course").value;
  const eSal = document.getElementById("Sal").value.trim();

  // Validation
  if (!eEmpID) errmsg.push("Emp ID");
  if (!eName) errmsg.push("Name");
  let eAge = "";
  if (!eDOB) {
    errmsg.push("DOB");
  } else {
    eAge = calculateAge(eDOB);
    if (eAge < 18) errmsg.push("Minimum age is 18");
    document.getElementById("Age").value = eAge;
  }
  if (!ecourse) errmsg.push("Course Name");
  if (!eSal) errmsg.push("Salary");

  if (errmsg.length > 0) {
    showModal({
      title: "Validation Error",
      messages: errmsg,
      buttonText: "Close"
    });
    return;
  }

  // Duplicate checks
  let isDuplicateEmpID = false;
  let isRedundantNameDOB = false;
  employees.forEach((emp, index) => {
    if (editingIndex !== null && index === editingIndex) return;
    if (emp.empID === eEmpID) isDuplicateEmpID = true;
    if (emp.name === eName && emp.dob === eDOB) isRedundantNameDOB = true;
  });
  if (isDuplicateEmpID) {
    showModal({
      title: "Duplicate EmpID",
      messages: ["This EmpID already exists in the table."],
      buttonText: "Close"
    });
    return;
  }
  if (isRedundantNameDOB) {
    showModal({
      title: "Redundant Entry",
      messages: ["An entry with the same Name and DOB already exists."],
      buttonText: "Close"
    });
    return;
  }

  // Format DOB for display
  const formattedDOB = formatDateBritish(eDOB);

  if (editingIndex !== null) {
    employees[editingIndex] = {
      empID: eEmpID,
      name: eName,
      dob: eDOB,
      age: eAge,
      course: ecourse,
      salary: eSal
    };
    editingIndex = null;
  } else {
    employees.push({
      empID: eEmpID,
      name: eName,
      dob: eDOB,
      age: eAge,
      course: ecourse,
      salary: eSal
    });
  }
  renderTable();
  renderPagination();
  dataForm.reset();
}

// Render table for current page
function renderTable() {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = employees.slice(start, end);
  tableBody.innerHTML = '';
  pageData.forEach((emp, index) => {
    const row = document.createElement('tr');
    row.setAttribute('data-index', start + index);
    [emp.empID, emp.name, formatDateBritish(emp.dob), emp.age, emp.course, emp.salary].forEach(val => {
      const cell = document.createElement('td');
      cell.textContent = val;
      row.appendChild(cell);
    });
    const actionCell = document.createElement('td');
    actionCell.className = 'action-buttons';
    actionCell.innerHTML = `<button class="edit-btn">Edit</button><button class="delete-btn">Delete</button>`;
    row.appendChild(actionCell);
    tableBody.appendChild(row);
  });
}

// Render pagination controls
function renderPagination() {
  const totalPages = Math.ceil(employees.length / rowsPerPage);
  const pagination = document.getElementById('pagination-controls');
  pagination.innerHTML = '';
  if (totalPages <= 1) return;

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Previous';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => { currentPage--; renderTable(); renderPagination(); };
  pagination.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.classList.toggle('active', i === currentPage);
    btn.onclick = () => { currentPage = i; renderTable(); renderPagination(); };
    pagination.appendChild(btn);
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => { currentPage++; renderTable(); renderPagination(); };
  pagination.appendChild(nextBtn);
}

// Table row action handler
tableBody.addEventListener("click", function (e) {
  const clickedElement = e.target;
  if (clickedElement.classList.contains("edit-btn")) {
    editRow(clickedElement);
  } else if (clickedElement.classList.contains("delete-btn")) {
    deleteRow(clickedElement);
  }
});


// Form show/hide with turn transition
// Form show/hide with turn transition and table movement
function hideForm() {
    const formContainer = document.querySelector('.form-container');
    const tableContainer = document.querySelector('.table-container');
    
    dataForm.classList.add('hidden');
    dataForm.classList.remove('visible');
    
    // Collapse form container after form animation
    setTimeout(() => {
        formContainer.classList.add('collapsed');
        tableContainer.classList.add('raised');
    }, 200); // Halfway through form animation
}

function showForm() {
    const formContainer = document.querySelector('.form-container');
    const tableContainer = document.querySelector('.table-container');
    
    // Expand form container first
    formContainer.classList.remove('collapsed');
    tableContainer.classList.remove('raised');
    
    // Then show form after a short delay
    setTimeout(() => {
        dataForm.classList.remove('hidden');
        dataForm.classList.add('visible');
        tableContainer.classList.remove('raised');
    }, 50);
}

showFormBtn.addEventListener("click", () => {
    if (dataForm.classList.contains('hidden') || getComputedStyle(dataForm).opacity === '0') {
        showForm();
        showFormBtn.textContent = "Hide Employee Form";
    } else {
        hideForm();
        showFormBtn.textContent = "Show Employee Form";
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const formContainer = document.querySelector('.form-container');
    const tableContainer = document.querySelector('.table-container');

    dataForm.classList.add('hidden');
   setTimeout(() => {
        formContainer.classList.add('collapsed');
        tableContainer.classList.add('raised');
    }, 10);
    renderTable();
    renderPagination();
});

// Form submit event
dataForm.addEventListener("submit", formSubmit);

// Reset button handler
resetBtn.addEventListener("click", function() {
  dataForm.reset();
  editingIndex = null;
});
