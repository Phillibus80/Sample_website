import axios from 'axios';

import {API_ROUTE_CONST, apiURL} from '../../constants/constants.js';
import {urlBuilder} from '../utils.js';

/**
 * An API call to create the component content on the db.
 *
 * @param {string} componentContentId
 * @param {CreateSectionComponentContentRequestBody} requestBody
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<{message: string}>>}
 */
export const createComponentContent = async (
    componentContentId,
    requestBody,
    bearerToken,
    csrfToken
) => {
    return axios.post(
        urlBuilder(apiURL, API_ROUTE_CONST.COMPONENT_CONTENT, [componentContentId]),
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
};

/**
 * An API call to remove the component content from the db.
 *
 * @param {string} componentContentId
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<{message: string}>>}
 */
export const deleteComponentContent = async (
    componentContentId,
    bearerToken,
    csrfToken
) => {
    return axios.delete(
        urlBuilder(apiURL, API_ROUTE_CONST.COMPONENT_CONTENT, [componentContentId]),
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        }
    );
};

/**
 * An API call to update the component content on the db.
 *
 * @param {string} componentContentId
 * @param {UpateComponentContentRequestBody} requestBody
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<{message: string}>>}
 */
export const updateComponentContent = async (
    componentContentId,
    requestBody,
    bearerToken,
    csrfToken
) => {
    return axios.patch(
        urlBuilder(apiURL, API_ROUTE_CONST.COMPONENT_CONTENT, [componentContentId]),
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
};