import axios from 'axios';

import {API_ROUTE_CONST, apiURL} from '../../constants/constants.js';
import {urlBuilder} from '../utils.js';

/**
 * An API call to retrieve all links from the db.
 *
 * @param {string} [pageQueryParam] - an optional param, signifies which page to filter by (must match the db label)
 * @param {string} bearerToken
 *
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const getLinks = (pageQueryParam, bearerToken = '') =>
    pageQueryParam
        ? axios.get(
            urlBuilder(apiURL, API_ROUTE_CONST.LINKS, null, [{
                key: 'page',
                value: pageQueryParam
            }]),
            {
                headers: {
                    Authorization: `Bearer ${bearerToken}`
                }
            })
        : axios.get(urlBuilder(apiURL, API_ROUTE_CONST.LINKS), {
            headers: {
                Authorization: `Bearer ${bearerToken}`
            }
        });

/**
 * An API call to retrieve all page links from the db.
 *
 * @param {string} bearerToken
 *
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const getPageLinks = (bearerToken = '') =>
    axios.get(
        urlBuilder(apiURL, API_ROUTE_CONST.LINKS, null, [{
            key: 'page-links',
            value: true
        }]),
        {
            headers: {
                Authorization: `Bearer ${bearerToken}`
            }
        });

/**
 * An API call to retrieve all links from the db based on Section name.
 *
 * @param {string} [sectionNamePathParam] - an optional param, signifies which section to filter by (must match the db label)
 * @param {string} bearerToken
 *
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const getLinksBySectionName = (sectionNamePathParam, bearerToken = '') =>
    axios.get(
        urlBuilder(apiURL, API_ROUTE_CONST.LINKS, [sectionNamePathParam], null),
        {
            headers: {
                Authorization: `Bearer ${bearerToken}`
            }
        });


// ----- AdminLink -----

/**
 * The API call to add a new link to the database;
 *
 * @param {string} text
 * @param {string} url
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const createLink = async (
    text,
    url,
    bearerToken,
    csrfToken
) => axios.post(
    urlBuilder(apiURL, API_ROUTE_CONST.LINKS),
    {
        link_text: text,
        url: url
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
 * The API call to update a link's record on the database;
 *
 * @param {number} id
 * @param {{[link_text]: string, [link_url]: string}} updates
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const updateLink = async (
    id,
    updates,
    bearerToken,
    csrfToken
) => axios.patch(
    urlBuilder(apiURL, API_ROUTE_CONST.LINKS, [id]),
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
 * The API call to remove a Link
 *
 * @param {number} linkId
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const removeLink = async (
    linkId,
    bearerToken,
    csrfToken
) => axios.delete(
    urlBuilder(apiURL, API_ROUTE_CONST.LINKS, [linkId]),
    {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        }
    }
);