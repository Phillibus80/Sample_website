import axios from 'axios';

import {clearAuthFromSessionStorage} from '../utils/utils.js';

let logoutCallback = null;

export const setLogoutCallback = (callback) => {
    logoutCallback = callback;
};

export const setupAxiosInterceptors = () => {
    axios.interceptors.response.use(
        (response) => response,

        (error) => {
            if (error.response?.status === 401) {
                console.warn('Received 401 Unauthorized - clearing auth and redirecting to login');

                clearAuthFromSessionStorage();

                if (logoutCallback) {
                    logoutCallback();
                }
            }

            return Promise.reject(error);
        }
    );
};
