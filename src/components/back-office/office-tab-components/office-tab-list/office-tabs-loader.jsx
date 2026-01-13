import {useEffect} from 'react';

import PropTypes from 'prop-types';

import {useGetAllPageContent, useGetPageContent} from '../../../../hooks/api-hooks.js';
import {useAdminContext} from '../../../../hooks/context/context-hooks.jsx';
import {useGetEvents} from '../../../../hooks/events/event-hooks.js';
import {useGetImages} from '../../../../hooks/images/image-hooks.jsx';
import {useGetSiteLinks} from '../../../../hooks/links/link-hooks.js';
import {useGetLocations} from '../../../../hooks/locations/location-hooks.js';

/**
 * A wrapper component that fetches data for office tab components.
 *
 * @param {React.ReactNode} children
 *
 * @return {React.JSX.Element}
 */
const OfficeTabsLoader = ({children}) => {
    const {isSuccess: linkSuccess, data: {data: {data: linkResData}}} = useGetSiteLinks();
    const {isSuccess: pageSuccess, data: pageData} = useGetPageContent();
    const {isSuccess: allContentSuccess, data: allPageContent} = useGetAllPageContent();
    const {isSuccess: imageSuccess, data: imageData} = useGetImages();
    const {isSuccess: eventSuccess, data: events} = useGetEvents();
    const {isSuccess: locationSuccess, data: locations} = useGetLocations();

    const {
        setLinks,
        setPages,
        setImages,
        setEvents,
        setPageContent,
        setLocations
    } = useAdminContext();

    useEffect(() => {
        const pages = pageData?.data?.pages ?? [];
        const images = imageData?.data?.data ?? [];

        if (linkSuccess && linkResData) {
            setLinks(linkResData);
        }
        if (pageSuccess && pages) {
            setPages(pages);
        }
        if (imageSuccess && images) {
            setImages(images);
        }
        if (eventSuccess && events) {
            setEvents(events);
        }
        if (allContentSuccess && allPageContent) {
            setPageContent(allPageContent);
        }
        if (locationSuccess && locations) {
            setLocations(locations);
        }
    }, [
        allContentSuccess,
        allPageContent,
        events,
        eventSuccess,
        locations,
        locationSuccess,
        setLocations,
        imageData?.data?.data,
        imageSuccess,
        linkResData,
        linkSuccess,
        pageData?.data?.pages,
        pageSuccess,
        setEvents,
        setImages,
        setLinks,
        setPageContent,
        setPages
    ]);

    return <>
        {children}
    </>;
};

OfficeTabsLoader.propTypes = {
    children: PropTypes.node.isRequired
};

export default OfficeTabsLoader;