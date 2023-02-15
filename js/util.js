/**
 * utility functions
 * @author Marcel Suter
 */

const user = readStorage("email");
const role = readStorage("role");
const statusIcon = {
    "pendent": "&#9888 ",
    "offen": "&#9888 ",
    "abgegeben": "&#9888 ",
    "erhalten": "&#9888 ",
    "abgeschlossen": "&#9989 ",
    "pnab": "&#9888 ",
    "geloescht": "&#10060 "
}

let delayTimer;
let messageTimer;
let running = false;

/**
 * controls the fetch requests, refreshes the access-token if needed
 * @param url  the request URL
 * @param method the http-method
 * @param bodyData  the data to send (POST/PUT only)
 * @param type  the type of the response
 * @returns {Promise<unknown>}
 */
async function sendRequest(url, method = "GET", bodyData = null, type = "json") {
    let reason = "";
    try {
        let result = await httpFetch(url, method, bodyData, "access", type);
        return Promise.resolve(result);
    } catch (err) {
        console.log(err);
        reason = err;
    }

    if (reason === "401") {
        try {
            let data = await httpFetch(API_URL + '/refresh/' + user, "GET", null, "refresh");
            writeStorage(data);
            let result = await httpFetch(url, method, bodyData, "access", type);
            return Promise.resolve(result);
        } catch (err) {
            console.log("sendRequest: " + err);
            reason = err;
        }
    }

    if (reason === "401") {
        window.location.href = "./";
    }
    return Promise.reject(reason);
}

/**
 * executes the http fetch and returns a promise
 * @param url  the fetch-url
 * @param httpMethod  the http-methode
 * @param data    the data to be sent (PUT/POST only)
 * @param token  which token to send (access or refresh)
 * @param type  type of the response data
 * @returns {Promise<string|any>}
 */
async function httpFetch(
    url,
    httpMethod = "GET",
    data = null,
    token = "access",
    type = "json"
) {

    try {
        let response;
        if (httpMethod === "PUT" || httpMethod === "POST") {
            response = await fetch(url, {
                method: httpMethod,
                headers: {
                    "Authorization": "Bearer " + readStorage(token)
                },
                body: data
            });
        } else {
            response = await fetch(url, {
                method: httpMethod,
                headers: {
                    "Authorization": "Bearer " + readStorage(token)
                }
            });
        }
        if (response.ok) {
            if (type === "json")
                data = response.json();
            else if (type === "blob")
                data = response.blob();
            else
                data = response.text();
            return Promise.resolve(data);
        } else if (response.status === 401) {
            return Promise.reject("401");
        } else if (response.status === 404) {
            return Promise.resolve("[]");
        } else {
            console.log(response);
            return Promise.reject(response.status);
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(err.status);
    }
}

/**
 * shows a info/warn/error-message
 * @param type  message type: info, success, danger, warning
 * @param message the message to show
 * @param minTime  the minimum time this message should be shown in seconds
 * @param timeout  removes the message after this time in seconds
 */
function showMessage(type, message = "", minTime = 0, timeout = 0) {
    const field = document.getElementById("messages");

    if (type === "clear") {
        if (running) {
            setTimeout(() => {
                showMessage("clear", "&nbsp;", 2);
            })
        } else {
            clearTimeout(messageTimer);
            field.className = "alert";
            field.innerHTML = "&nbsp;";
        }
    } else {
        field.className = "alert-" + type;
        field.innerHTML = message;

        if (timeout > 0) {
            messageTimer = setTimeout(() => {
                showMessage("clear", "&nbsp;");
            }, timeout * 1000);
        } else if (minTime > 0) {
            running = true;
            messageTimer = setTimeout(() => {
                running = false;
            }, minTime * 1000);
        }
    }
}

/**
 * locks / unlocks all fields in a form
 * @param formId  the id of the form containing the fields
 * @param locked  true=lock fields
 */
function lockForm(formId, locked = true) {
    const form = document.getElementById(formId);
    const fields = form.querySelectorAll("select,input");
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (field.type === "hidden" ||
            field.getAttribute("data-edit") === "all") ;
        else if (field.tagName === "INPUT") {
            field.disabled = locked;
        } else if (field.tagName === "SELECT") {
            field.disabled = locked;
        }

    }
}

/**
 * saves the JWToken in SessionStorage
 * @param data  response data
 */
function writeStorage(data) {
    for (let key in data) {
        sessionStorage.setItem(key, data[key]);
    }
}

/**
 * reads the JWToken from SessionStorage
 * @returns {string}
 */
function readStorage(item) {
    return sessionStorage.getItem(item);
}

/**
 * gets the examuuid from a button
 * @param event
 * @returns {string}
 */
function getExamUUID(event) {
    let targetElement = event.target;
    if (targetElement.tagName === "IMG") {
        targetElement = targetElement.parentNode;
    }
    return targetElement.getAttribute("data-examuuid");
}

/**
 * gets the status from a button
 * @param event
 * @returns {string}
 */
function getStatus(event) {
    let targetElement = event.target;
    if (targetElement.tagName === "IMG") {
        targetElement = targetElement.parentNode;
    }
    return targetElement.getAttribute("data-status");
}

/**
 * creates a uuid v4
 * @returns {string}
 */
function create_UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

function addTextCell(row, text) {
    /**
     * adds a cell to a table row
     * @param row  a row-object
     * @param text the innerHtml-text
     */
    let cell = row.insertCell(-1);
    cell.innerHTML = text;
}