document.addEventListener("DOMContentLoaded", async () => {
    // Load the navbar and sidebar, then attach scripts after it's loaded
    await loadComponent("/AdminPanel/navbars/navbar.html", "navbar-container");
    attachNavbarScripts(); // Now runs AFTER navbar is loaded

    highlightActivePage(); // Highlight the active page in the sidebar

    // Fetch and display instructor requests
    await fetchAndDisplayInstructorRequests();
    
    // Add event listeners for approve/reject buttons
    document.addEventListener("click", async (event) => {
        if (event.target.classList.contains("approve-button")) {
            const requestId = event.target.getAttribute("data-request-id");
            await handlePermissionChange(requestId, "approve");
        } else if (event.target.classList.contains("reject-button")) {
            const requestId = event.target.getAttribute("data-request-id");
            await handlePermissionChange(requestId, "reject");
        }
    });
});

// Function to load a component (navbar, sidebar, etc.)
async function loadComponent(url, containerId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${url}, status: ${response.status}`);
        }
        const data = await response.text();
        document.getElementById(containerId).innerHTML = data;
        
        return new Promise((resolve) => {
            setTimeout(resolve, 100); // Small delay to ensure DOM updates
            resolve();
        });

    } catch (error) {
        console.error(`Error loading ${url}:`, error);
    }
}

// Function to attach navbar and sidebar scripts
function attachNavbarScripts() {
    const sidenav = document.getElementById("mySidenav");
    const main = document.getElementById("main");
    const menuIcon = document.querySelector(".nav-left .nav-icon");

    if (!sidenav || !menuIcon) {
        console.error("❌ Navbar or Sidebar not loaded properly.");
        return;
    } else {
        console.log("✅ Navbar and Sidebar loaded successfully.");
    }

    menuIcon.addEventListener("click", () => {
        const isClosed = sidenav.classList.toggle("closed");
        main.classList.toggle("sidebar-closed", isClosed);
    });
}

// Function to highlight the active page in the sidebar
function highlightActivePage() {
    const links = document.querySelectorAll(".sidenav a");
    const currentPage = window.location.pathname.toLowerCase();

    links.forEach(link => {
        const linkPath = link.getAttribute("href").toLowerCase();
        console.log(`Checking: ${linkPath} against ${currentPage}`);

        if (currentPage.endsWith(linkPath)) { // Ensures exact match
            link.classList.add("active");
            console.log(`✅ Matched: ${linkPath}`);
        } else {
            link.classList.remove("active");
        }
    });
}

// Function to fetch instructor requests from the backend
async function fetchAndDisplayInstructorRequests() {
    try {
        const token = localStorage.getItem("token"); // Ensure token is declared
        if (!token) {
            alert("You are not logged in. Redirecting to login page...");
            window.location.href = "/AdminPanel/AuthPages/login.html";
            return;
        }

        const response = await fetch("https://localhost:5000/admin/main", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data, status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data);

        // Populate the table with the fetched data
        populateTable(data);
    } catch (error) {
        console.error("Error fetching instructor requests:", error);
        alert("Failed to fetch instructor requests. Please try again later.");
    }
}

// Function to populate the table with instructor requests
function populateTable(requests) {
    const tableBody = document.getElementById("course-table-body");
    tableBody.innerHTML = ""; // Clear existing rows

    requests.forEach(request => {
        const row = document.createElement("tr");

        // Add request ID
        const requestIdCell = document.createElement("td");
        requestIdCell.textContent = request.request_id;
        row.appendChild(requestIdCell);

        // Add name
        const nameCell = document.createElement("td");
        nameCell.textContent = request.name;
        row.appendChild(nameCell);

        // Add email
        const emailCell = document.createElement("td");
        emailCell.textContent = request.email;
        row.appendChild(emailCell);

        // Add created at
        const createdAtCell = document.createElement("td");
        createdAtCell.textContent = new Date(request.createdAt).toLocaleString();
        row.appendChild(createdAtCell);

        // Add status
        const statusCell = document.createElement("td");
        statusCell.textContent = request.status || "pending"; // Default to "pending"
        row.appendChild(statusCell);

        // Add permission buttons
        const permissionCell = document.createElement("td");
        const approveButton = document.createElement("button");
        approveButton.textContent = "Approve";
        approveButton.classList.add("approve-button");
        approveButton.setAttribute("data-request-id", request.request_id);

        const rejectButton = document.createElement("button");
        rejectButton.textContent = "Reject";
        rejectButton.classList.add("reject-button");
        rejectButton.setAttribute("data-request-id", request.request_id);

        permissionCell.appendChild(approveButton);
        permissionCell.appendChild(rejectButton);
        row.appendChild(permissionCell);

        // Add the row to the table
        tableBody.appendChild(row);
    });
}

// Function to handle permission changes (approve/reject)
async function handlePermissionChange(requestId, action) {
    try {
        const token = localStorage.getItem("token"); // Ensure token is declared
        if (!token) {
            alert("You are not logged in. Redirecting to login page...");
            window.location.href = "/AdminPanel/AuthPages/login.html";
            return;
        }

        const response = await fetch("https://localhost:5000/admin/main", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ requestId, action }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update request, status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Permission change response:", data);

        // Refresh the table after updating the request
        await fetchAndDisplayInstructorRequests();
    } catch (error) {
        console.error("Error updating instructor request:", error);
        alert("Failed to update instructor request. Please try again later.");
    }
}
