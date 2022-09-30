/**
 *
 */

/**
 * reads all events matching a filter
 */
function readEventList() {
    return getRequest(API_URL + "/events");
}