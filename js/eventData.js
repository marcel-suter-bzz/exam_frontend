/**
 *  data handler for events
 */
let eventList = {};
/**
 * reads all events matching a filter
 */
function readEventList(elementIds) {
    sendRequest(API_URL + "/events")
    .then(data => setEventList(data, elementIds))
    .catch(result => {
        showMessage("danger", "Es ist ein Fehler aufgetreten");
    });
}

/**
 * saves the events as an array
 * @param data  the events
 * @param elementIds  array of element-Ids for the events
 */
function setEventList(data, elementIds) {
    (async () => {
        let exists = false;
        while (!exists) {
            exists = document.readyState === "complete";
            if (!exists)
                await new Promise(resolve => setTimeout(resolve, 100));
        }

        let targets = [];
        for (let key in elementIds) {
            targets[key] = document.getElementById(elementIds[key]);
        }

        data.forEach(examEvent => {
            key = examEvent.event_uuid;
            eventList[key] = examEvent;

            let option = document.createElement("option");
            option.value = examEvent.event_uuid;
            option.text = examEvent.datetime.substring(0, 10);
            option.setAttribute("data-supervisor", examEvent.supervisors[0]);
            let locked = "true";
            examEvent.supervisors.forEach(supervisor => {
                if (supervisor === user) locked = "false";
            });
            option.setAttribute("data-locked", locked);
            for (let key in targets) {
                let copy = option.cloneNode(true);
                targets[key].appendChild(copy);
            }
        });
        showMessage("clear");
    })();
}
