/**
 * controller for eventExam.html
 */

/* initialize */
readEventList(["dateSearch"]);

/* main listener */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("selectAll").checked = false;
    if (role === "student") {
        window.location.href = "./";
    } else {
        document.getElementById("dateSearch").addEventListener("change", searchExamlist);
        document.getElementById("selectAll").addEventListener("change", selectAll);
        document.getElementById("sendEmail").addEventListener("click", sendAllEmail);
        document.getElementById("createPDF").addEventListener("click", createAllPDF);
    }
});

/**
 * search people with delay upon input
 */
function searchExamlist() {
    showMessage("info", "wird geladen", 2);
    const select = document.getElementById("dateSearch");
    let filter = "&date=" + select.value;
    const option = select.options[select.selectedIndex];
    let locked = option.getAttribute("data-locked");
    document.getElementById("email").innerText = option.getAttribute("data-supervisor")
    document.getElementById("sendEmail").disabled = locked === "true";
    document.getElementById("createPDF").disabled = locked === "true";
    readExamlist(filter).then(data => {
        showExamlist(data, locked === "true");
    }).catch(result => {

    });
}

/**
 * show the examlist in a table
 * @param data
 * @param locked
 */
function showExamlist(data, locked) {
    (async () => {
        let exists = false;
        while (!exists) {
            exists = document.readyState === "complete" && Object.keys(eventList).length !== 0;
            if (!exists) await new Promise(resolve => setTimeout(resolve, 100));
        }
        let rows = document.getElementById("examlist")
            .getElementsByTagName("tbody")[0];
        rows.innerHTML = "";
        if (data !== "[]") {
            data.sort(sortExams);
            let prevEmail = "";
            let count = 0;
            data.forEach(exam => {
                try {
                    let row = rows.insertRow(-1);
                    let cell = row.insertCell(-1);
                    let field = document.createElement("input");
                    field.type = "checkbox";
                    field.name = "selected";
                    field.classList = "form-check-input";
                    field.setAttribute("data-examUUID", exam.exam_uuid);
                    cell.appendChild(field);

                    cell = row.insertCell(-1);
                    if (exam.student.email !== prevEmail) {
                        prevEmail = exam.student.email;
                        count++;
                        cell.innerText = count;
                    }
                    cell = row.insertCell(-1);
                    field = document.createElement("input");
                    field.value = exam.room;
                    field.name = "room";
                    field.size = 10;
                    field.setAttribute("data-examUUID", exam.exam_uuid);
                    field.addEventListener("change", changeExam);
                    cell.appendChild(field);

                    cell = row.insertCell(-1);
                    let dropdown = document.createElement("select");
                    dropdown.setAttribute("data-examUUID", exam.exam_uuid);
                    dropdown.addEventListener("change", changeExam);
                    dropdown.classList = "form-select";
                    addOptions(dropdown);
                    dropdown.value = exam.status;
                    dropdown.name = "status";
                    cell.appendChild(dropdown);

                    cell = row.insertCell(-1);
                    cell.innerHTML = exam.student.firstname + " " + exam.student.lastname;
                    cell.innerHTML += "<br />" + exam.student.email;
                    cell = row.insertCell(-1);
                    cell.innerHTML = exam.teacher.firstname + " " + exam.teacher.lastname;
                    cell.innerHTML += "<br />" + exam.teacher.email;
                    cell = row.insertCell(-1);
                    cell.innerHTML = exam.cohort;
                    cell = row.insertCell(-1);
                    cell.innerHTML = exam.module + " / " + exam.exam_num;
                    cell = row.insertCell(-1);
                    cell.innerHTML = exam.duration;

                } catch (error) {
                    console.log("Error in exam with uuid: " + exam.exam_uuid);
                }
            });
            lockForm("filterForm", locked);
            showMessage("clear", "");
        } else {
            showMessage("warning", "Keine Prüfungen zu diesem Datum gefunden");
        }
    })();
}

/**
 * saves changes to an exam
 * @param event
 */
function changeExam(event) {
    showMessage("info", "wird gespeichert", 2);
    let examUUID = event.target.getAttribute('data-examUUID');
    let data = new URLSearchParams();
    data.set('exam_uuid', examUUID);
    let fieldname = event.target.name;
    data.set(fieldname, event.target.value);
    saveExam(data);
    showMessage("clear", "");
}

/**
 * adds options to the status dropdown
 * @param field  id of the element
 */
function addOptions(field) {
    let values = ["pendent", "offen", "abgegeben", "erhalten", "erledigt", "pnab", "geloescht"];
    values.forEach(element => {
        let option = document.createElement("option");
        option.value = element;
        option.innerHTML = element;
        field.appendChild(option);
    })
}


/**
 * compares to exams
 * @param examA
 * @param examB
 * @returns compare result
 */
function sortExams(examA, examB) {
    if (examA.room < examB.room) return -1;
    if (examA.room > examB.room) return 1;

    const compare = examA.student.lastname.toString().localeCompare(examB.student.lastname.toString());
    if (compare !== 0) return compare;
    return examA.student.firstname.localeCompare(examB.student.firstname);
}

/**
 * sends an email for all selected exams
 * @param event
 */
function sendAllEmail(event) {
    showMessage("info", "Sende Emails ...", 2);
    let data = new URLSearchParams();
    const boxes = document.querySelectorAll("input:checked");
    if (boxes.length > 0) {
        for (const box of boxes) {
            if (box.hasAttribute("data-examuuid")) {
                data.append("exam_uuid", box.getAttribute("data-examuuid"));
            }
        }
        fetch(API_URL + "/email", {
            method: "PUT",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Bearer " + readStorage("access")
            }, body: data
        }).then(function (response) {
            if (!response.ok) {
                console.log(response);
            } else return response;
        }).then(response => response.text()
        ).then(pdf_name => {
            showMessage("clear", "")
        }).catch(function (error) {
            console.log(error);
        });
    } else {
        showMessage("warning", "keine Prüfung ausgewählt");
    }
}

/**
 * creates a PDF for all selected exams
 * @param event
 */
function createAllPDF(event) {
    showMessage("info", "PDF wird erstellt ...", 2);
    let data = new URLSearchParams();
    const boxes = document.querySelectorAll("input:checked");
    if (boxes.length > 0) {
        for (const box of boxes) {
            let examUUID = box.getAttribute("data-examuuid");
            if (examUUID != null)
                data.append("exam_uuid", examUUID);
        }
        fetch(API_URL + "/print", {
            method: "PUT",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Bearer " + readStorage("access")
            }, body: data
        }).then(function (response) {
            if (!response.ok) {
                console.log(response);
            } else return response;
        }).then(response => response.text()
        ).then(pdf_name => {
            let url = "./output/" + pdf_name;
            window.open(url, "_blank");
            showMessage("clear", "")
        }).catch(function (error) {
            console.log(error);
        });
    } else {
        showMessage("warning", "keine Prüfung ausgewählt");
    }
}

/**
 * select all / no exams
 */
function selectAll() {
    const isChecked = document.getElementById("selectAll").checked;
    const checkboxes = document.querySelectorAll("[name='selected']");
    for (const box of checkboxes) {
        box.checked = isChecked;
    }
}