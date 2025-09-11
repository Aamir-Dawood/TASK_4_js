console.log("Script loaded");

document.getElementById("table-body").addEventListener("click", function (e) {
  const clickedElement = e.target;
  if (clickedElement.classList.contains("edit-btn")) {
    editRow(clickedElement);
  } else if (clickedElement.classList.contains("delete-btn")) {
    deleteRow(clickedElement);
  }
});

let rowToDelete = null;
let editingRow = null;
let rowCounter = 1;

// Generic function to show modal with dynamic content
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

// Show modal dialog for delete confirmation
function deleteRow(deleteButton) {
  const row = deleteButton.closest("tr");
  if (row) {
    rowToDelete = row;
    showModal({
      title: "Warning",
      messages: "Do you really want to delete the entry?",
      buttonText: "Delete",
      onButtonClick: function() {
        if (rowToDelete) rowToDelete.remove();
        rowToDelete = null;
      }
    });
  }
}

// Handle modal close (X button)
document.querySelector("#myModal .close-btn").addEventListener("click", function() {
  document.getElementById("myModal").style.display = "none";
  rowToDelete = null;
});

// Optional: close modal when clicking outside modal content
window.onclick = function(event) {
  const modal = document.getElementById("myModal");
  if (event.target === modal) {
    modal.style.display = "none";
    rowToDelete = null;
  }
};

// Function to put a row into edit mode
function editRow(editButton) {
  const row = editButton.closest("tr");
  const cells = row.querySelectorAll("td:not(:last-child)");
  const rowData = {
    EmpID: cells[0].textContent,
    Name: cells[1].textContent,
    DOB: cells[2].textContent,
    Age: cells[3].textContent,
    Course: cells[4].textContent,
    Sal: cells[5].textContent,
    rowId: row.getAttribute("data-rowid") || null
  };
  document.getElementById("EmpID").value = rowData.EmpID;
  document.getElementById("Name").value = rowData.Name;
  document.getElementById("DOB").value = rowData.DOB;
  document.getElementById("Age").value = rowData.Age;
  document.getElementById("course").value = rowData.Course;
  document.getElementById("Sal").value = rowData.Sal;
  editingRow = row;
}

// Function to calculate age from date of birth
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Format DOB for display
function formatDateBritish(dateStr) {
  if (!dateStr) return "";
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("en-GB"); // e.g., "31/12/2025"
}

function formSubmit(event) {
  event.preventDefault();
  const errmsg = [];

  // Gather form values
  const eEmpID = document.getElementById("EmpID").value;
  const eName = document.getElementById("Name").value;
  const eDOB = document.getElementById("DOB").value;
  let eAge = document.getElementById("Age").value;
  const ecourse = document.getElementById("course").value;
  const eSal = document.getElementById("Sal").value;

  if (!eEmpID) errmsg.push("Emp ID");
  if (!eName) errmsg.push("Name");
  if (!eDOB) {
    errmsg.push("DOB");
  } else {
    eAge = calculateAge(eDOB);
    if (eAge < 18) errmsg.push("Minimum age is 18");
    document.getElementById("Age").value = eAge;
  }
  if (!ecourse) errmsg.push("Course Name");
  if (!eSal) errmsg.push("sal");

  if (errmsg.length > 0) {
    showModal({
      title: "Validation Error",
      messages: errmsg,
      buttonText: "Close"
    });
    return;
  }

  // Prevent duplicate EmpID and redundant Name+DOB
  const tablebody = document.getElementById("table-body");
  const rows = tablebody.querySelectorAll("tr");
  let isDuplicateEmpID = false;
  let isRedundantNameDOB = false;
  rows.forEach(row => {
    // If editing, skip the current row being edited
    if (editingRow && row === editingRow) return;
    const cells = row.querySelectorAll("td");
    if (cells[0] && cells[0].textContent === eEmpID) {
      isDuplicateEmpID = true;
    }
    if (
      cells[1] && cells[1].textContent === eName &&
      cells[2] && cells[2].textContent === eDOB
    ) {
      isRedundantNameDOB = true;
    }
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

  if (editingRow) {
    const cells = editingRow.querySelectorAll("td:not(:last-child)");
    cells[0].textContent = eEmpID;
    cells[1].textContent = eName;
    cells[2].textContent = formattedDOB; // Use formatted date
    cells[3].textContent = eAge;
    cells[4].textContent = ecourse;
    cells[5].textContent = eSal;
    editingRow = null;
  } else {
    const newrow = document.createElement("tr");
    const rowId = rowCounter++;
    const rowData = {
      EmpID: eEmpID,
      Name: eName,
      DOB: formattedDOB, // Use formatted date
      Age: eAge,
      Course: ecourse,
      Sal: eSal,
      rowId: rowId
    };

    newrow.setAttribute("data-rowid", rowId);
    Object.keys(rowData).forEach((key) => {
      if (key !== "rowId") {
        const cell = document.createElement("td");
        cell.textContent = rowData[key];
        newrow.appendChild(cell);
      }
    });
    const actionCell = document.createElement("td");
    actionCell.innerHTML = `
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    `;
    newrow.appendChild(actionCell);
    tablebody.appendChild(newrow);
  }
}

document.getElementById("dataForm").addEventListener("submit", formSubmit);

// Add this outside formSubmit, after DOM is loaded
document.getElementById("rst").addEventListener("click", function() {
  document.getElementById("dataForm").reset();
  editingRow = null; // Cancel edit mode so the same row can't be resubmitted
});
