/**
 * main listener
 */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginform").addEventListener("submit", sendLogin);
});

/**
 * submit the login
 * @param event
 */
function sendLogin(event) {
    event.preventDefault();
    const personForm = document.getElementById("loginform");
    if (personForm.checkValidity() == true) {
        authenticateUser(
            document.getElementById("email").value,
            document.getElementById("password").value
        ).then(result => {
            if (result == "SUCCESS") {
                window.location.href = "../examList.html";
            } else {
                showMessage("danger", "Login nicht erfolgreich");
            }
        }).catch(result => {
                showMessage("danger", "Es ist ein Fehler aufgetreten");
        });

    }
}