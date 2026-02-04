import {useEffect, useRef} from 'react';

import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import {InputGroup, Spinner} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import {GrSubtractCircle} from 'react-icons/gr';

import * as styles from './office-text.module.scss';
import {COMPONENTS} from '../../../constants/app-constants.js';
import {PLACEHOLDER_TEXT, ROLES} from '../../../constants/constants.js';
import {useAuth} from '../../../hooks/auth/use-auth.jsx';
import {useRemoveComponentContent} from '../../../hooks/component-content/component-content-hooks.js';

/**
 * The Back Office input field to update any text-related component.
 *
 * @param {string} componentName
 * @param {TextContentObject} textComponent
 * @param {string} [prefix] - Optional, can be added to the beginning of field names to namespace Fields
 * @param {boolean} hideDeleteButton
 *
 * @return {React.ReactNode | null}
 */
const OfficeText = ({componentName, textComponent, prefix = '', hideDeleteButton}) => {
    const fieldName = `${prefix ? `${prefix}_` : ''}text_${textComponent?.component_content_id}_text`;

    const inputRef = useRef(null);
    const {
        initialValues,
        values,
        touched,
        errors,
        handleChange,
        handleBlur,
        setFieldValue
    } = useFormikContext();
    const {roles} = useAuth();
    const {
        mutateAsync: removeContent,
        isPending
    } = useRemoveComponentContent();

    useEffect(() => {
        if (
            !!inputRef?.current?.value
            && (inputRef?.current?.value !== values[inputRef?.current?.name])
        ) {
            setFieldValue(fieldName, inputRef?.current?.value).then(
                () => {
                    initialValues[fieldName] = values[fieldName];
                    values[fieldName] = inputRef?.current?.value;
                });
        }
    }, [fieldName, handleChange, initialValues, setFieldValue, values]);

    if (!textComponent) return null;

    return (
        <Form.Group
            className='mt-2'
            controlId={fieldName}
        >
            <InputGroup
                className={`d-flex flex-sm-column flex-md-row flex-md-nowrap align-items-end justify-content-sm-center justify-content-md-between`}>

                <div className='ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100'>
                    <Form.Label column={true}>Text</Form.Label>
                    <Form.Control
                        ref={inputRef}
                        name={fieldName}
                        defaultValue={textComponent?.text === PLACEHOLDER_TEXT ? '' : textComponent.text}
                        onChange={e => {
                            inputRef.current = e.target.value;
                            handleChange(e);
                        }}
                        onBlur={handleBlur}
                        isInvalid={touched[fieldName] && !!errors[fieldName]}
                        as={componentName === COMPONENTS.TEXT_CONTAINER ? 'textarea' : 'input'}
                    />
                    <Form.Control.Feedback type='invalid'>
                        {errors[fieldName]}
                    </Form.Control.Feedback>
                </div>
                <InputGroup.Text style={{background: 'transparent', border: 'none'}}>
                    {isPending && <Spinner style={{color: 'blue'}} animation='border' role='status'/>}
                    {
                        (
                            (!isPending && (roles.includes(ROLES.ADMIN) || roles.includes(ROLES.SUPER)))
                            && (!hideDeleteButton)
                        )
                        && <GrSubtractCircle
                            className={`ms-3 ${styles.subtractCircle}`}
                            style={{fontSize: '1.5rem'}}
                            onClick={() => removeContent({contentId: textComponent.component_content_id})}
                        />
                    }
                </InputGroup.Text>
            </InputGroup>
        </Form.Group>
    );
};

OfficeText.propTypes = {
    componentName: PropTypes.string.isRequired,
    textComponent: PropTypes.shape({
        component_content_id: PropTypes.string.isRequired,
        page_section_component_id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        text_content_id: PropTypes.string.isRequired
    }).isRequired,
    prefix: PropTypes.string,
    hideDeleteButton: PropTypes.bool
};

export default OfficeText;