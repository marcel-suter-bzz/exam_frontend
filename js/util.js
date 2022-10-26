/**
 * utility functions
 * @author Marcel Suter
 */

const user = readStorage("email");
const role = readStorage("role");
let delayTimer;
let messageTimer;
let running = false;

/**
 * controls the fetch requests, refreshes the access-token if needed
 * @param url  the request URL
 * @returns {Promise<unknown>}
 */
async function getRequest(url) {
    let reason = "";
    try {
        let result = await httpFetch(url);
        return Promise.resolve(result);
    } catch (err) {
        console.log(err);
        reason = err;
    }

    if (reason === "401") {
        try {
            let data = await httpFetch(API_URL + '/login/' + user, "refresh");
            writeStorage(data);
            let result = await httpFetch(url);
            return Promise.resolve(result);
        } catch (err) {
            console.log(err);
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
 * @param token  which token to send (access or refresh)
 * @returns {Promise<string|any>}
 */
async function httpFetch(url, token = "access") {

    try {
        let response = await fetch(url, {
            headers: {
                "Authorization": "Bearer " + readStorage(token)
            }
        });
        if (response.ok) {
            data = response.json();
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

/*
* shows a info/warn/error-message
* @param type  message type
* @param message
*/
function showMessage(type, message = "", minTime = 0, timeout = 0) {
    const field = document.getElementById("messages");

    if (type == "clear") {
        if (running) {
            setTimeout(() => {
                showMessage("clear", "&nbsp;", 250);
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
            }, timeout);
        } else if (minTime > 0) {
            running = true;
            messageTimer = setTimeout(() => {
                running = false;
            }, minTime);
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
        if (field.type == "hidden" ||
            field.getAttribute("data-edit") == "all") ;
        else if (field.tagName === "INPUT") {
            field.disabled = locked;
        } else if (field.tagName === "SELECT") {
            field.disabled = locked;
        }

    }
}

/**
 * gets the value of the cookie with the specified name
 * Source: https://www.w3schools.com/js/js_cookies.asp
 * @param cname  the name of the cookie
 * @returns {string}
 */
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
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
    if (targetElement.tagName == "IMG") {
        targetElement = targetElement.parentNode;
    }
    return targetElement.getAttribute("data-examuuid");
}
