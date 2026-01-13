import PropTypes from 'prop-types';

import {COMPONENTS, SECTIONS} from '../constants/app-constants.js';

export const imageComponentPropType = PropTypes.shape({
    component_content_id: PropTypes.string,
    alt: PropTypes.string.isRequired,
    image_id: PropTypes.string.isRequired,
    image_text: PropTypes.string.isRequired,
    page_section_component_id: PropTypes.string,
    src: PropTypes.string.isRequired
});

export const linkComponentPropType = PropTypes.shape({
    component_content_id: PropTypes.string.isRequired,
    link_id: PropTypes.string.isRequired,
    link_text: PropTypes.string.isRequired,
    link_url: PropTypes.string.isRequired,
    page_section_component_id: PropTypes.string.isRequired
});

export const textComponentPropType = PropTypes.shape({
    component_content_id: PropTypes.string.isRequired,
    page_section_component_id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    text_content_id: PropTypes.string.isRequired
});

export const eventComponentPropType = PropTypes.shape({
    component_content_id: PropTypes.string,
    page_section_component_id: PropTypes.string,
    event_id: PropTypes.string.isRequired,
    event_title: PropTypes.string.isRequired,
    event_description: PropTypes.string.isRequired,
    event_location: PropTypes.string.isRequired,
    event_address: PropTypes.string.isRequired,
    event_city: PropTypes.string.isRequired,
    event_state: PropTypes.string.isRequired,
    event_zip: PropTypes.string.isRequired,
    event_telephone: PropTypes.string.isRequired,
    event_lat: PropTypes.number.isRequired,
    event_lng: PropTypes.number.isRequired,
    event_time: PropTypes.string.isRequired
});

export const locationComponentPropType = PropTypes.shape({
    component_content_id: PropTypes.string,
    page_section_component_id: PropTypes.string,
    location_id: PropTypes.string.isRequired,
    location_name: PropTypes.string.isRequired,
    location_address: PropTypes.string.isRequired,
    location_city: PropTypes.string.isRequired,
    location_state: PropTypes.string.isRequired,
    location_zip: PropTypes.string.isRequired,
    location_telephone: PropTypes.string.isRequired,
    location_lat: PropTypes.number.isRequired,
    location_lng: PropTypes.number.isRequired
});

export const componentCommonPropType = PropTypes.shape({
    component_name: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(imageComponentPropType),
    links: PropTypes.arrayOf(linkComponentPropType),
    textContent: PropTypes.arrayOf(textComponentPropType),
    events: PropTypes.arrayOf(eventComponentPropType),
    locations: PropTypes.arrayOf(locationComponentPropType)
}).isRequired;

export const componentContentWithEvents = PropTypes.shape({
    components: PropTypes.arrayOf(componentCommonPropType).isRequired,
    page_section_id: PropTypes.string.isRequired,
    section_name: PropTypes.string.isRequired,
    priority: PropTypes.number.isRequired,
    show_section: PropTypes.bool.isRequired
});

export const sectionContentPropType = PropTypes.shape({
    components: PropTypes.arrayOf(
        PropTypes.shape({
            component_name: PropTypes.oneOf(Object.values(COMPONENTS)).isRequired,
            images: PropTypes.arrayOf(imageComponentPropType),
            links: PropTypes.arrayOf(linkComponentPropType),
            textContent: PropTypes.arrayOf(textComponentPropType)
        })
    ).isRequired,
    page_section_id: PropTypes.string,
    section_name: PropTypes.oneOf(Object.values(SECTIONS)).isRequired,
    show_section: PropTypes.bool.isRequired
});
