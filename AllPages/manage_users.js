document.addEventListener("DOMContentLoaded", async () => {
    // Load navbar and sidebar
    await loadComponent("/AdminPanel/navbars/navbar.html", "navbar-container");
    attachNavbarScripts();
    highlightActivePage();

    // Fetch and display users
    await fetchAndDisplayUsers();

    // Search functionality
    document.querySelector(".search-container button").addEventListener("click", searchUsers);

    // Handle delete user event
    document.addEventListener("click", async (event) => {
        if (event.target.classList.contains("delete-button")) {
            const userId = event.target.getAttribute("data-user-id");
            await deleteUser(userId);
        }
    });
});

// Function to load components (navbar, sidebar)
async function loadComponent(url, containerId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}, status: ${response.status}`);
        document.getElementById(containerId).innerHTML = await response.text();
    } catch (error) {
        console.error(`Error loading ${url}:`, error);
    }
}

// Function to attach navbar scripts
function attachNavbarScripts() {
    const sidenav = document.getElementById("mySidenav");
    const main = document.getElementById("main");
    const menuIcon = document.querySelector(".nav-left .nav-icon");

    if (!sidenav || !menuIcon) {
        console.error("❌ Navbar or Sidebar not loaded properly.");
        return;
    }
    console.log("✅ Navbar and Sidebar loaded successfully.");

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
        if (currentPage.includes(link.getAttribute("href").toLowerCase())) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

// Fetch all users and populate the table
async function fetchAndDisplayUsers() {
    try {
        /*const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not logged in. Redirecting to login page...");
            window.location.href = "/AdminPanel/AuthPages/login.html";
            return;
        }*/

        const response = await fetch("https://localhost:5000/admin/users/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error(`Failed to fetch users, status: ${response.status}`);

        const data = await response.json();
        console.log("Fetched users:", data);
        populateUserTable(data.data);
    } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users. Please try again later.");
    }
}

// Populate the table with user data
function populateUserTable(users) {
    const tableBody = document.getElementById("course-table-body");
    tableBody.innerHTML = ""; // Clear existing rows

    users.forEach(user => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${user.user_id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${new Date(user.created_at).toLocaleString()}</td>
            <td>${user.role}</td>
            <td>
                <button class="delete-button" data-user-id="${user.user_id}">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Search users by name or user ID
function searchUsers() {
    const searchTerm = document.querySelector(".search-container input").value.toLowerCase();
    const rows = document.querySelectorAll("#course-table-body tr");

    rows.forEach(row => {
        const userId = row.cells[0].textContent.toLowerCase();
        const name = row.cells[1].textContent.toLowerCase();
        row.style.display = userId.includes(searchTerm) || name.includes(searchTerm) ? "" : "none";
    });
}

// Delete a user
async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
        /*const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not logged in. Redirecting to login page...");
            window.location.href = "/AdminPanel/AuthPages/login.html";
            return;
        }*/

        const response = await fetch("https://localhost:5000/admin/users/", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ user_id: userId }),
        });

        if (!response.ok) throw new Error(`Failed to delete user, status: ${response.status}`);

        const data = await response.json();
        console.log("User deleted:", data);
        alert("User deleted successfully!");

        // Refresh the user table
        await fetchAndDisplayUsers();
    } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again later.");
    }
}
