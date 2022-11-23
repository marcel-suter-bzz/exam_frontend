/**
 * controller for examlist
 */

/* initialize */
let peopleDelay;
let eventList = {};
showMessage("info", "Lade Daten ...", 1000);
readEventList()
    .then(data => setEventList(data))
    .catch(result => {
        showMessage("danger", "Es ist ein Fehler aufgetreten");
    });

/* main listener */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("statusSearch").addEventListener("change", searchExamlist);
    document.getElementById("editform").classList.add("d-none");
    if (role !== "teacher") {
        document.getElementById("studentSearch").value = user;
        document.getElementById("examadd").hidden = true;
        lockForm("editform", true);
        lockForm("filterForm", true);
    } else {
        document.getElementById("teacherSearch").value = user;
        document.getElementById("studentSearch").addEventListener("keyup", searchExamlist);
        document.getElementById("teacherSearch").addEventListener("keyup", searchExamlist);
        document.getElementById("dateSearch").addEventListener("change", searchExamlist);

        document.getElementById("examadd").hidden = false;
        lockForm("editform", false);
        lockForm("filterForm", false);
        document.getElementById("editform").addEventListener("submit", submitExam);
        document.getElementById("editform").addEventListener("reset", resetForm);
        document.getElementById("student.fullname").addEventListener("keyup", searchPeople);
        document.getElementById("student.fullname").addEventListener("change", setPerson);
        document.getElementById("teacher.fullname").addEventListener("keyup", searchPeople);
        document.getElementById("teacher.fullname").addEventListener("change", setPerson);

        document.getElementById("examadd").addEventListener("click", function () {
            resetForm();
            document.getElementById("editform").classList.remove("d-none");
            document.getElementById("list").classList.add("d-none");
            searchExamlist();
        });
    }

    searchExamlist();
});


/**
 * search people
 * @param the calling event
 */
function searchPeople(event) {
    clearTimeout(peopleDelay);
    peopleDelay = setTimeout(() => {
        let fieldname = event.target.id;
        let filter = document.getElementById(fieldname).value;
        if (filter.length >= 2) {
            loadPeople(
                filter, fieldname
            ).then(data => {
                setPeopleList(data, fieldname);
            });
        }
    }, 500);
}

/**
 * updates the data list for searching people
 * @param data
 */
function setPeopleList(data, fieldname) {
    let parts = fieldname.split(".");
    let datalist = document.getElementById(parts[0] + ".list");
    datalist.innerHTML = "";
    data.forEach(person => {
        let option = document.createElement("option");
        option.value = person.fullname + " (" + person.email + ")";
        option.setAttribute("data-email", person.email);
        datalist.appendChild(option);
    });
    document.getElementById(fieldname).focus();
}

/**
 * sets the values of the selected person
 * @param the calling event
 */
function setPerson(event) {
    let fieldname = event.target.id;
    let parts = fieldname.split(".");
    let datalist = document.getElementById(parts[0] + ".list");
    let fullname = document.getElementById(fieldname).value;

    for (let i = 0; i < datalist.options.length; i++) {
        let option = datalist.options[i];
        if (option.value == fullname) {
            document.getElementById(parts[0]).value = option.getAttribute("data-email");
        }
    }

}

/**
 * search people with delay upon input
 */
