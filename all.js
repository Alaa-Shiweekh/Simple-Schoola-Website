document.addEventListener('DOMContentLoaded', () => {
    let students = JSON.parse(localStorage.getItem("students")) || [];

    function saveStudents() {
        localStorage.setItem("students", JSON.stringify(students));
    }

    function updateStudents() {
        let tableBody = document.querySelector("#studentTable tbody");
        let searchInput = document.getElementById("search").value.toLowerCase();
        let departmentFilter = document.getElementById("departmentFilter").value;
        let sortCriteria = document.getElementById("sort")?.value || "";

        let filteredStudents = students.filter(student =>
            student.name.toLowerCase().includes(searchInput) &&
            (departmentFilter === "All" || student.department === departmentFilter)
        );

        if (sortCriteria) {
            filteredStudents.sort((a, b) =>
                a[sortCriteria].toString().localeCompare(b[sortCriteria].toString(), undefined, { numeric: true })
            );
        }

        tableBody.innerHTML = "";
        filteredStudents.forEach((student, index) => {
            let row = tableBody.insertRow();
            row.insertCell().textContent = student.name;
            row.insertCell().textContent = student.age;
            row.insertCell().textContent = student.gender;
            row.insertCell().textContent = student.department;
            row.insertCell().textContent = student.grade;
            let removeCell = row.insertCell();
            let removeButton = document.createElement("button");
            removeButton.textContent = "Delete";
            removeButton.addEventListener("click", () => {
                students.splice(index, 1);
                saveStudents();
                updateStudents();
            });
            removeCell.appendChild(removeButton);
        });
    }

    if (document.getElementById("studentForm")) {
        document.getElementById("studentForm").addEventListener("submit", (event) => {
            event.preventDefault();
            let name = document.getElementById("name").value;
            let age = document.getElementById("age").value;
            let gender = document.querySelector('input[name="gender"]:checked')?.value;
            let department = document.getElementById("dep").value;
            let grade = document.getElementById("grade").value;

            if (gender) {
                students.push({ name, age, gender, department, grade });
                saveStudents();
                document.getElementById("studentForm").reset();
            } else {
                alert("Please select a gender.");
            }
        });
    }

    if (document.getElementById("search") && document.getElementById("departmentFilter")) {
        document.getElementById("search").addEventListener("input", updateStudents);
        document.getElementById("departmentFilter").addEventListener("change", updateStudents);
        document.getElementById("sort")?.addEventListener("change", updateStudents);
        updateStudents();
    }
});
