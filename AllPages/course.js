document.addEventListener("DOMContentLoaded", () => {
    loadCourses(); // Load courses when page loads
});

async function loadCourses(searchQuery = "") {
    try {
        const response = await fetch("/api/courses"); // Fetch courses from backend
        const courses = await response.json();

        const tbody = document.getElementById("course-table-body");
        tbody.innerHTML = ""; // Clear previous entries

        courses
            .filter(course =>
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .forEach(course => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${course.title}</td>
                    <td>${course.description}</td>
                    <td>${course.created_at}</td>
                    <td>${course.instructor}</td>
                    <td>
                        <button class="publish-button ${course.published ? "unpublished" : ""}" 
                            onclick="togglePublish(${course.id}, this)">
                            ${course.published ? "Unpublish" : "Publish"}
                        </button>
                    </td>
                `;

                tbody.appendChild(row);
            });
    } catch (error) {
        console.error("Error loading courses:", error);
    }
}

// Function to handle searching courses
function searchCourses() {
    const searchInput = document.getElementById("search-input").value;
    loadCourses(searchInput);
}

// Function to toggle publish status
async function togglePublish(courseId, button) {
    const isPublished = button.classList.contains("unpublished");
    const newStatus = !isPublished;

    try {
        const response = await fetch(`/api/courses/${courseId}/publish`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ published: newStatus })
        });

        if (response.ok) {
            button.classList.toggle("unpublished");
            button.textContent = newStatus ? "Unpublish" : "Publish";
        } else {
            console.error("Failed to update publish status");
        }
    } catch (error) {
        console.error("Error updating publish status:", error);
    }

}
document.addEventListener("DOMContentLoaded", () => {
    const courseTableBody = document.getElementById("course-table-body");

    

    function renderCourses() {
        courseTableBody.innerHTML = ""; // Clear existing content
        demoCourses.forEach(course => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${course.title}</td>
                <td>${course.description}</td>
                <td>${course.createdAt}</td>
                <td>${course.instructor}</td>
                <td>
                    <button class="publish-button ${course.published ? "" : "unpublished"}">
                        ${course.published ? "Published" : "Unpublished"}
                    </button>
                </td>
            `;

            courseTableBody.appendChild(row);
        });
    }

    renderCourses();
});

