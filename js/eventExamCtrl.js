/**
 * controller for eventExam.html
 */

/* initialize */
let eventList = {};
readEventList()
    .then(data => setEventList(data))
    .catch(result => {
        showMessage("danger", "Es ist ein Fehler aufgetreten");
    });

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
    clearTimeout(delayTimer);
    delayTimer = setTimeout(() => {
        let filter = "&date=" + document.getElementById("dateSearch").value;
        readExamlist(filter).then(data => {
            showExamlist(data);
        }).catch(result => {

        });
    }, 500);
}

/**
 * show the examlist in a table
 * @param data
 */
function showExamlist(data) {
    (async () => {
        let exists = false;
        while (!exists) {
            exists = document.readyState === "complete" && Object.keys(eventList).length !== 0;
            if (!exists) await new Promise(resolve => setTimeout(resolve, 100));
        }

        data.sort(sortExams);
        let rows = document.getElementById("examlist")
            .getElementsByTagName("tbody")[0];
        rows.innerHTML = "";
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
                field = document.createElement("input");
                field.value = exam.room;
                field.size = 10;
                field.setAttribute("data-examUUID", exam.exam_uuid);
                field.addEventListener("change", saveExam);
                cell.appendChild(field);

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
                cell = row.insertCell(-1);
                cell.innerHTML = exam.status;
            } catch (error) {
                console.log("Error in exam with uuid: " + exam.exam_uuid);
            }
        });
        showMessage("clear", "");
    })();
}

/**
 * saves the events as an array
 * @param data
 */
function setEventList(data) {
    (async () => {
        let exists = false;
        while (!exists) {
            exists = document.readyState === "complete";
            if (!exists) await new Promise(resolve => setTimeout(resolve, 100));
        }

        let dateSearch = document.getElementById("dateSearch");
        data.forEach(event => {
            key = event.event_uuid;
            eventList[key] = event;

            let option = document.createElement("option");
            option.value = event.event_uuid;
            option.text = event.datetime;
            dateSearch.appendChild(option);
        });
    })();
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
 * saves the changes to the exam
 * @param event
 */
function saveExam(event) {
    const button = event.target;
    const uuid = button.getAttribute("data-examUUID");
    const room = button.value;
    const url = API_URL + "/exam";
    let data = new URLSearchParams();
    data.set("exam_uuid", uuid);
    data.set("room", room);

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + readStorage("token")
        }, body: data
    }).then(function (response) {
        if (!response.ok) {
            console.log(response);
        } else return response;
    }).then(() => {
        showMessage("info", "Gespeichert")
    }).catch(function (error) {
        console.log(error);
    });

}

/**
 * sends an email for all selected exams
 * @param event
 */
function sendAllEmail(event) {
showMessage("info", "Sende Emails ...")
    let data = new URLSearchParams();
    const boxes = document.querySelectorAll("input:checked");
    if (boxes.length > 0) {
        for (const box of boxes) {
            data.append("exam_uuid", box.getAttribute("data-examuuid"));
        }
        fetch(API_URL + "/email", {
            method: "PUT",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Bearer " + readStorage("token")
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
    showMessage("info", "PDF wird erstellt ...")
    let data = new URLSearchParams();
    const boxes = document.querySelectorAll("input:checked");
    if (boxes.length > 0) {
        for (const box of boxes) {
            data.append("exam_uuid", box.getAttribute("data-examuuid"));
        }
        fetch(API_URL + "/print", {
            method: "PUT",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Bearer " + readStorage("token")
            }, body: data
        }).then(function (response) {
            if (!response.ok) {
                console.log(response);
            } else return response;
        }).then(response => response.text()
        ).then(pdf_name => {
            let url = API_URL + "/output/" + pdf_name;
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