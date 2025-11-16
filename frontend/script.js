const API_BASE = "http://127.0.0.1:8000/employees";

/* --------------------------------------------------------------
   INIT - runs on page load
--------------------------------------------------------------*/
function init() {
    // show the view section by default and preload data
    showSection('viewSection');
    loadEmployees();

    // focus header search
    const hdrSearch = document.getElementById('searchBoxHeader');
    if (hdrSearch) {
        hdrSearch.addEventListener('keydown', (e) => { if (e.key === 'Enter') headerQuickSearch(); });
    }

    const mainSearch = document.getElementById('searchBox');
    if (mainSearch) {
        mainSearch.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchEmployee(); });
        mainSearch.focus();
    }
}

/* --------------------------------------------------------------
   SHOW / HIDE SECTIONS
--------------------------------------------------------------*/
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
    document.getElementById(sectionId).style.display = "block";
}

/* --------------------------------------------------------------
   QUICK SEARCH (header)
--------------------------------------------------------------*/
function headerQuickSearch() {
    const q = document.getElementById('searchBoxHeader').value.trim();
    if (!q) {
        // if empty, show full database view
        showSection('viewSection');
        loadEmployees();
        return;
    }

    // copy query to main search and run it
    const main = document.getElementById('searchBox');
    if (main) main.value = q;
    searchEmployee();
    showSection('viewSection');
}

/* --------------------------------------------------------------
   CREATE EMPLOYEE
--------------------------------------------------------------*/
async function saveEmployee() {
    const name = document.getElementById("empName").value.trim();
    const role = document.getElementById("role").value.trim();
    const address = document.getElementById("address").value.trim();
    const tech_stack = document.getElementById("tech").value.trim();
    const experience = Number(document.getElementById("experience").value || 0);
    const joiningValue = document.getElementById("joining").value;

    let year_of_joining = null;
    if (joiningValue) {
        const [y, m, d] = joiningValue.split("-");
        year_of_joining = `${d}-${m}-${y}`;
    }

    if (!name || !role || !tech_stack) {
        alert("Please fill all required fields!");
        return;
    }

    const employee = {
        name,
        role,
        address,
        tech_stack,
        experience,
        year_of_joining,
        resignation_date: null
    };

    try {
        const res = await fetch(`${API_BASE}/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employee)
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Saving failed");
        }

        alert("Employee added successfully!");
        // switch to database view and refresh
        showSection('viewSection');
        loadEmployees();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

/* --------------------------------------------------------------
   LOAD EMPLOYEES
--------------------------------------------------------------*/
async function loadEmployees() {
    try {
        const res = await fetch(`${API_BASE}/`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        const list = document.getElementById("employeeList");
        list.innerHTML = "";

        if (!data || data.length === 0) {
            list.innerHTML = "<li>No employees found. Add new employees using 'Add Employee'.</li>";
            return;
        }

        data.forEach(emp => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${emp.name}</strong> — <em>${emp.role}</em><br>
                ${emp.tech_stack} — ${emp.experience} years<br>
                ${emp.address ? `Address: ${emp.address}<br>` : ''}
                Joined: ${emp.year_of_joining || 'N/A'}<br>
                <small>ID: ${emp.id}</small>
            `;
            list.appendChild(li);
        });

    } catch (err) {
        const list = document.getElementById("employeeList");
        if (list) list.innerHTML = "<li>Unable to load employees. Is the backend running?</li>";
        console.error(err);
    }
}

/* --------------------------------------------------------------
   UPDATE EMPLOYEE
--------------------------------------------------------------*/
async function updateEmployee() {
    const empId = Number(document.getElementById("updateId").value);
    if (!empId) return alert("Employee ID required");

    const name = document.getElementById("updateName").value.trim();
    const role = document.getElementById("updateRole").value.trim();
    const address = document.getElementById("updateAddress").value.trim();
    const tech = document.getElementById("updateTech").value.trim();
    const exp = document.getElementById("updateExperience").value.trim();

    const payload = {};

    if (name) payload.name = name;
    if (role) payload.role = role;
    if (address) payload.address = address;
    if (tech) payload.tech_stack = tech;
    if (exp) payload.experience = Number(exp);

    if (Object.keys(payload).length === 0) {
        alert("Enter at least one field to update");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/${empId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Update failed");
        }

        alert(`Employee #${empId} updated successfully`);
        document.getElementById("updateId").value = "";
        document.getElementById("updateName").value = "";
        document.getElementById("updateRole").value = "";
        document.getElementById("updateAddress").value = "";
        document.getElementById("updateTech").value = "";
        document.getElementById("updateExperience").value = "";
        // refresh list
        showSection('viewSection');
        loadEmployees();

    } catch (err) {
        alert("Error updating employee: " + err.message);
    }
}

/* --------------------------------------------------------------
   DELETE EMPLOYEE
--------------------------------------------------------------*/
async function deleteEmployee() {
    const empId = Number(document.getElementById("deleteId").value);
    if (!empId) return alert("Enter Employee ID");

    if (!confirm(`Delete employee #${empId}? This action cannot be undone.`)) return;

    try {
        const res = await fetch(`${API_BASE}/${empId}`, { method: "DELETE" });
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Delete failed");
        }

        alert("Employee deleted");
        showSection('viewSection');
        loadEmployees();
    } catch (err) {
        alert("Error deleting employee: " + err.message);
    }
}

/* --------------------------------------------------------------
   SEARCH EMPLOYEE BY NAME
--------------------------------------------------------------*/
async function searchEmployee() {
    const query = document.getElementById("searchBox").value.trim();
    if (!query) {
        alert("Enter a name to search");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/search?name=${encodeURIComponent(query)}`);
        if (!res.ok) {
            if (res.status === 404) {
                document.getElementById("searchResults").innerHTML = `<div class="result-card">No employee found for "${query}".</div>`;
                return;
            }
            throw new Error("Search failed");
        }

        const data = await res.json();

        const results = document.getElementById("searchResults");
        results.innerHTML = "";

        if (!data || data.length === 0) {
            results.innerHTML = `<div class="result-card">No results for "${query}".</div>`;
            return;
        }

        data.forEach(emp => {
            const card = document.createElement("div");
            card.className = "result-card";
            card.innerHTML = `
                <h3>${emp.name}</h3>
                <p><b>Role:</b> ${emp.role || '—'}</p>
                <p><b>Tech Stack:</b> ${emp.tech_stack || '—'}</p>
                <p><b>Experience:</b> ${emp.experience ?? '—'} years</p>
                <p><b>Address:</b> ${emp.address || '—'}</p>
                <p><b>Joined:</b> ${emp.year_of_joining || '—'}</p>
                <small>ID: ${emp.id}</small>
            `;
            results.appendChild(card);
        });

    } catch (err) {
        document.getElementById("searchResults").innerHTML = `<div class="result-card">Search error: ${err.message}</div>`;
        console.error(err);
    }
}

/* --------------------------------------------------------------
   CLEAR SEARCH
--------------------------------------------------------------*/
function clearSearch() {
    const s = document.getElementById('searchBox');
    if (s) s.value = '';
    document.getElementById('searchResults').innerHTML = '';
    loadEmployees();
}
