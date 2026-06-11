import axios from 'axios';

import {clearAuthFromSessionStorage} from '../utils/utils.js';

let logoutCallback = null;
let csrfRefreshCallback = null;

// Tracks the in-flight refresh so concurrent 403s share one call
let refreshPromise = null;

export const setLogoutCallback = (callback) => {
    logoutCallback = callback;
};

export const setCsrfRefreshCallback = (callback) => {
    csrfRefreshCallback = callback;
};

export const setupAxiosInterceptors = () => {
    axios.interceptors.response.use(
        (response) => response,

        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 403
                && error.response?.data?.error === 'CSRF_TOKEN_INVALID'
                && !originalRequest._csrfRetry
            ) {
                if (csrfRefreshCallback) {
                    // Deduplicate: if a refresh is already in-flight, reuse it
                    if (!refreshPromise) {
                        refreshPromise = csrfRefreshCallback().finally(() => {
                            refreshPromise = null;
                        });
                    }

                    const refreshed = await refreshPromise;
                    if (refreshed) {
                        originalRequest._csrfRetry = true;
                        originalRequest.headers['X-CSRF-Token'] = refreshed;
                        return axios(originalRequest);
                    }
                }

                return Promise.reject(error);
            }

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
