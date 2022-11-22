/**
 * reads a single exam identified by the uuid
 * @param uuid
 */
function readExam(uuid) {
    return sendRequest(API_URL + "/exam/" + uuid);
}

/**
 * reads all exams matching a filter
 * @param filter
 */
function readExamlist(filter) {
    return sendRequest(API_URL + "/exams?" + filter);
}

/**
 * saves an exam
 * @param event
 */
function saveExam(data) {

    let httpMethod = "POST";
    if (data["exam_uuid"] !== "") httpMethod = "PUT";
    return sendRequest(API_URL + "/exam", httpMethod, data, "text");
    /*
    return new Promise((resolve, reject) => {
        fetch(API_URL + "/exam", {
            method: httpMethod,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Bearer " + readStorage("access")
            },
            body: data
        }).then(function (response) {
            if (!response.ok) {
                console.log(response);
                reject(response.status);
            } else {
                showMessage("info", "Daten gespeichert", 0, 2000);
                resolve();
            }
        }).catch(function (error) {
            console.log(error);
            reject(response.status);
        });
    });
     */
}