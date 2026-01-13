import {useState} from 'react';

import PropTypes from 'prop-types';

import AdminContext from './admin-context.jsx';
import {getFromSessionStorage} from '../../utils/utils.js';

/**
 * A Context provider for the Admin section of the application.
 *
 * @param {React.ReactNode} children
 * @return {React.JSX.Element}
 * @constructor
 */
export const AdminProvider = ({children}) => {
    const [pages, setPages] = useState([]);
    const [pageContent, setPageContent] = useState([]);
    const [links, setLinks] = useState([]);
    const [images, setImages] = useState([]);
    const [events, setEvents] = useState([]);
    const [locations, setLocations] = useState([]);
    const [bearerToken, setBearerToken] = useState(getFromSessionStorage('authToken') || '');
    const [loggedInUserName, setLoggedInUser] = useState('');
    const [roles, setRoles] = useState([]);
    const [csrfToken, setCsrfToken] = useState('');

    return (
        <AdminContext.Provider value={{
            pages,
            setPages,
            links,
            setLinks,
            images,
            setImages,
            bearerToken,
            loggedInUserName,
            setLoggedInUser,
            setBearerToken,
            pageContent,
            setPageContent,
            events,
            setEvents,
            locations,
            setLocations,
            roles,
            setRoles,
            csrfToken,
            setCsrfToken
        }}>
            {children}
        </AdminContext.Provider>
    );
};

AdminProvider.propTypes = {
    children: PropTypes.node.isRequired
};