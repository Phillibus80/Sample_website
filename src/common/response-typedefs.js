/**
 * @typedef {object} PageResObject
 *
 * @property {string} page
 * @property {string} page_id
 * @property {Array<Section>} sections
 */

/**
 * @typedef {object} PageListResObject
 *
 * @property {string} NAME
 * @property {string} ID
 */

/**
 * @typedef {'success' | 'pending' | 'error'} ReactQueryResStatus
 */

/**
 * @typedef {object} ReactQueryPageResObject
 *
 * @property {boolean} isLoading
 * @property {boolean} isError
 * @property {boolean} isSuccess
 * @property {boolean} isFetching
 * @property {{data: PageResObject}} data
 * @property {ReactQueryResStatus} status
 * @property {object} [error]
 */

//----Sections----//
/**
 * @typedef {object} SectionObject
 *
 * @property {string} ID
 * @property {string} NAME
 */

/**
 * @typedef {object} SectionResObject
 *
 * @property {number} count
 * @property {Array<SectionObject>} data
 */

/**
 * @typedef {object} ReactQuerySectionResObject
 *
 * @property {boolean} isLoading
 * @property {boolean} isError
 * @property {boolean} isSuccess
 * @property {boolean} isFetching
 * @property {{data: {data: SectionResObject }}} data
 * @property {ReactQueryResStatus} status
 * @property {object} [error]
 */

//----Components----//
/**
 * @typedef {object} ComponentObject
 *
 * @property {string} ID
 * @property {string} NAME
 */

/**
 * @typedef {object} ComponentResObject
 *
 * @property {number} count
 * @property {Array<ComponentObject>} data
 */

/**
 * @typedef {object} ReactQueryComponentResObject
 *
 * @property {boolean} isLoading
 * @property {boolean} isError
 * @property {boolean} isSuccess
 * @property {boolean} isFetching
 * @property {{data: {data: ComponentResObject }}} data
 * @property {ReactQueryResStatus} status
 * @property {object} [error]
 */

//----Links----//
/**
 * @typedef {object} LinkListItem
 *
 * @property {string} ID link db id
 * @property {string} NAME link name from the db
 */

/**
 * @typedef {object} LinkResObject
 *
 * @property {string} id link db id
 * @property {string} title displayed text for the link
 * @property {string} url the link url
 * @property {section} [section_name] only returned when filtering by
 * section name (path param of GET links)
 */

/**
 * @typedef {object} ReactQueryLinkResObject
 *
 * @property {boolean} isLoading
 * @property {boolean} isError
 * @property {boolean} isSuccess
 * @property {boolean} isFetching
 * @property {{data: Array<LinkResObject>}} data
 * @property {ReactQueryResStatus} status
 * @property {object} [error]
 */

// ----- User
/**
 * @typedef {object} UserResObject
 *
 * @property {number} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {Role} [role]
 * @property {Array<Role>} [permissions]
 * @property {string} username
 * @property {string} password
 * @property {string} createdOn
 * @property {string} lastModifiedOn
 */

/**
 * @typedef {object} ReactQueryUserResObject
 *
 * @property {boolean} isLoading
 * @property {boolean} isError
 * @property {boolean} isSuccess
 * @property {boolean} isFetching
 * @property {{data: {users: Array<UserResObject>}} | {data: {roles: Array<Role>}}} data
 * @property {ReactQueryResStatus} status
 * @property {object} [error]
 */

// ----- Events

/**
 * @typedef {object} EventRawObject
 *
 * @property {string} id event db id
 * @property {string}  title displayed text (title) for the event
 * @property {string} description displayed text (body) for the event
 * @property {string} location displayed text (title) for the event
 * @property {string} address the first line of the event's address
 * @property {string} city the event city
 * @property {string} state the event state
 * @property {string} zip the event zip
 * @property {string} telephone the event telephone
 * @property {string} lat the event lat
 * @property {string} lng the event lng
 * @property {string} event_time the time of the scheduled event
 */

/**
 * @typedef {object} ReactQueryEventResObject
 *
 * @property {boolean} isLoading
 * @property {boolean} isError
 * @property {boolean} isSuccess
 * @property {boolean} isFetching
 * @property {{data: Array<EventObject>}} data
 * @property {ReactQueryResStatus} status
 * @property {object} [error]
 */

// ----- Locations

/**
 * @typedef {object} LocationRawObject
 *
 * @property {string} id location db id
 * @property {string} name name of the location
 * @property {string} address the first line of the location's address
 * @property {string} city the location city
 * @property {string} state the location state
 * @property {string} zip the location zip
 * @property {string} telephone the location telephone
 * @property {string} lat the location lat
 * @property {string} lng the location lng
 * @property {string} location_time the time of the scheduled location
 */

/**
 * @typedef {object} ReactQueryLocationResObject
 *
 * @property {boolean} isLoading
 * @property {boolean} isError
 * @property {boolean} isSuccess
 * @property {boolean} isFetching
 * @property {{data: Array<LocationObject>}} data
 * @property {ReactQueryResStatus} status
 * @property {object} [error]
 */