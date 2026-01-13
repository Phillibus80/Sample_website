import axios from 'axios';

import {API_ROUTE_CONST, apiURL} from '../../constants/constants.js';
import {urlBuilder} from '../utils.js';

/**
 * The API call to add a new page to the database;
 *
 * @param {string} pageName
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const createPage = async (
    pageName,
    bearerToken,
    csrfToken
) => axios.post(
    urlBuilder(apiURL, API_ROUTE_CONST.PAGES),
    {
        page_name: pageName
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
 * The API call to add a new section to a page;
 *
 * @param {string} pageName
 * @param {string} sectionName
 * @param {boolean} showSection
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const createPageSection = async (
    pageName,
    sectionName,
    showSection,
    bearerToken,
    csrfToken
) => axios.post(
    urlBuilder(apiURL, API_ROUTE_CONST.PAGES_SECTIONS),
    {
        page_name: pageName,
        section_name: sectionName,
        show_section: showSection
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
 * The API call to remove a specific page's section;
 *
 * @param {number} pageSectionId
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const removePageSection = async (
    pageSectionId,
    bearerToken,
    csrfToken
) => axios.delete(
    urlBuilder(apiURL, API_ROUTE_CONST.PAGES_SECTIONS, [pageSectionId]),
    {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        }
    }
);