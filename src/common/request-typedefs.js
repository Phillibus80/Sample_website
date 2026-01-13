// -------------- Section Content -------------- //

/**
 * @typedef {object} UpdateSectionRequestBody
 *
 *  @property {string} [page_name] - Optional, the page of the section to be updated
 *  @property {string} [section_name] - Optional, the name of the section to be updated
 *  @property {boolean} [show_section] - Optional, the switch that controls the visibility of the section
 *  @property {number} [priority] - Optional, used to dictate where the section appears on the page
 */


// -------------- Component Content -------------- //

/**
 * @typedef {object} CreateSectionComponentContentRequestBody
 * All fields are Optional. Whenever link_text is sent, then link_url must also be present.
 * When image_src is sent, then image_text and image_alt are required.
 * When event_title is sent, then event_text, event_time, event_location, event_lat, and event_lng are required.
 *
 * @property {string} [link_text] - Optional, but if included link_url is required
 * @property {string} [link_url]
 * @property {string} [image_text] - Optional, but if included image_src and image_alt are required
 * @property {string} [image_src]
 * @property {string} [image_alt]
 * @property {string} [text_content]
 * @property {string} [event_title] - Optional, but if included all remaining fields become required
 * @property {string} [event_text]
 * @property {string} [event_location]
 * @property {number | '0.0'} [event_lng]
 * @property {number | '0.0'} [event_lat]
 * @property {string} [event_time] - The time of the event scheduled
 */

/**
 * @typedef {object} UpateComponentContentRequestBody
 *
 * @property {string} [text_content] - Optional, the component's new text content
 * @property {string} [link_url] - Optional, the component's new url
 * @property {string} [image_url] - Optional, the component's new image src
 * @property {string} [event_title] - Optional, the event's new title
 * @property {string} [event_description] - Optional, the event's main text body
 * @property {string} [event_location] - Optional, the event's location's name, maps to a LOCATION object
 * @property {string} [event_time] - The time of the event scheduled
 */

/**
 * @typedef {object} CreateLocationContentRequestBody
 * For fields that are not required, simply use the constant PLACEHOLDER_TEXT
 *
 * @property {string} name - The name of the location
 * @property {string} address - The first line of the address of the event (number and street)
 * @property {string} city - The event city
 * @property {string} state - The event state
 * @property {string} zip - The event zip code
 * @property {string} telephone - The event telephone
 * @property {number | '0.0' } [lat] - The event latitude, used in the mapping components
 * @property {number | '0.0' } [lng] - The event longitude, used in the mapping components
 */

/**
 * @typedef {object} UpdateLocationContentRequestBody
 *
 * @property {string} [name] - The name of the location
 * @property {string} [address] - The first line of the address of the event (number and street)
 * @property {string} [city] - The event city
 * @property {string} [state] - The event state
 * @property {string} [zip] - The event zip code
 * @property {string} [telephone] - The event telephone
 * @property {number | '0.0' } [lat] - The event latitude, used in the mapping components
 * @property {number | '0.0' } [lng] - The event longitude, used in the mapping components
 */

/**
 * @typedef {object} CreateEventContentRequestBody
 * For fields that are not required, simply use the constant PLACEHOLDER_TEXT
 *
 * @property {string} title - The event title
 * @property {string} [description] - The body text of the event
 * @property {string} location - The name of the location
 * @property {string} [address] - The first line of the address of the event (number and street)
 * @property {string} [city] - The event city
 * @property {string} [state] - The event state
 * @property {string} [zip] - The event zip code
 * @property {string} [telephone] - The event telephone
 * @property {number | '0.0' } lat - The event latitude, used in the mapping components
 * @property {number | '0.0' } lng - The event longitude, used in the mapping components
 * @property {string} event_time - The time of the event scheduled
 */

/**
 * @typedef {object} UpdateEventContentRequestBody
 *
 * @property {string} [event_title] - The event title
 * @property {string} [event_description] - The body text of the event
 * @property {string} [event_location] - The name of the location
 * @property {string} [event_time] - The time of the event scheduled
 */

/**
 * @typedef {object} UpdateLinkContentRequestBody
 *
 * @property {string} link_url - The link url
 */

/**
 * @typedef {object} UpdateTextContentRequestBody
 *
 * @property {string} text_content - The new text content
 */


// -------------- Event Content -------------- //

/**
 * @typedef {object} UpdateEventRequestBody
 * For fields that are not required, simply use the constant PLACEHOLDER_TEXT
 *
 * @property {string} [title] - The event title
 * @property {string} [description] - The body text of the event
 * @property {string} [location] - The name of the location
 * @property {string} [address] - The first line of the address of the event (number and street)
 * @property {string} [city] - The event city
 * @property {string} [state] - The event state
 * @property {string} [zip] - The event zip code
 * @property {string} [telephone] - The event telephone
 * @property {number | '0.0' } lat - The event latitude, used in the mapping components
 * @property {number | '0.0' } lng - The event longitude, used in the mapping components
 * @property {string} event_time - UTC time of the scheduled event
 */

// -------------- Users -------------- //

/**
 * @typedef {object} CreateUserObject
 *
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} username
 * @property {Array<Role>} permissions
 */
