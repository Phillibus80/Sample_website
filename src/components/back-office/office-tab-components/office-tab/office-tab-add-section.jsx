import React, {useEffect, useRef} from 'react';

import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';

import {componentContentWithEvents} from '../../../../common/commonPropTypes.jsx';
import {PLACEHOLDER_TEXT} from '../../../../constants/constants.js';

/**
 * A component that abstracts the form element that allows for the
 * addition of new sections to an existing page.
 *
 * @param {number} addSectionNumber
 * @param {Array<Section>} currentSections
 * @param {Array<SectionObject>} availableSections
 *
 * @return {import('react').ReactNode}
 */
const OfficeTabAddSection = (
    {
        addSectionNumber,
        currentSections,
        availableSections
    }) => {
    const selectRef = useRef(null);

    const {
        values,
        handleChange,
        handleBlur,
        errors,
        setFieldValue,
        touched
    } = useFormikContext();

    useEffect(() => {
        setFieldValue(`sectionSelection${addSectionNumber}`, PLACEHOLDER_TEXT);
    }, [addSectionNumber, setFieldValue]);

    const isInInvalidState = (
            touched[`sectionSelection${addSectionNumber}`]
            && !!errors[`sectionSelection${addSectionNumber}`]
        )
        || values[`sectionSelection${addSectionNumber}`] === PLACEHOLDER_TEXT
        || !values[`sectionSelection${addSectionNumber}`];

    return (
        <Form.Group className='ms-sm-0 me-sm-0 ms-lg-2 me-lg-2 d-flex flex-column'>
            <Form.Label
                htmlFor={`sectionSelection${addSectionNumber}`}
                column={true}
            >
                <b>Section Selection</b>
            </Form.Label>
            <Form.Select
                ref={selectRef}
                id={`sectionSelection${addSectionNumber}`}
                name={`sectionSelection${addSectionNumber}`}
                onChange={async e => {
                    await setFieldValue(`sectionSelection${addSectionNumber}`, selectRef.current.value);
                    handleChange(e);
                }}
                onBlur={handleBlur}
                value={values[`sectionSelection${addSectionNumber}`] ?? PLACEHOLDER_TEXT}
                isInvalid={isInInvalidState}
            >
                <option value={PLACEHOLDER_TEXT} disabled={true}>Select a Section</option>
                {
                    availableSections.map(
                        /**
                         * @param {SectionObject} section
                         * @param {number} index
                         * @return {@React.ReactNode}
                         */
                        (section, index) =>
                            <option
                                key={`${section.NAME}_${index}`}
                                value={section.NAME}
                                disabled={
                                    currentSections.some(({section_name: name}) => name === section.NAME)
                                    || Object.values(values).some(val => val === section.NAME)
                                }
                            >
                                {section.NAME}
                            </option>
                    )
                }
            </Form.Select>

            <Form.Control.Feedback type='invalid'>
                Field must have a value.
            </Form.Control.Feedback>
        </Form.Group>
    );
};

OfficeTabAddSection.propTypes = {
    addSectionNumber: PropTypes.number.isRequired,
    currentSections: PropTypes.arrayOf(componentContentWithEvents).isRequired,
    availableSections: PropTypes.arrayOf(PropTypes.shape({
        ID: PropTypes.string.isRequired,
        NAME: PropTypes.string.isRequired,
    })).isRequired
};

export default OfficeTabAddSection;