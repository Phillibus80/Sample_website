import axios from 'axios';

import {urlBuilder} from './utils.js';
import {API_ROUTE_CONST, apiURL} from '../constants/constants.js';

/**
 * An API call to retrieve all of a page's content
 *
 * @param {string} [pageName] - optional param can be used to filter the results by page name.
 * If left empty, will return an array of {LinkListItem}
 *
 * @return {Promise<axios.AxiosResponse<PageResObject>>}
 */
export const getPageContent = async (pageName) => {
    return pageName
        ? axios.get(urlBuilder(apiURL, '/pages', [], [{key: 'page', value: `${pageName}`}]))
        : axios.get(urlBuilder(apiURL, '/pages', []));
};

// Contact Us
/**
 * An API call to add a person to the email list and sends an email to the owner of the site.
 * @param {{email: string}} postBody
 *
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const submitContactForm = async (postBody) => axios.post(
    urlBuilder(apiURL, API_ROUTE_CONST.SEND_EMAIL),
    postBody
);

// ----- Auth -----
export const login = async (username, password) => axios.post(
    urlBuilder(apiURL, API_ROUTE_CONST.LOGIN),
    {
        username,
        password
    }, {
        withCredentials: true
    }
);

/**
 * The API call to log a user out of the application.
 *
 * @param {string} username
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const logout = async (
    username,
    bearerToken,
    csrfToken
) => axios.post(
    urlBuilder(apiURL, API_ROUTE_CONST.LOGOUT),
    {
        username
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

export const getUserByName = async (username, bearerToken) => axios.get(
    urlBuilder(apiURL, API_ROUTE_CONST.USERS, [username]),
    {
        headers: {
            Authorization: `Bearer ${bearerToken}`
        }
    }
);