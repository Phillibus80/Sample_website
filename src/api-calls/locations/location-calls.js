import axios from 'axios';

import {API_ROUTE_CONST, apiURL} from '../../constants/constants.js';
import {urlBuilder} from '../utils.js';

/**
 * An API call to retrieve all locations.
 *
 * @param {string} bearerToken
 *
 * @return {Promise<axios.AxiosResponse<LocationRawObject>>}
 */
export const getLocations = (bearerToken = {}) =>
    axios.get(urlBuilder(apiURL, API_ROUTE_CONST.LOCATIONS), {
        headers: {
            Authorization: `Bearer ${bearerToken}`
        }
    });


// ----- Admin Location -----

/**
 * The API call to add a new location to the database;
 *
 * @param {CreateLocationContentRequestBody} requestBody
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const createLocation = async (
    requestBody,
    bearerToken,
    csrfToken
) => axios.post(
    urlBuilder(apiURL, API_ROUTE_CONST.LOCATIONS),
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
 * The API call to update a location's record on the database;
 *
 * @param {number} id
 * @param {UpdateLocationContentRequestBody} updates
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const updateLocation = async (
    id,
    updates,
    bearerToken,
    csrfToken
) => axios.patch(
    urlBuilder(apiURL, API_ROUTE_CONST.LOCATIONS, [id]),
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
 * The API call to remove a location
 *
 * @param {number} eventId
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const removeLocation = async (
    eventId,
    bearerToken,
    csrfToken
) => axios.delete(
    urlBuilder(apiURL, API_ROUTE_CONST.LOCATIONS, [eventId]),
    {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        }
    }
);