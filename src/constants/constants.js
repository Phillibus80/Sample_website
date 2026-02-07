export const apiURL = '/api';

export const API_ROUTE_CONST = {
    PAGES: '/pages',
    SECTIONS: '/sections',
    PAGES_SECTIONS: '/pages_sections',
    COMPONENT_CONTENT: '/pages_sections_components_content',
    COMPONENTS: '/components',
    LINKS: '/links',
    EVENTS: '/events',
    LOCATIONS: '/locations',
    USERS: '/users',
    LOGIN: '/login',
    LOGOUT: '/logout',
    IMAGES: '/images',
    LOGS: '/logs',
    SEND_EMAIL: '/send_email',
};

export const QUERY_STATUS = {
    SUCCESS: 'success'
};

export const emailRegExp = /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const PLACEHOLDER_TEXT = 'NULL';
export const IMAGE_SRC_PLACEHOLDER_TEXT = '/NULL';

export const DEFAULT_CONTENT = {
    IMAGE: {
        LABEL: 'Default Image',
        SRC: '/default',
        ALT: 'Default Alt'
    },
    LINK: {
        LABEL: 'Default link',
        SRC: 'www.default.com'
    },
    TEXT: {
        LABEL: 'Default text'
    },
    LOCATIONS: {
        LABEL: 'Default Location',
        ADDRESS: 'Default Address',
        LAT: 29.4231,
        LNG: -98.4861
    },
    EVENTS: {
        LABEL: 'Default Event'
    }
};

/**
 * Correlates to the values of the JS Doc Type ToastTypes
 * @type {{PRIMARY: string, WARNING: string, ERROR: string}}
 */
export const TOAST_TYPES = {
    PRIMARY: 'primary',
    WARNING: 'warn',
    ERROR: 'error'
};

/**
 * @type {{USER: Role, EMAIL: Role, ADMIN: Role, SUPER: Role}}
 */
export const ROLES = {
    USER: 'USER',
    EMAIL: 'EMAIL',
    ADMIN: 'ADMIN',
    SUPER: 'SUPER'
};

export const FORM_ERROR_TEXT = {
    CREATE_PAGE_SECTION_SELECTION_TEXT: 'Must select a section.',
    CREATE_PAGE_NAME_TEXT: 'The page must have a name.'
};