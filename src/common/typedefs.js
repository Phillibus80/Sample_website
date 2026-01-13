// Section

/**
 * @typedef {object} Section
 *
 * @property {Array<Component>} components - array containing component Objects
 * @property {string} page_section_id - the id of the page section database table
 * @property {string} section_name - the section name
 * @property {number} priority - the order in which the section should appear on the screen
 * @property {boolean} show_section - a flag to determine if the section is visible to the user
 */

/**
 * @typedef {object} Component
 *
 * @property {string} component_name - the name of the component
 * @property {Array<ImageObject>} [images] - a list of image objects
 * @property {Array<LinkObject>} [links] - a list of link objects
 * @property {Array<TextContentObject>} [textContent] - a list of text content objects
 * @property {Array<EventObject>} [events] - a list of event objects
 * @property {Array<LocationObject>} [locations] - a list of location objects
 */

/**
 * @typedef {object} ImageObject
 *
 * @property {string} [component_content_id] - the id from the component content table
 * @property {string} alt - image alt text
 * @property {string} image_id - the id of the image according to the image table
 * @property {string} image_text - caption text for the image
 * @property {string} [page_section_component_id] - the id from the page section component table
 * @property {string} src - the image url
 */

/**
 * @typedef {object} LinkObject
 *
 * @property {string} component_content_id - the id from the component content table
 * @property {string} link_id - the id of the link from the link table
 * @property {string} link_text - the text of the link
 * @property {string} link_url - the url of the link
 * @property {string} page_section_component_id - the id from the page section component table
 */

/**
 * @typedef {object} TextContentObject
 *
 * @property {string} component_content_id - the id from the component content table
 * @property {string} page_section_component_id - the id from the page section component table
 * @property {string} text - the text content for the component
 * @property {string} text_content_id - the id from the text content table
 */

/**
 * @typedef {object} LocationObject
 *
 * @property {string} [component_content_id] - the id from the component content table
 * @property {string} [page_section_component_id] - the id from the page section component table
 * @property {string} location_id - the id of the location
 * @property {string} location_name - the name of the location
 * @property {string} location_address - the text for the first line of the address (number and street)
 * @property {string} location_city - the text for the city
 * @property {string} location_state - the text for the state
 * @property {string} location_zip - the text for the zip code
 * @property {string} location_telephone - the text for the telephone number
 * @property {number} location_lat - the lat of the location, used by the mapping components
 * @property {number} location_lng - the lng of the location, used by the mapping components
 */

/**
 * @typedef {object} EventObject
 *
 * @property {string} [component_content_id] - the id from the component content table
 * @property {string} [page_section_component_id] - the id from the page section component table
 * @property {string} event_id - the id of the event
 * @property {string} event_title - text for the event title
 * @property {string} event_description - text for the event body
 * @property {string} event_location - the name of the location
 * @property {string} event_address - the text for the first line of the address (number and street)
 * @property {string} event_city - the text for the city
 * @property {string} event_state - the text for the state
 * @property {string} event_zip - the text for the zip code
 * @property {string} event_telephone - the text for the telephone number
 * @property {number} event_lat - the lat of the event, used by the mapping components
 * @property {number} event_lng - the lng of the event, used by the mapping components
 * @property {string} event_time - the time of the scheduled event
 */

// Component headerContent types

/**
 * @typedef {'images'|'links'|'textContent'|'events'} ContentOptions
 */

/**
 * @typedef {object} ExtractedComponentConent
 *
 * @property {Array<ImageObject>} [images] - list of image objects
 * @property {Array<LinkObject>} [links] - list of link objects
 * @property {Array<TextContentObject>} [textContent] - text headerContent
 * @property {Array<EventObject>} [events] - list of events
 */

/**
 * @typedef {'USER' | 'ADMIN' | 'EMAIL' | 'SUPER'} Role
 */

/**
 * @typedef {'primary' | 'warn' | 'error'} ToastTypes
 */