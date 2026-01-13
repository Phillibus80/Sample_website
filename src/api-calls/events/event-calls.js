import axios from 'axios';

import {API_ROUTE_CONST, apiURL} from '../../constants/constants.js';
import {urlBuilder} from '../utils.js';

/**
 * An API call to retrieve all events.
 *
 * @param {string} bearerToken
 *
 * @return {Promise<axios.AxiosResponse<EventRawObject>>}
 */
export const getEvents = (bearerToken = {}) =>
    axios.get(urlBuilder(apiURL, API_ROUTE_CONST.EVENTS), {
        headers: {
            Authorization: `Bearer ${bearerToken}`
        }
    });


// ----- Admin Event -----

/**
 * The API call to add a new event to the database;
 *
 * @param {CreateEventContentRequestBody} requestBody
 * @param {string} bearerToken
 * @param {string} csrfToken
 *
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const createEvent = async (
    requestBody,
    bearerToken,
    csrfToken
) => axios.post(
    urlBuilder(apiURL, API_ROUTE_CONST.EVENTS),
    requestBody,
    {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        }
    }
);


/**
 * The API call to update an event's record on the database;
 *
 * @param {number} id
 * @param {UpdateEventContentRequestBody} updates
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const updateEvent = async (
    id,
    updates,
    bearerToken,
    csrfToken
) => axios.patch(
    urlBuilder(apiURL, API_ROUTE_CONST.EVENTS, [id]),
    updates,
    {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        }
    }
);

/**
 * The API call to remove an Event
 *
 * @param {number} eventId
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const removeEvent = async (
    eventId,
    bearerToken,
    csrfToken
) => axios.delete(
    urlBuilder(apiURL, API_ROUTE_CONST.EVENTS, [eventId]),
    {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        }
    }
);