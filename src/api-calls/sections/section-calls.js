import axios from 'axios';

import {API_ROUTE_CONST, apiURL} from '../../constants/constants.js';
import {urlBuilder} from '../utils.js';

export const getSections = async (page, bearerToken) => {
    const url = page
        ? urlBuilder(apiURL, API_ROUTE_CONST.SECTIONS, null, [{key: 'page', value: page}])
        : urlBuilder(apiURL, API_ROUTE_CONST.SECTIONS);

    return axios.get(
        url,
        {
            headers: {
                Authorization: `Bearer ${bearerToken}`
            }
        });
};

/**
 * Asynchronously creates a new section on a specified page by making a POST request to the API.
 *
 * @async
 * @param {string} sectionName - The name of the section to be created.
 * @param {string} bearerToken - The Bearer token for authentication.
 * @param {string} csrfToken - The CSRF token to ensure secure requests.
 * @returns {Promise<axios.AxiosResponse<any>>} A promise that resolves with the response from the API.
 * @throws Will throw an error if the request fails or the response indicates an issue.
 */
export const createSection = async (
    sectionName,
    bearerToken,
    csrfToken
) => axios.post(
    urlBuilder(apiURL, API_ROUTE_CONST.SECTIONS),
    {
        section_name: sectionName,
    },
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
 * Sends a PATCH request to update a specific page section with the provided data.
 *
 * @param {number} pageSectionId - The unique identifier of the page section to be updated.
 * @param {UpdateSectionRequestBody} requestBody - The data to be sent in the request body for updating the page section.
 * @param {string} bearerToken - The Bearer token for authorization.
 * @param {string} csrfToken - The CSRF token for ensuring request authenticity.
 * @returns {Promise<axios.AxiosResponse<any>>} A Promise that resolves with the server's response to the PATCH request.
 */
export const updatePageSection = async (
    pageSectionId,
    requestBody,
    bearerToken,
    csrfToken
) =>
    axios.patch(
        urlBuilder(apiURL, API_ROUTE_CONST.PAGES_SECTIONS, [pageSectionId]),
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
 * The API call to remove a section
 *
 * @param {number} sectionId
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const removeSection = async (
    sectionId,
    bearerToken,
    csrfToken
) => axios.delete(
    urlBuilder(apiURL, API_ROUTE_CONST.SECTIONS, [sectionId]),
    {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        }
    }
);

export const getSectionByPageName = async (pageName) => axios.get(
    urlBuilder(apiURL, `/${API_ROUTE_CONST.PAGES_SECTIONS}`, [pageName])
);