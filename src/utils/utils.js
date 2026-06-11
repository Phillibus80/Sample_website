import {jwtDecode} from 'jwt-decode';

import {LOG_CHART_TIME_UNITS} from '../constants/constants.js';

/**
 * A utility function to convert a string into title case
 *
 * @param {string} str - the string to convert
 * @return {string} - either the title cased string or an empty string
 */
export const toTitleCase = str => {
    if (!str) return '';

    const strContent = str
        .replaceAll('-', ' ')
        .replaceAll('_', ' ');

    return strContent.split(' ').reduce((accum, current) => {
        const [firstLetter, ...rest] = current.toLowerCase().split('');
        const capFirstLetter = firstLetter.toUpperCase();

        accum.push([capFirstLetter, ...rest].join(''));
        return accum;
    }, []).join(' ');
};

/**
 * A utility function to convert a string into kebab case.
 *
 * @param {string} str - string to convert to kebab case
 * @return {string} the kebab case string
 */
export const toKebabCase = str => {
    if (!str) return '';

    return str.toLowerCase().replaceAll(' ', '-');
};

/**
 * A utility function that converts strings written in camelcase to titlecase.
 *
 * @param {string} str
 * @return {string}
 */
export const convertCamelCaseToTitleCase = str => {
    if (!str) return '';

    return str
        // Insert space before each uppercase letter
        .replace(/([A-Z])/g, ' $1')
        // Capitalize the first letter of each word
        .replace(/^./, (char) => char.toUpperCase())
        .trim();
};

/**
 * A utility function to determine if an object is empty
 * @param {object} obj - object to search
 *
 * @return {boolean} - a flag that yields true if the object has properties and false if it does not
 */
export const isEmpty = obj => {
    if (!obj) return true;

    if (typeof obj !== 'object') return true;
    return Object.keys(obj).length === 0;
};

/**
 * A utility function to extract the component details from a section.
 *
 * @param {Section} sectionContent - section content object
 * @param {string} componentTitle - the title of the component to extract
 * @param {Array<ContentOptions>} contentArray - an array of headerContent types to extract
 *
 * @return {ExtractedComponentConent | null} - the object containing all the headerContent for the component
 */
export const extractComponentsFromSection = (sectionContent, componentTitle, contentArray) => {
    if (!sectionContent || isEmpty(sectionContent)) return null;

    const {components} = sectionContent;

    const content = components.find(
        ({component_name}) => component_name === componentTitle);

    const contentResult = Object.entries(content).reduce((accum, [key, val]) => {
        if (contentArray.includes(key)) {
            accum[key] = val;
        }
        return accum;
    }, {});

    return !isEmpty(contentResult) ? contentResult : null;
};

/**
 * Takes a string representation of a US phone number and
 * formats to have the area code in parentheses and a dash between the sections
 * i.e. (999) 999-9999
 *
 * @param {string} value
 * @return {string}
 */
export const formatPhoneNumber = (value) => {
    if (!value) return '';

    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Format as (555) 555-5555
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

/**
 * A utility function that acts as the opposite to the formatPhoneNumber function.
 * This function strips out the parentheses, dash, and added spaces to return a single string
 * i.e.  9999999999
 *
 * @param {string} str phone number string that has been formatted with the formatPhoneNumber function
 * @return {string}
 */
export const removePhoneFormatting = (str) => {
    if (!str) return '';

    return str
        .replaceAll('(', '')
        .replaceAll(')', '')
        .replaceAll('-', '')
        .replaceAll(' ', '');
};

//--------Security--------//
/**
 * A function that takes a JWT and decodes it for the UI.
 *
 * IMPORTANT: This does NOT verify the token's signature!
 * Token verification MUST happen on the server.
 * This is only for reading the token payload on the client.
 *
 * @param {string} token - the JWT token sent from the server
 * @return {{user: object, exp: number, iat: number, jti: string, iss: string, aud: string}|null} - the decoded payload or null if invalid */
export const decodeJWT = (token) => {
    if (!token || typeof token !== 'string') {
        console.error('Invalid token provided to decodeJWT');
        return null;
    }

    try {
        /** @type {{user?: object, exp?: number, iat?: number, jti?: string, iss?: string, aud?: string}} */
        const decoded = jwtDecode(token);

        if (!decoded.user || !decoded.exp) {
            console.error('Token missing required claims');
            return null;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
            console.warn('Token is expired');
            return null;
        }

        return decoded;
    } catch (error) {
        console.error('Error decoding JWT:', error.message);
        return null;
    }
};

/**
 * Check if the JWT token is expired
 *
 * @param {string} token - JWT token
 * @return {boolean} - true if expired, false if valid
 */
export const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const decoded = jwtDecode(token);
        if (!decoded.exp) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        console.error(error);
        return true;
    }
};

/**
 * Get time until the token expires in seconds
 *
 * @param {string} token - JWT token
 * @return {number|null} - seconds until expiration, or null if invalid
 */
export const getTokenTimeRemaining = (token) => {
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        if (!decoded.exp) return null;

        const currentTime = Math.floor(Date.now() / 1000);
        const timeRemaining = decoded.exp - currentTime;

        return timeRemaining > 0 ? timeRemaining : 0;
    } catch (error) {
        console.error(error);
        return null;
    }
};

