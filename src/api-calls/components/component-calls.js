import axios from 'axios';

import {API_ROUTE_CONST, apiURL} from '../../constants/constants.js';
import {urlBuilder} from '../utils.js';

/**
 * Retrieves components via a GET request to the specified API endpoint.
 *
 * @async
 * @function getComponents
 * @param {string} [page] - Optional, used to filter results by page name. If not provided, defaults to the base components endpoint.
 * @param {string} bearerToken - The Bearer token used for authorization in the request header.
 * @returns {Promise<Object>} A promise that resolves to the response object from the server containing the requested components.
 * @throws {Error} Throws an error if the request fails or if the server returns a non-2xx HTTP status.
 */
export const getComponents = async (page, bearerToken) => {
    const url = page
        ? urlBuilder(apiURL, API_ROUTE_CONST.COMPONENTS, null, [{key: 'page', value: page}])
        : urlBuilder(apiURL, API_ROUTE_CONST.COMPONENTS);

    return axios.get(
        url,
        {
            headers: {
                Authorization: `Bearer ${bearerToken}`
            }
        });
};

/**
 * Asynchronously creates a new component by making a POST request to the API endpoint.
 *
 * @param {{component_name: string}} requestBody - The request payload containing component data to be created.
 * @param {string} bearerToken - The authorization token to authenticate the request.
 * @param {string} csrfToken - The CSRF token to ensure request security.
 * @returns {Promise} A promise that resolves with the server's response or rejects with an error.
 */
export const createComponent = async (
    requestBody,
    bearerToken,
    csrfToken
) => axios.post(
    urlBuilder(apiURL, API_ROUTE_CONST.COMPONENTS, null, null),
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
 * Updates a specific component by sending a PATCH request to the API.
 *
 * @param {number} component_id - The unique identifier of the component to be updated.
 * @param {{component_name: string}} requestBody - The body of the request containing the updated component data.
 * @param {string} bearerToken - The Bearer token for authentication.
 * @param {string} csrfToken - The CSRF token for additional security.
 * @returns {Promise} A Promise representing the HTTP request, resolving to the API's response.
 */
export const updateComponent = async (
    component_id,
    requestBody,
    bearerToken,
    csrfToken
) => axios.patch(
    urlBuilder(apiURL, API_ROUTE_CONST.COMPONENTS, [component_id]),
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
 * Deletes a component by sending a DELETE request to the specified API endpoint.
 *
 * @param {number} id - The unique identifier of the component to be deleted.
 * @param {string} bearerToken - The Bearer token used for user authentication.
 * @param {string} csrfToken - The CSRF token for validating the request.
 * @returns {Promise} A promise that resolves with the response of the DELETE request,
 *                    or rejects with an error if the request fails.
 */
export const deleteComponent = async (
    id,
    bearerToken,
    csrfToken
) =>
    axios.delete(
        urlBuilder(apiURL, API_ROUTE_CONST.COMPONENTS, [id]),
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        }
    );