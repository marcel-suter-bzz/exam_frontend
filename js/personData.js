/**
 * loads all people matching a filter
 * @param filter_name  filter for first/lastname
 * @param filter_role  filter for role
 */
function loadPeople(filter_name, filter_role="all") {
    return sendRequest(API_URL + "/people/" + filter_name + "/" + filter_role);
}