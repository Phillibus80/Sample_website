import {useEffect, useRef} from 'react';

import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import {FormGroup} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

import * as styles from './create-page.module.scss';
import {PLACEHOLDER_TEXT} from '../../../../constants/constants.js';

/**
 * @typedef {Object} FormikValues
 * @property {string} pageName - The name of the page
 */

/**
 * FormikValues with dynamic section selection properties
 * @typedef {FormikValues & {[key: string]: string}} DynamicFormikValues
 */

/**
 * A React functional component responsible for rendering a specific section
 * selection UI element on the office creation page. It uses `Formik`'s context
 * to manage form states, validations, and error handling.
 *
 * @param {Object} props - The input properties to the component.
 * @param {number} props.contentNumber - Unique identifier for the content section,
 *                                        used for form input names and state management.
 * @param {{data: Array<SectionObject>|*[]}} props.sectionData - The data object containing all available sections returned from the API..
 * @param {boolean} props.sectionsCallSuccess - Flag indicating whether the call to
 *                                               retrieve sections was successful.
 *
 * @return {@React.ReactNode} A JSX element rendering the section selection UI.
 */
const OfficeCreatePageContent = (
    {
        contentNumber,
        sectionData,
        sectionsCallSuccess
    }
) => {
    const {
        handleChange,
        handleBlur,
        errors,
        touched,
        values,
        setFieldValue,
        setFieldError
    } = useFormikContext();
    const selectRef = useRef(null);

    /** @type {DynamicFormikValues} */
    const typedValues = values;
    const currentlySelectedSections = Object.entries(typedValues)
        .filter(([key]) => key !== 'pageName')
        .reduce((accum, [key, value]) => {
            accum[key] = value;
            return accum;
        }, {});

    useEffect(() => {
        setFieldValue(`sectionSelection${contentNumber}`, selectRef.current.value).then(() => {
        });

        if (touched[`sectionSelection${contentNumber}`] && selectRef.current.value === PLACEHOLDER_TEXT) {
            setFieldError(`sectionSelection${contentNumber}`, 'Field must have a value.');
        }
    }, [contentNumber, setFieldError, setFieldValue, touched]);

    const isInInvalidState = (touched[`sectionSelection${contentNumber}`]
            && !!errors[`sectionSelection${contentNumber}`])
        || values[`sectionSelection${contentNumber}`] === PLACEHOLDER_TEXT
        || !values[`sectionSelection${contentNumber}`];

    const sections = sectionsCallSuccess
        ? sectionData.data
        : [];

    return (
        <div className={`rounded m-5 p-3 ${styles.section}`}>
            <FormGroup className='ms-sm-0 me-sm-0 ms-lg-2 me-lg-2 d-flex flex-column'>
                <Form.Label
                    htmlFor={`sectionSelection${contentNumber}`}
                    column={true}
                >
                    <b>Section Selection</b>
                </Form.Label>
                <Form.Select
                    ref={selectRef}
                    id={`sectionSelection${contentNumber}`}
                    name={`sectionSelection${contentNumber}`}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values[`sectionSelection${contentNumber}`] ?? PLACEHOLDER_TEXT}
                    isInvalid={isInInvalidState}
                >
                    <option value={PLACEHOLDER_TEXT} disabled={true}>Select a Section</option>
                    {
                        sections.map(
                            /**
                             * @param {SectionObject} section
                             * @param {number} index
                             * @return {@React.ReactNode}
                             */
                            (section, index) =>
                                <option
                                    key={`${section.NAME}_${index}`}
                                    value={section.NAME}
                                    disabled={Object.values(currentlySelectedSections).some(val => val === section.NAME)}
                                >
                                    {section.NAME}
                                </option>
                        )
                    }
                </Form.Select>

                <Form.Control.Feedback type='invalid'>
                    Field must have a value.
                </Form.Control.Feedback>
            </FormGroup>
        </div>
    );
};

OfficeCreatePageContent.propTypes = {
    contentNumber: PropTypes.number.isRequired,
    sectionData: PropTypes.arrayOf(PropTypes.shape({
        ID: PropTypes.string.isRequired,
        NAME: PropTypes.string.isRequired
    })).isRequired,
    sectionsCallSuccess: PropTypes.bool.isRequired
};

export default OfficeCreatePageContent;