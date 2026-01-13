import {useEffect, useRef} from 'react';

import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import {InputGroup, Spinner} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import {GrSubtractCircle} from 'react-icons/gr';

import * as styles from './office-location.module.scss';
import {useRemoveLocation} from '../../../hooks/locations/location-hooks.js';
import {formatPhoneNumber} from '../../../utils/utils.js';

import 'react-datepicker/dist/react-datepicker.css';

/**
 * The Back Office input field to update any location-related component.
 *
 * @param {LocationObject} locationObject
 * @param {boolean} isDisabled
 * @param {string} [prefix] - Optional, can be added to the beginning of field names to namespace Fields
 *
 * @return {React.ReactNode | null}
 */
const OfficeLocation = ({locationObject, isDisabled = false, prefix = ''}) => {
    const fieldName = `${prefix ? `${prefix}_` : ''}location_${locationObject?.component_content_id ?? locationObject?.location_id}`;

    const telephoneRef = useRef(locationObject?.location_telephone ?? null);
    const {
        touched,
        errors,
        handleChange,
        handleBlur,
        setFieldValue,
        initialValues,
        values
    } = useFormikContext();
    const {
        mutateAsync: removeLocation,
        isPending
    } = useRemoveLocation();

    useEffect(() => {
        if (
            !!telephoneRef?.current?.value
            && (telephoneRef?.current?.value !== values[`${fieldName}_location_telephone`])
        ) {
            setFieldValue(fieldName, telephoneRef?.current?.value).then(
                () => {
                    initialValues[`${fieldName}_location_telephone`] = values[`${fieldName}_location_telephone`];
                    values[`${fieldName}_location_telephone`] = formatPhoneNumber(telephoneRef?.current?.value);
                });
        }
    }, [fieldName, handleChange, initialValues, setFieldValue, values]);

    if (!locationObject) return null;

    return (
        <Form.Group
            className='mt-2 mb-5'
        >
            <InputGroup
                className={`d-flex flex-sm-column flex-md-row flex-wrap align-items-end justify-content-sm-center justify-content-md-between`}>
                <div className='d-flex flex-wrap'>
                    <div className={`d-flex flex-row flex-sm-column flex-md-row w-100`}>

                        <div className={`mt-3 ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100`}>
                            <Form.Label htmlFor={`${fieldName}_location_name`} column={true}
                                        className={`justify-content-start`}>Location Name:</Form.Label>
                            <Form.Control
                                id={`${fieldName}_location_name`}
                                name={`${fieldName}_location_name`}
                                className='rounded'
                                type='input'
                                defaultValue={locationObject.location_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched[`${fieldName}_location_name`] && !!errors[`${fieldName}_location_name`]}
                                disabled={isDisabled}
                            />
                        </div>

                        <div className={`mt-3 ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100`}>
                            <Form.Label htmlFor={`${fieldName}_location_address`} column={true}>
                                Address:
                            </Form.Label>
                            <Form.Control
                                id={`${fieldName}_location_address`}
                                name={`${fieldName}_location_address`}
                                type='input'
                                className='rounded'
                                defaultValue={locationObject.location_address}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched[`${fieldName}_location_address`] && !!errors[`${fieldName}_location_address`]}
                                disabled={isDisabled}
                            />
                        </div>

                        <div className={`mt-3 ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100`}>
                            <Form.Label htmlFor={`${fieldName}_location_city`} column={true}>City:</Form.Label>
                            <Form.Control
                                id={`${fieldName}_location_city`}
                                name={`${fieldName}_location_city`}
                                type='input'
                                className='rounded'
                                defaultValue={locationObject.location_city}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched[`${fieldName}_location_city`] && !!errors[`${fieldName}_location_city`]}
                                disabled={isDisabled}
                            />
                        </div>
                    </div>

                    <div className={`d-flex flex-row flex-sm-column flex-md-row w-100`}>
                        <div className={`mt-3 ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100`}>
                            <Form.Label htmlFor={`${fieldName}_location_state`} column={true}>State:</Form.Label>
                            <Form.Control
                                id={`${fieldName}_location_state`}
                                name={`${fieldName}_location_state`}
                                className='rounded'
                                type='input'
                                defaultValue={locationObject.location_state}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched[`${fieldName}_location_state`] && !!errors[`${fieldName}_location_state`]}
                                disabled={isDisabled}
                            />
                        </div>

                        <div className={`mt-3 ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100`}>
                            <Form.Label htmlFor={`${fieldName}_location_zip`} column={true}>Zip:</Form.Label>
                            <Form.Control
                                id={`${fieldName}_location_zip`}
                                name={`${fieldName}_location_zip`}
                                className='rounded'
                                type='input'
                                defaultValue={locationObject.location_zip}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched[`${fieldName}_location_zip`] && !!errors[`${fieldName}_location_zip`]}
                                disabled={isDisabled}
                            />
                        </div>

                        <div className={`mt-3 ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100`}>
                            <Form.Label htmlFor={`${fieldName}_location_telephone`} column={true}>Telephone
                                Number:</Form.Label>
                            <Form.Control
                                ref={telephoneRef}
                                id={`${fieldName}_location_telephone`}
                                name={`${fieldName}_location_telephone`}
                                className='rounded'
                                type='tel'
                                defaultValue={formatPhoneNumber(locationObject.location_telephone)}
                                onChange={(e) => {
                                    const formatted = formatPhoneNumber(e.target.value);

                                    setFieldValue(`${fieldName}_location_telephone`, formatted)
                                        .then(() => {
                                                telephoneRef.current = formatted;
                                            }
                                        );
                                }}
                                onBlur={handleBlur}
                                isInvalid={touched[`${fieldName}_location_telephone`] && !!errors[`${fieldName}_location_telephone`]}
                                disabled={isDisabled}
                            />
                        </div>

                        <InputGroup.Text style={{background: 'transparent', border: 'none'}}>
                            {
                                isPending
                                    ? <Spinner className='mt-5 ms-3' style={{color: 'blue'}} animation='border'
                                               role='status'/>
                                    : <GrSubtractCircle
                                        className={`mt-5 ms-3 ${styles.subtractCircle}`}
                                        style={{fontSize: '1.5rem'}}
                                        onClick={async () => removeLocation({id: locationObject.location_id})}
                                    />
                            }
                        </InputGroup.Text>
                    </div>
                </div>

                <Form.Control.Feedback type='invalid'>
                    {errors[fieldName]}
                </Form.Control.Feedback>
            </InputGroup>
        </Form.Group>
    );
};

OfficeLocation.propTypes = {
    locationObject: PropTypes.shape({
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
    }).isRequired,
    isDisabled: PropTypes.bool,
    prefix: PropTypes.bool
};

export default OfficeLocation;