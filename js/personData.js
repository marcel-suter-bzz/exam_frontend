/**
 * loads all people mathicng a filter
 * @param filter
 */
function loadPeople(filter) {
    return sendRequest(API_URL + "/people/" + filter);
}

/**
 * authenticates the user
 * @param email
 * @param password
 * @returns SUCCESS, FAIL or ERROR
 */
function authenticateUser(email, password) {
    let data = new URLSearchParams();
    data.set("email", email);
    data.set("password", password);

    return new Promise((resolve, reject) => {
        fetch(API_URL + "/login", {
            method: "POST", headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }, body: data
        }).then(function (response) {
            if (!response.ok) {
                resolve("FAIL");
            } else return response;
        }).then(response => response.json())
            .then(data => {
                writeStorage(data);
                resolve("SUCCESS");
            }).catch(function (error) {
            console.log(error);
            reject("ERROR");
        });
    });
}