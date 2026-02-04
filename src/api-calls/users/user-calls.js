import axios from 'axios';

import {API_ROUTE_CONST, apiURL} from '../../constants/constants.js';
import {urlBuilder} from '../utils.js';

/**
 * An API call to retrieve all users.  Can be filtered by role as a query param.
 *
 * @param {Role|null} [role] - Optional, returns the users matching this role.  Cannot be used with the filter
 * @param {Role} [filter] - Optional, returns all Users with roles other than the filter.  Cannot be used with the role
 * @param {object} bearerToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const getUsers = async (role, filter, bearerToken) => {
    let queryParameters;
    if (role) {
        queryParameters = [
            {
                key: 'role',
                value: `${role}`
            }
        ];
    } else if (filter) {
        queryParameters = [
            {
                key: 'filter',
                value: `${filter}`
            }
        ];
    } else queryParameters = null;

    return axios.get(
        urlBuilder(apiURL, API_ROUTE_CONST.USERS, null, queryParameters),
        {
            headers: {
                Authorization: `Bearer ${bearerToken}`
            }
        });
};

/**
 * An API call that will update the user's information.
 *
 * @param {number} id
 * @param {{[firstName]: string, [lastName]: string, [userName]: string, [password]: string, [email]: string, [permissions]: Array<Role>}} requestBody
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const updateUser = async (
    id,
    requestBody,
    bearerToken,
    csrfToken
) =>
    axios.patch(
        urlBuilder(apiURL, API_ROUTE_CONST.USERS, [id]),
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
 * An API call that creates a new user.
 *
 * @param {{first_name: string, last_name: string, user_name: string, email: string}} requestBody
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const createUser = async (
    requestBody,
    bearerToken,
    csrfToken
) =>
    axios.post(
        urlBuilder(apiURL, API_ROUTE_CONST.USERS),
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
 * An API call that deletes the user's information.
 *
 * @param {number} id
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const deleteUser = async (
    id,
    bearerToken,
    csrfToken
) =>
    axios.delete(
        urlBuilder(apiURL, API_ROUTE_CONST.USERS, [id]),
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        }
    );