import PropTypes from 'prop-types';
import {Accordion} from 'react-bootstrap';

import OfficeEvent from './office-event.jsx';
import {eventComponentPropType} from '../../../common/commonPropTypes.jsx';
import {DEFAULT_CONTENT, PLACEHOLDER_TEXT, ROLES} from '../../../constants/constants.js';
import {useAuth} from '../../../hooks/auth/use-auth.jsx';
import OfficeAdditionButton from '../office-addition-button/office-addition-button.jsx';

/**
 * A utility function that takes an array of Event Component Objects taken from the
 * response object and creates an Accordion wrapped list of office event components.
 *
 * @param {Array<EventObject>} eventContent
 * @param {function} handleClick - Async call to create a new event in the current page/section/component
 * @param {number} componentContentId - the page section component id
 * @param {boolean} isTextInputDisabled - handles the disabling of the link text input field
 * @param {string} prefix - Optional, used to differentiate between reused Fields
 * @param {boolean} showAddon - shows the add new content plus button
 *
 * @return {React.ReactNode}
 */
const OfficeEventList = ({
                             eventContent,
                             handleClick,
                             componentContentId,
                             isTextInputDisabled = false,
                             prefix = '',
                             showAddon = true
                         }) => {
    const {roles} = useAuth();
    const hasAdminRole = roles.includes(ROLES.ADMIN);
    const hasSuperRole = roles.includes(ROLES.SUPER);

    const addEventHandler = async () => {

        /**
         * @type {CreateSectionComponentContentRequestBody}
         */
        const requestBody = {
            event_title: DEFAULT_CONTENT.EVENTS.LABEL,
            event_text: DEFAULT_CONTENT.TEXT.LABEL,
            event_location: DEFAULT_CONTENT.LOCATIONS.LABEL,
            event_lat: DEFAULT_CONTENT.LOCATIONS.LAT,
            event_lng: DEFAULT_CONTENT.LOCATIONS.LNG,
            event_time: new Date(Date.now()).toISOString()
        };

        await handleClick({componentContentId: componentContentId, requestBody: requestBody});
    };

    if (hasSuperRole && !eventContent) {
        return <OfficeAdditionButton
            txt='Add a new event'
            handleOnClick={addEventHandler}
        />;
    } else if (!eventContent) {
        return null;
    }

    /**
     * A helper function that creates a list of office event objects.
     *
     * @param {Array<EventObject>} eventContent
     * @param {boolean} [isDisabled]
     * @return {Array<React.ReactNode>|null}
     */
    const generateEvents = (eventContent, isDisabled = false) => {
        if (!eventContent || eventContent.length === 0) return null;

        return showAddon
            ? eventContent.map(
                (event) =>
                    <div
                        key={`${prefix ? prefix + '_' : ''}${event?.event_text}_${event?.component_content_id ?? event?.event_id}`}>
                        <OfficeEvent
                            eventObject={event}
                            isDisabled={event.event_title === PLACEHOLDER_TEXT ? false : isDisabled}
                            prefix={prefix}
                        />
                    </div>
            )
            : eventContent.reduce(
                (accum, event) => {
                    event.event_title !== PLACEHOLDER_TEXT && accum.push(
                        <div
                            key={`${prefix ? prefix + '_' : ''}${event?.event_text}_${event?.component_content_id ?? event?.event_id}`}>
                            <OfficeEvent
                                eventObject={event}
                                isDisabled={event.event_title === PLACEHOLDER_TEXT ? false : isDisabled}
                                prefix={prefix}
                            />
                        </div>);

                    return accum;
                }, []);
    };

    return (
        <Accordion defaultActiveKey='0'>
            <Accordion.Item eventKey='0'>
                <Accordion.Header>Events</Accordion.Header>
                <Accordion.Body>

                    {generateEvents(eventContent, isTextInputDisabled)}

                    {
                        (showAddon && (hasSuperRole || hasAdminRole))
                        && <div className='mt-3'>
                            <OfficeAdditionButton
                                txt='Add a new event'
                                handleOnClick={addEventHandler}
                            />
                        </div>
                    }

                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

OfficeEventList.propTypes = {
    eventContent: PropTypes.arrayOf(eventComponentPropType).isRequired,
    handleClick: PropTypes.func.isRequired,
    componentContentId: PropTypes.number.isRequired,
    isTextInputDisabled: PropTypes.bool,
    prefix: PropTypes.string,
    showAddon: PropTypes.bool
};

export default OfficeEventList;