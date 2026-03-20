import {useState} from 'react';

import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import {Accordion} from 'react-bootstrap';

import OfficeEvent from './office-event.jsx';
import {eventComponentPropType} from '../../../common/commonPropTypes.jsx';
import {DEFAULT_CONTENT, PLACEHOLDER_TEXT, ROLES} from '../../../constants/constants.js';
import {useAuth} from '../../../hooks/auth/use-auth.jsx';
import {useAdminContext} from '../../../hooks/context/context-hooks.jsx';
import OfficeAdditionButton from '../office-addition-button/office-addition-button.jsx';
import OfficeDraftRow from '../office-draft-row/office-draft-row.jsx';

const DRAFT_FIELDS = [
    'event_location',
    'event_title',
    'event_description',
    'event_telephone',
    'event_time'
];

const isRealValue = (val) =>
    typeof val === 'string'
    && val.trim() !== ''
    && val !== PLACEHOLDER_TEXT
    && val !== DEFAULT_CONTENT.EVENTS.LABEL
    && val !== DEFAULT_CONTENT.TEXT.LABEL
    && val !== DEFAULT_CONTENT.LOCATIONS.LABEL;

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

    const {locations} = useAdminContext();
    const {values, setFieldValue} = useFormikContext();
    const [drafts, setDrafts] = useState([]);
    const [pendingDraft, setPendingDraft] = useState(null);

    const draftFieldBase = (key) => `${prefix ? `${prefix}_` : ''}event_${key}`;

    const clearDraftFields = (key) => {
        const base = draftFieldBase(key);
        DRAFT_FIELDS.forEach(f => setFieldValue(`${base}_${f}`, undefined, false));
    };

    const addEventHandler = async () => {
        const draftKey = `draft_${Date.now()}`;
        const base = draftFieldBase(draftKey);
        await setFieldValue(`${base}_event_location`, PLACEHOLDER_TEXT, false);
        await setFieldValue(`${base}_event_title`, '', false);
        await setFieldValue(`${base}_event_description`, '', false);
        await setFieldValue(`${base}_event_telephone`, '', false);
        await setFieldValue(`${base}_event_time`, new Date(Date.now()).toISOString(), false);
        setDrafts(prev => [...prev, {draftKey}]);
    };

    const discardDraft = (key) => {
        clearDraftFields(key);
        setDrafts(prev => prev.filter(d => d.draftKey !== key));
    };

    const isDraftValid = (key) => {
        const base = draftFieldBase(key);
        return isRealValue(values[`${base}_event_title`])
            && isRealValue(values[`${base}_event_location`]);
    };

    const saveDraft = async (key) => {
        const base = draftFieldBase(key);
        const locationName = values[`${base}_event_location`];
        const matchingLocation = locations?.find(l => l.location_name === locationName);

        /**
         * @type {CreateSectionComponentContentRequestBody}
         */
        const requestBody = {
            event_title: values[`${base}_event_title`],
            event_text: values[`${base}_event_description`] || values[`${base}_event_title`],
            event_location: locationName,
            event_lat: matchingLocation?.location_lat ?? DEFAULT_CONTENT.LOCATIONS.LAT,
            event_lng: matchingLocation?.location_lng ?? DEFAULT_CONTENT.LOCATIONS.LNG,
            event_time: values[`${base}_event_time`] ?? new Date(Date.now()).toISOString()
        };

        setPendingDraft(key);
        try {
            await handleClick({componentContentId: componentContentId, requestBody: requestBody});
            clearDraftFields(key);
            setDrafts(prev => prev.filter(d => d.draftKey !== key));
        } finally {
            setPendingDraft(null);
        }
    };

    const noDrafts = drafts.length === 0;

    if (hasSuperRole && !eventContent && noDrafts) {
        return <OfficeAdditionButton
            txt='Add a new event'
            handleOnClick={addEventHandler}
        />;
    } else if (!eventContent && noDrafts) {
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
                        drafts.map(({draftKey}) =>
                            <OfficeDraftRow
                                key={draftKey}
                                isValid={isDraftValid(draftKey)}
                                isPending={pendingDraft === draftKey}
                                onSave={() => saveDraft(draftKey)}
                                onDiscard={() => discardDraft(draftKey)}
                            >
                                <OfficeEvent
                                    eventObject={{
                                        component_content_id: null,
                                        event_id: draftKey,
                                        event_title: '',
                                        event_description: '',
                                        event_location: PLACEHOLDER_TEXT,
                                        event_address: '',
                                        event_city: '',
                                        event_state: '',
                                        event_zip: '',
                                        event_telephone: '',
                                        event_lat: DEFAULT_CONTENT.LOCATIONS.LAT,
                                        event_lng: DEFAULT_CONTENT.LOCATIONS.LNG,
                                        event_time: new Date(Date.now()).toISOString()
                                    }}
                                    isDisabled={false}
                                    prefix={prefix}
                                    hideSubtractBtn
                                />
                            </OfficeDraftRow>
                        )
                    }

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
