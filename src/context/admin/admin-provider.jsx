import {useMemo, useState} from 'react';

import PropTypes from 'prop-types';

import AdminContext from './admin-context.jsx';

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
    const [logs, setLogs] = useState([]);

    const value = useMemo(() => ({
        pages,
        setPages,
        links,
        setLinks,
        images,
        setImages,
        pageContent,
        setPageContent,
        events,
        setEvents,
        locations,
        setLocations,
        logs,
        setLogs
    }), [pages, pageContent, links, images, events, locations, logs]);

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

AdminProvider.propTypes = {
    children: PropTypes.node.isRequired
};