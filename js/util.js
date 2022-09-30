/**
 * utility functions
 * @author Marcel Suter
 */

const API_URL = "http://127.0.0.1:5000";
const user = readStorage("email");
const role = readStorage("role");
let delayTimer;
let messageTimer;

/**
 * sends a get request via fetch
 * @param url  the request URL
 * @returns {Promise<unknown>}
 */
function getRequest(url) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            headers: {
                "Authorization": "Bearer " + readStorage("token")
            },
        }).then(function (response) {
            if (response.ok) {
                return response;
            } else if (response.status === 401) {
                window.location.href = "./";
                reject("401");
            } else if (response.status === 404) {
                resolve(null);
            } else {
                console.log(response);
                reject(response.status);
            }
        }).then(response => response.json()
        ).then(data => {
            resolve(data);
        }).catch(function (error) {
            console.log(error);
            reject(error.status);
        });
    });
}

/*
 * shows a info/warn/error-message
 * @param type  message type
 * @param message
 */
function showMessage(type, message="") {
    (async () => {
        let exists = false;
        while (!exists) {
            exists = document.readyState === "complete";
            if (!exists)
                await new Promise(resolve => setTimeout(resolve, 100));
        }
        const field = document.getElementById("messages");
        field.className = "alert alert-" + type;
        field.innerHTML = message;

        if (type == "success") {
            messageTimer = setTimeout(() => {
                showMessage("clear", "&nbsp;");
            }, 1000);
        } else if (type == "clear") {
            clearTimeout(messageTimer);
        }
    })();
}

/**
 * creates an input field element
 * @param name
 * @param type
 * @param value
 * @param size
 */
function makeField(name, type, value, size = 0) {
    let inputField = document.createElement("input");
    inputField.name = name;
    if (type === "integer") {
        inputField.type = "number";
        inputField.step = 1;
    } else {
        inputField.type = type;
    }
    inputField.value = value;
    if (size !== 0) inputField.size = size;

    return inputField;
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
        if (field.id == "student" || field.id == "teacher" || field.id == "exam_uuid") ;
        else if (field.tagName === "INPUT") {
            field.readOnly = locked;
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
