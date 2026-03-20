import {Field, useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import {InputGroup, Spinner} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import {GrSubtractCircle} from 'react-icons/gr';

import * as styles from './office-event.module.scss';
import {eventComponentPropType} from '../../../common/commonPropTypes.jsx';
import {PLACEHOLDER_TEXT, ROLES} from '../../../constants/constants.js';
import {useAuth} from '../../../hooks/auth/use-auth.jsx';
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
 * @param {boolean} [hideSubtractBtn] - Optional, hide subtract button completely (used for drafts)
 *
 * @return {React.ReactNode | null}
 */
const OfficeEvent = ({eventObject, isDisabled = false, prefix = '', hideSubtractBtn = false}) => {
    const fieldName = `${prefix ? `${prefix}_` : ''}event_${eventObject?.component_content_id ?? eventObject?.event_id}`;

    const {
        errors,
        touched,
        handleChange,
        setFieldValue
    } = useFormikContext();
    const {locations} = useAdminContext();
    const {roles} = useAuth();
    const {
        mutateAsync: removeContent,
        isPending: removeContentIsPending
    } = useRemoveComponentContent();
    const {
        mutateAsync: removeEvent,
        isPending: removeEventIsPending
    } = useRemoveEvent();

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
                        <Field
                            as={Form.Select}
                            id={`${fieldName}_event_location`}
                            name={`${fieldName}_event_location`}
                            onChange={e => {
                                const matchingLocation = locations.find(location => location.location_name === e.target.value);
                                setFieldValue(`${fieldName}_event_telephone`, formatPhoneNumber(matchingLocation.location_telephone));

                                handleChange(e);
                            }}
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
                        </Field>
                    </div>

                    <div className={`ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100`}>
                        <Form.Label htmlFor={`${fieldName}_event_title`} column={true}>Event
                            title:</Form.Label>
                        <Field
                            as={Form.Control}
                            id={`${fieldName}_event_title`}
                            name={`${fieldName}_event_title`}
                            className='rounded'
                            type='input'
                            disabled={false}
                            isInvalid={touched[`${fieldName}_event_title`] && !!errors[`${fieldName}_event_title`]}
                        />
                        {errors[`${fieldName}_event_title`] && touched[`${fieldName}_event_title`] && (
                            <Form.Control.Feedback type='invalid' style={{display: 'block'}}>
                                {errors[`${fieldName}_event_title`]}
                            </Form.Control.Feedback>
                        )}
                    </div>

                    <div className={`ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100`}>
                        <Form.Label htmlFor={`${fieldName}_event_description`} column={true}>Event
                            Description:</Form.Label>
                        <Field
                            as={Form.Control}
                            id={`${fieldName}_event_description`}
                            name={`${fieldName}_event_description`}
                            className='rounded'
                            component={'textarea'}
                            disabled={false}
                            style={{
                                border: 'var(--bs-border-width) solid var(--bs-border-color)',
                                color: 'black',
                                backgroundColor: 'white'
                            }}
                            invalid={touched[`${fieldName}_event_description`] && !!errors[`${fieldName}_event_description`]}
                        />
                        {errors[`${fieldName}_event_description`] && touched[`${fieldName}_event_description`] && (
                            <Form.Control.Feedback type='invalid' style={{display: 'block'}}>
                                {errors[`${fieldName}_event_description`]}
                            </Form.Control.Feedback>
                        )}
                    </div>

                    <div className={`ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100`}>
                        <Form.Label htmlFor={`${fieldName}_event_telephone`} column={true}>Event
                            telephone:</Form.Label>
                        <Field
                            as={Form.Control}
                            id={`${fieldName}_event_telephone`}
                            name={`${fieldName}_event_telephone`}
                            className='rounded'
                            type='tel'
                            disabled={false}
                            isInvalid={touched[`${fieldName}_event_telephone`] && !!errors[`${fieldName}_event_telephone`]}
                        />
                        {errors[`${fieldName}_event_telephone`] && touched[`${fieldName}_event_telephone`] && (
                            <Form.Control.Feedback type='invalid' style={{display: 'block'}}>
                                {errors[`${fieldName}_event_telephone`]}
                            </Form.Control.Feedback>
                        )}
                    </div>
                </div>

                <div
                    className={`mt-2 d-flex flex-sm-column flex-md-row flex-nowrap align-items-end justify-content-sm-center justify-content-md-between w-100`}>
                    <div className='ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100'>
                        <Calendar
                            name={`${fieldName}_event_time`}
                        />
                    </div>

                    {
                        !hideSubtractBtn
                        && <InputGroup.Text style={{background: 'transparent', border: 'none'}}>
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
                    }

                </div>

                <Form.Control.Feedback type='invalid'>
                    {errors[fieldName]}
                </Form.Control.Feedback>
            </InputGroup>
        </Form.Group>
    );
};

OfficeEvent.propTypes = {
    eventObject: eventComponentPropType,
    isDisabled: PropTypes.bool,
    prefix: PropTypes.string,
    hideSubtractBtn: PropTypes.bool
};

export default OfficeEvent;