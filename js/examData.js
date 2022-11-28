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
 * @param data  the form data
 */
function saveExam(data) {

    let httpMethod = "POST";
    if (data["exam_uuid"] !== "") httpMethod = "PUT";
    return sendRequest(API_URL + "/exam", httpMethod, data, "text");
}