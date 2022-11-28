/**
 *  data handler for events
 */

/**
 * reads all events matching a filter
 */
function readEventList() {
    return sendRequest(API_URL + "/events");
}