function searchExamlist() {
    clearTimeout(delayTimer);
    delayTimer = setTimeout(() => {
        showMessage("info", "Lade Daten ...", 1000);
        let filter = "";
        filter += "student=" + document.getElementById("studentSearch").value;
        filter += "&teacher=" + document.getElementById("teacherSearch").value;
        filter += "&date=" + document.getElementById("dateSearch").value;

        let status = "none";
        const open = document.getElementById("open").checked;
        const closed = document.getElementById("closed").checked;
        if (open & closed) status = "all";
        else if (open) status = "open";
        else if (closed) status = "closed";
        filter += "&status=" + status;

        readExamlist(
            filter
        ).then(data => {
            showExamlist(data);
        }).catch(result => {
            console.log(result);
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
            if (!exists)
                await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (data.length > 0)
            data.sort(sortExams);
        let rows = document.getElementById("examlist")
            .getElementsByTagName("tbody")[0];
        rows.innerHTML = "";
        data.forEach(exam => {
            try {
                let row = rows.insertRow(-1);
                let cell = row.insertCell(-1);
                let button = document.createElement("button");
                button.innerHTML = "<img src='./img/edit.svg' width='20px'/>";
                button.type = "button";
                button.id = "editExam";
                button.title = "Bearbeiten";
                button.className = "btn btn-sm btn-outline-primary";
                button.setAttribute("data-examuuid", exam.exam_uuid);
                button.addEventListener("click", selectExam);
                cell.appendChild(button);

                if (role == "teacher") {
                    button = document.createElement("button");
                    button.innerHTML = "<img src='./img/email.svg' width='20px'/>";
                    button.type = "button";
                    button.id = "sendEmail";
                    button.title = "Email";
                    button.className = "btn btn-sm btn-outline-primary";
                    button.setAttribute("data-examuuid", exam.exam_uuid);
                    button.setAttribute("data-status", exam.status);
                    button.addEventListener("click", sendEmail);
                    cell.appendChild(button);
                    button = document.createElement("button");
                    button.innerHTML = "<img src='./img/pdf.svg' width='20px'/>";
                    button.type = "button";
                    button.id = "createPDF";
                    button.title = "Drucken";
                    button.className = "btn btn-sm btn-outline-primary";
                    button.setAttribute("data-examuuid", exam.exam_uuid);
                    button.addEventListener("click", createPDF);
                    cell.appendChild(button);
                }

                cell = row.insertCell(-1);
                cell.innerHTML = exam.teacher.firstname + " " + exam.teacher.lastname;
                cell.innerHTML += "<br />" + exam.teacher.email;
                cell = row.insertCell(-1);
                cell.innerHTML = exam.student.firstname + " " + exam.student.lastname;
                cell.innerHTML += "<br />" + exam.student.email;
                cell = row.insertCell(-1);
                cell.innerHTML = eventList[exam.event_uuid].datetime.substring(0, 10);
                cell = row.insertCell(-1);
                cell.innerHTML = exam.status;
                cell = row.insertCell(-1);
                cell.innerHTML = exam.module + " / " + exam.exam_num;
                cell = row.insertCell(-1);
                cell.innerHTML = exam.duration;
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
            if (!exists)
                await new Promise(resolve => setTimeout(resolve, 100));
        }

        let dateSearch = document.getElementById("dateSearch");
        let dateEdit = document.getElementById("event_uuid");
        data.forEach(event => {
            key = event.event_uuid;
            eventList[key] = event;

            let option = document.createElement("option");
            option.value = event.event_uuid;
            option.text = event.datetime.substring(0, 10);
            dateSearch.appendChild(option);
            let copy = option.cloneNode(true);
            dateEdit.appendChild(copy);
        });
        showMessage("clear");
    })();
}

/**
 * compares to exams
 * @param examA
 * @param examB
 * @returns compare result
 */
function sortExams(examA, examB) {
    try {
        const dateA = eventList[examA.event_uuid].datetime;
        const dateB = eventList[examB.event_uuid].datetime;
        if (dateA < dateB) {
            return -1;
        }
        if (dateA > dateB) {
            return 1;
        }

        const compare = examA.student.lastname.toString().localeCompare(examB.student.lastname.toString());
        if (compare !== 0) return compare;
        return examA.student.firstname.localeCompare(examB.student.firstname);
    } catch (e) {
        return 0;
    }

}

/**
 * event that fires when an exam is selected
 * @param event
 */
function selectExam(event) {
    const uuid = getExamUUID(event)
    document.getElementById("editform").classList.remove("d-none");
    document.getElementById("list").classList.add("d-none");
    readExam(
        uuid
    ).then(exam => {
        for (let property in exam) {
            if (typeof exam[property] === "object") {
                if (property === "student" || property === "teacher") {
                    document.getElementById(property + ".fullname").value = exam[property].fullname; // + " (" + exam[property].email + ")";
                    document.getElementById(property).value = exam[property].email;
                }
            } else {
                const field = document.getElementById(property);
                if (field !== null) {
                    field.value = exam[property];
                }
            }
        }
        document.getElementById("teacher.fullname").focus();
    }).catch(status => {
        showMessage("danger", "Ein Fehler ist aufgetreten");
    });
}

/**
 * submits the changes to the exam
 * @param event
 */
function submitExam(event) {
    event.preventDefault();
    const examForm = document.getElementById("editform");
    if (examForm.checkValidity()) {
        const url = API_URL + "/exam";
        const fields = [
            "exam_uuid",
            "event_uuid",
            "student",
            "teacher",
            "cohort",
            "module",
            "exam_num",
            "missed",
            "duration",
            "room",
            "status",
            "tools",
            "remarks"
        ];
        let data = new URLSearchParams();
        for (let field of fields) {
            data.set(field, document.getElementById(field).value);
        }

        saveExam(
            data
        ).then(function () {
            document.getElementById("editform").classList.add("d-none");
            document.getElementById("list").classList.remove("d-none");
            searchExamlist();
        }).catch(result => {

        });
    }
}

/**
 * resets and closes the edit form
 */
function resetForm() {
    document.getElementById("editform").classList.add("d-none");
    document.getElementById("list").classList.remove("d-none");
    document.getElementById("exam_uuid").value = ""
    document.getElementById("teacher").value = ""
    document.getElementById("student").value = ""
    document.getElementById("examlist").focus();
}


/**
 * event that fires when sendEmail is selected
 * @param event
 */
function sendEmail(event) {
    const uuid = getExamUUID(event);
    const status = getStatus(event);

    sendRequest(
        API_URL + "/email/" + uuid + "/" + status
    ).then(showMessage("info", "Email gesendet"));
}

/**
 * creates a pdf for an event
 * @param event
 */
function createPDF(event) {
    const uuid = getExamUUID(event)
    sendRequest(API_URL + "/print/" + uuid, "GET",null, "blob")
        .then((blob) => { // RETRIEVE THE BLOB AND CREATE LOCAL URL
          var _url = window.URL.createObjectURL(blob);
          window.open(_url, "_blank").focus(); // window.open + focus
      }).catch((err) => {
        console.log(err);
      });
}