/**
 * A utility function that enters either a string or object value into Session Storage.
 *
 * @param {string} key
 * @param {string | object} value
 *
 * @return {null}
 */
export const setSessionStorage = (key, value) => {
    if (!key || !value) return null;

    sessionStorage.setItem(key, JSON.stringify(value));
};

/**
 * A utility function that returns a value from Session Storage by its key.  If no value is found, returns null.
 *
 * @param {string} key
 *
 * @return {any|null}
 */
export const getFromSessionStorage = (key) => {
    if (!key) return null;

    const value = sessionStorage.getItem(key);
    if (!value) return null;

    try {
        return JSON.parse(value);
    } catch (err) {
        console.error('Getting key from Session Storage returned with:: ', err);
        return null;
    }
};

export const clearAuthFromSessionStorage = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('csrfToken');
    sessionStorage.removeItem('loggedInUserName');
    sessionStorage.removeItem('roles');
};

export const destroyPhpSession = () => {
    document.cookie = 'PHPSESSID=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

/**
 * Save authentication data to session storage
 *
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @param {string} username
 * @param {Array<string>} roles
 */
export const saveAuthToSessionStorage = (bearerToken, csrfToken, username, roles) => {
    setSessionStorage('authToken', bearerToken);
    setSessionStorage('csrfToken', csrfToken);
    setSessionStorage('loggedInUserName', username);
    setSessionStorage('roles', roles);
};

/**
 * Get all authentication data from session storage
 *
 * @return {{bearerToken: string|null, csrfToken: string|null, username: string|null, roles: Array<string>}}
 */
export const getAuthFromSessionStorage = () => {
    return {
        bearerToken: getFromSessionStorage('authToken'),
        csrfToken: getFromSessionStorage('csrfToken'),
        username: getFromSessionStorage('loggedInUserName'),
        roles: getFromSessionStorage('roles') || []
    };
};

// ─── Log chart shared utilities ──────────────────────────────────────────────

/**
 * Capitalises the first character of a string.
 *
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => str[0].toUpperCase() + str.slice(1);

/**
 * Returns a YYYY-MM-DD date string for N days before today,
 * using the local calendar (not UTC) to avoid off-by-one timezone errors.
 *
 * @param {number} daysAgo
 * @returns {string}
 */
export const getLocalDateNDaysAgo = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/** Returns today's date as YYYY-MM-DD (local calendar). */
export const getLocalTodayString = () => getLocalDateNDaysAgo(0);

/**
 * Maps each PAST_N time-unit constant to the number of days ago for the
 * window cutoff (inclusive: PAST_7 → last 7 days = 6 days ago + today).
 *
 * @type {Object<string, number>}
 */
export const LOG_CHART_DAYS_AGO_MAP = {
    [LOG_CHART_TIME_UNITS.PAST_7]: 6,
    [LOG_CHART_TIME_UNITS.PAST_30]: 29,
    [LOG_CHART_TIME_UNITS.PAST_60]: 59,
    [LOG_CHART_TIME_UNITS.PAST_90]: 89,
};

/**
 * Dropdown option list shared by all log charts.
 *
 * @type {Array<{value: string, label: string}>}
 */
export const LOG_CHART_TIME_UNIT_OPTIONS = [
    {value: LOG_CHART_TIME_UNITS.TODAY, label: 'Today'},
    {value: LOG_CHART_TIME_UNITS.PAST_7, label: 'Past 7 Days'},
    {value: LOG_CHART_TIME_UNITS.PAST_30, label: 'Past 30 Days'},
    {value: LOG_CHART_TIME_UNITS.PAST_60, label: 'Past 60 Days'},
    {value: LOG_CHART_TIME_UNITS.PAST_90, label: 'Past 90 Days'},
];

/**
 * Returns the subset of logs that fall within the selected time window.
 *
 * @param {Array}  logs
 * @param {string} timeUnit  One of the LOG_CHART_TIME_UNITS values.
 * @returns {Array}
 */
export const filterLogsByWindow = (logs, timeUnit) => {
    if (timeUnit === LOG_CHART_TIME_UNITS.TODAY) {
        const today = getLocalTodayString();
        return logs.filter((log) => log.created_on?.split(' ')[0] === today);
    }
    const cutoff = getLocalDateNDaysAgo(LOG_CHART_DAYS_AGO_MAP[timeUnit]);
    return logs.filter((log) => {
        const datePart = log.created_on?.split(' ')[0];
        return datePart != null && datePart >= cutoff;
    });
};

/**
 * Extracts the base route name from a full endpoint string.
 * e.g. "PATCH /images/@image_id" → "images"
 *
 * @param {string} endpoint
 * @returns {string}
 */
export const extractBaseRoute = (endpoint) => {
    const parts = endpoint.split(' ');
    if (parts.length < 2) return endpoint;
    const segments = parts[1].split('/').filter(Boolean);
    return segments[0] ?? endpoint;
};

/**
 * Formats a base route name for display.
 * e.g. "pages_sections" → "Pages Sections"
 *
 * @param {string} route
 * @returns {string}
 */
export const formatBaseRoute = (route) =>
    route.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());