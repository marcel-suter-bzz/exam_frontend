const myMSALObj = new msal.PublicClientApplication(MSALCONFIG);
let username = "";

/**
 * main listener
 */
document.addEventListener("DOMContentLoaded", () => {
    //document.getElementById("loginform").addEventListener("submit", sendLogin);
    let login = document.getElementById("login");
    if (login != null) login.addEventListener("click", signIn);
    let logout = document.getElementById("logout");
    if (logout != null) logout.addEventListener("click", signOut);
});

/**
 * redirect hanlder for response from redirect flow
 */
myMSALObj.handleRedirectPromise()
    .then(handleResponse)
    .catch((error) => {
        console.error(error);
    });

function selectAccount() {

    /**
     * See here for more info on account retrieval:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */

    const currentAccounts = myMSALObj.getAllAccounts();

    if (currentAccounts.length === 0) {
    } else if (currentAccounts.length > 1) {
        // Add your account choosing logic here
        console.warn("Multiple accounts detected.");
    } else if (currentAccounts.length === 1) {
        username = currentAccounts[0].username;
        //showWelcomeMessage(username);
    }
}

function handleResponse(response) {
    if (response !== null) {
        let username = response.account.username;
        let storage = {
            "idToken": response.idToken,
            "email": username
        };
        writeStorage(storage);
        httpFetch(
            API_URL + "/login", "GET", null, "idToken"
        ).then(function (data) {
            writeStorage(data);
            window.location.href = "./examList.html";
        }).catch(result => {
            showMessage("danger", "Es ist ein Fehler aufgetreten");
        });
    } else {
        selectAccount();
    }
}

function signIn() {

    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    myMSALObj.loginRedirect(LOGINSCOPES);
}

function signOut() {

    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    const logoutRequest = {
        account: myMSALObj.getAccountByUsername(username),
        postLogoutRedirectUri: MSALCONFIG.auth.redirectUri,
    };

    myMSALObj.logoutRedirect(logoutRequest);
}

function getTokenRedirect(request) {
    /**
     * See here for more info on account retrieval:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    request.account = myMSALObj.getAccountByUsername(username);

    return myMSALObj.acquireTokenSilent(request)
        .catch(error => {
            console.warn("silent token acquisition fails. acquiring token using redirect");
            if (error instanceof msal.InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                return myMSALObj.acquireTokenRedirect(request);
            } else {
                console.warn(error);
            }
        });
}