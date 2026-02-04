import {jwtDecode} from 'jwt-decode';

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