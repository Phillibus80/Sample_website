import axios from 'axios';

import {API_ROUTE_CONST, apiURL} from '../../constants/constants.js';
import {urlBuilder} from '../utils.js';

/**
 * An API call to retrieve all logs.
 *
 * @param {string} bearerToken
 *
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const getLogs = (bearerToken) =>
    axios.get(urlBuilder(apiURL, API_ROUTE_CONST.LOGS), {
        headers: {
            Authorization: `Bearer ${bearerToken}`
        }
    });