import {useEffect, useRef} from 'react';

import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import {InputGroup, Spinner} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import {GrSubtractCircle} from 'react-icons/gr';

import * as styles from './office-event.module.scss';
import {PLACEHOLDER_TEXT, ROLES} from '../../../constants/constants.js';
import {useRemoveComponentContent} from '../../../hooks/component-content/component-content-hooks.js';
import {useAdminContext} from '../../../hooks/context/context-hooks.jsx';
import {useRemoveEvent} from '../../../hooks/events/event-hooks.js';
import {formatPhoneNumber} from '../../../utils/utils.js';
import 'react-datepicker/dist/react-datepicker.css';
import Calendar from '../../calendar/calendar.jsx';

/**
 * The Back Office input field to update any event-related component.
 *
 * @param {EventObject} eventObject
 * @param {boolean} isDisabled
 * @param {string} [prefix] - Optional, can be added to the beginning of field names to namespace Fields
 *
 * @return {React.ReactNode | null}
 */
const OfficeEvent = ({eventObject, isDisabled = false, prefix = ''}) => {
    const fieldName = `${prefix ? `${prefix}_` : ''}event_${eventObject?.component_content_id ?? eventObject?.event_id}`;

    const locationRef = useRef(null);
    const telephoneRef = useRef(eventObject?.event_telephone ?? null);
    const {
        touched,
        errors,
        handleChange,
        handleBlur,
        setFieldValue,
        initialValues,
        values
    } = useFormikContext();
    const {locations, roles} = useAdminContext();
    const {
        mutateAsync: removeContent,
        isPending: removeContentIsPending
    } = useRemoveComponentContent();
    const {
        mutateAsync: removeEvent,
        isPending: removeEventIsPending
    } = useRemoveEvent();

    useEffect(() => {
        if (
            !!locationRef?.current?.value
            && (locationRef?.current?.value !== values[locationRef?.current?.name])
        ) {
            // values[`${fieldName}_event_location`] = locationRef?.current?.value;
            setFieldValue(`${fieldName}_event_location`, locationRef?.current?.value).then(
                () => {
                    initialValues[`${fieldName}_event_location`] = values[`${fieldName}_event_location`];
                    values[`${fieldName}_event_location`] = locationRef?.current?.value;
                });
        }

        if (
            !!telephoneRef?.current?.value
            && (telephoneRef?.current?.value !== values[`${fieldName}_event_telephone`])
        ) {
            setFieldValue(fieldName, telephoneRef?.current?.value).then(
                () => {
                    initialValues[`${fieldName}_event_telephone`] = values[`${fieldName}_event_telephone`];
                    values[`${fieldName}_event_telephone`] = formatPhoneNumber(telephoneRef?.current?.value);
                });
        }
    }, [fieldName, handleChange, initialValues, setFieldValue, values]);

    if (!eventObject) return null;
    const hasAdminRole = roles.includes(ROLES.ADMIN);
    const hasSuperRole = roles.includes(ROLES.SUPER);

    const areCallsPending = removeEventIsPending || removeContentIsPending;

    return (
        <Form.Group
            className='mt-2 mb-5'
        >
            <InputGroup
                className={`d-flex flex-sm-column flex-md-row flex-wrap align-items-end justify-content-sm-center justify-content-md-between`}>
                <div
                    className={`d-flex flex-sm-column flex-md-row flex-nowrap align-items-end justify-content-sm-center justify-content-md-between w-100`}>
                    <div className='ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100'>
                        <Form.Label
                            htmlFor={`${fieldName}_event_location`}
                            column={true}
                        >
                            Location Name:
                        </Form.Label>
                        <Form.Select
                            ref={locationRef}
                            id={`${fieldName}_event_location`}
                            name={`${fieldName}_event_location`}
                            defaultValue={`${eventObject?.event_location}`}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched[`${fieldName}_event_location`] && !!errors[`${fieldName}_event_location`]}
                            disabled={isDisabled}
                        >
                            <option value={PLACEHOLDER_TEXT} disabled={true}>Select a Location</option>
                            {
                                locations.map(
                                    /**
                                     * @param {string} name
                                     * @param {number} index
                                     * @return {React.ReactNode}
                                     */
                                    ({location_name: name}, index) =>
                                        <option key={`${name}_${index}`} value={name}>
                                            {name}
                                        </option>
                                )
                            }
                        </Form.Select>
                    </div>

                    <div className={`ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100`}>
                        <Form.Label htmlFor={`${fieldName}_event_title`} column={true}>Event
                            title:</Form.Label>
                        <Form.Control
                            id={`${fieldName}_event_title`}
                            name={`${fieldName}_event_title`}
                            className='rounded'
                            type='input'
                            defaultValue={eventObject.event_title === PLACEHOLDER_TEXT ? '' : eventObject.event_title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched[`${fieldName}_event_title`] && !!errors[`${fieldName}_event_title`]}
                            disabled={false}
                        />
                    </div>

                    <div className={`ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100`}>
                        <Form.Label htmlFor={`${fieldName}_event_description`} column={true}>Event
                            Description:</Form.Label>
                        <Form.Control
                            id={`${fieldName}_event_description`}
                            name={`${fieldName}_event_description`}
                            className='rounded'
                            as='textarea'
                            defaultValue={eventObject.event_description === PLACEHOLDER_TEXT ? '' : eventObject.event_description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched[`${fieldName}_event_description`] && !!errors[`${fieldName}_event_description`]}
                            disabled={false}
                        />
                    </div>

                    <div className={`ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100`}>
                        <Form.Label htmlFor={`${fieldName}_event_telephone`} column={true}>Event
                            telephone:</Form.Label>
                        <Form.Control
                            ref={telephoneRef}
                            id={`${fieldName}_event_telephone`}
                            name={`${fieldName}_event_telephone`}
                            className='rounded'
                            type='tel'
                            defaultValue={formatPhoneNumber(eventObject.event_telephone)}
                            onChange={async (e) => {
                                const formatted = formatPhoneNumber(e.target.value);

                                await setFieldValue(`${fieldName}_event_telephone`, formatted);
                                telephoneRef.current.value = formatted;
                            }}
                            onBlur={handleBlur}
                            isInvalid={touched[`${fieldName}_event_telephone`] && !!errors[`${fieldName}_event_telephone`]}
                            disabled={false}
                        />
                    </div>
                </div>

                <div
                    className={`mt-2 d-flex flex-sm-column flex-md-row flex-nowrap align-items-end justify-content-sm-center justify-content-md-between w-100`}>
                    <div className='ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100'>
                        <Calendar
                            name={`${fieldName}_event_time`}
                        />
                    </div>

                    <InputGroup.Text style={{background: 'transparent', border: 'none'}}>
                        {
                            areCallsPending
                            && <Spinner style={{color: 'blue'}} animation='border' role='status'/>
                        }
                        {
                            (hasSuperRole || hasAdminRole)
                            && !areCallsPending
                            && <GrSubtractCircle
                                className={`ms-3 ${styles.subtractCircle}`}
                                style={{fontSize: '1.5rem'}}
                                onClick={async () => {
                                    if (eventObject.component_content_id) {
                                        await removeContent({contentId: eventObject.component_content_id});
                                    } else {
                                        await removeEvent({id: eventObject.event_id});
                                    }
                                }}
                            />
                        }
                    </InputGroup.Text>

                </div>

                <Form.Control.Feedback type='invalid'>
                    {errors[fieldName]}
                </Form.Control.Feedback>
            </InputGroup>
        </Form.Group>
    );
};

OfficeEvent.propTypes = {
    eventObject: PropTypes.shape({
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
    }).isRequired,
    isDisabled: PropTypes.bool,
    prefix: PropTypes.string
};

export default OfficeEvent;