import {useEffect, useRef, useState} from 'react';

import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import {Image, InputGroup, Spinner} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import {GrSubtractCircle} from 'react-icons/gr';

import * as styles from './office-image.module.scss';
import {PLACEHOLDER_TEXT, ROLES} from '../../../constants/constants.js';
import {useRemoveComponentContent} from '../../../hooks/component-content/component-content-hooks.js';
import {useAdminContext} from '../../../hooks/context/context-hooks.jsx';
import {useRemoveImage} from '../../../hooks/images/image-hooks.jsx';

/**
 * The Back Office input field to update any image-related component.
 *
 * @param {ImageObject} imageObject
 * @param {boolean} isDisabled
 * @param {boolean} [isSelectDisabled]
 * @param {string} [prefix] - Optional, can be added to the beginning of field names to namespace Fields
 * @param {boolean} [hideSubtractBtn] - Optional, hide subtract button
 *
 * @return {React.ReactNode | null}
 */
const OfficeImage = (
    {
        imageObject,
        isDisabled = false,
        isSelectDisabled = false,
        prefix = '',
        hideSubtractBtn = false
    }
) => {
    const fieldName = `${prefix ? `${prefix}_` : ''}image_${imageObject.component_content_id ?? imageObject.image_id}`;

    const {
        touched,
        errors,
        handleChange,
        handleBlur,
        values,
        setFieldValue
    } = useFormikContext();
    const {images, roles} = useAdminContext();
    const {
        mutateAsync: removeContent,
        isPending: removeContentIsPending
    } = useRemoveComponentContent();
    const {
        mutateAsync: removeImage,
        isPending: removeImageIsPending
    } = useRemoveImage();
    const selectRef = useRef(null);
    const [localImageSrc, setLocalImageSrc] = useState(null);

    useEffect(() => {
        const currentSelectValue = selectRef.current?.value;

        if (currentSelectValue && (currentSelectValue !== values[`${fieldName}_image_url`])) {
            setFieldValue(`${fieldName}_image_url`, currentSelectValue).then(() => {
            });
        }
    }, [fieldName, setFieldValue, values]);

    if (!imageObject) return null;
    const hasAdminRole = roles.includes(ROLES.ADMIN);
    const hasSuperRole = roles.includes(ROLES.SUPER);

    const areCallsPending = removeImageIsPending || removeContentIsPending;

    return (
        <>
            <Form.Group
                className='mt-2'
            >
                <InputGroup
                    className='d-flex flex-sm-column flex-md-row flex-md-nowrap align-items-end justify-content-sm-center justify-content-md-between'>

                    <div className='ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100'>
                        <Form.Label
                            htmlFor={`${fieldName}_${imageObject.src ? imageObject.src : ''}_image_url`}
                            column={true}
                        >
                            Image URL
                        </Form.Label>
                        <Form.Select
                            ref={selectRef}
                            id={`${fieldName}_${imageObject.src ? imageObject.src : ''}_image_url`}
                            name={`${fieldName}_image_url`}
                            defaultValue={`${imageObject.src}`}
                            disabled={imageObject.image_text === PLACEHOLDER_TEXT ? false : isSelectDisabled}
                            onChange={e => {
                                handleChange(e);
                                setLocalImageSrc(`${e.target.value}`);
                            }}
                            onBlur={handleBlur}
                            isInvalid={touched[`${fieldName}_image_url`] && !!errors[`${fieldName}_image_url`]}
                        >
                            <option value={PLACEHOLDER_TEXT} disabled={true}>Select an Image</option>
                            {
                                images?.length > 0 && images?.reduce((accum, image) => {
                                        !image.image_text.toLowerCase().includes(PLACEHOLDER_TEXT.toLowerCase())
                                        && accum.push(<option key={image.src} value={image.src}>
                                            {image.src}
                                        </option>);

                                        return accum;
                                    }
                                    , [])
                            }
                        </Form.Select>
                    </div>

                    <div className='ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100'>
                        <Form.Label
                            htmlFor={`${fieldName}_${imageObject.src ? imageObject.src : ''}_image_text`}
                            column={true}
                        >
                            Image Text
                        </Form.Label>
                        <Form.Control
                            disabled={isDisabled}
                            id={`${fieldName}_${imageObject.src ? imageObject.src : ''}_image_text`}
                            name={`${fieldName}_image_text`}
                            className='rounded'
                            type='input'
                            defaultValue={imageObject.image_text === PLACEHOLDER_TEXT ? '' : imageObject.image_text}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched[`${fieldName}_image_text`] && !!errors[`${fieldName}_image_text`]}
                        />
                    </div>

                    <div className='ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100'>
                        <Form.Label
                            htmlFor={`${fieldName}_${imageObject.src ? imageObject.src : ''}_image_alt`}
                            column={true}
                        >
                            Image alt text
                        </Form.Label>
                        <Form.Control
                            disabled={isDisabled}
                            name={`${fieldName}_image_alt`}
                            id={`${fieldName}_${imageObject.src ? imageObject.src : ''}_image_alt`}
                            className='rounded'
                            type='input'
                            defaultValue={imageObject.alt === PLACEHOLDER_TEXT ? '' : imageObject.alt}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched[`${fieldName}_image_alt`] && !!errors[`${fieldName}_image_alt`]}
                        />
                    </div>

                    <InputGroup.Text
                        className={`flex-grow-0`}
                        style={{background: 'transparent', border: 'none'}}
                    >
                        {
                            areCallsPending
                            && <Spinner style={{color: 'blue'}} animation='border' role='status'/>
                        }
                        {
                            ((hasSuperRole || hasAdminRole)
                                && !areCallsPending)
                            && !hideSubtractBtn
                            && <GrSubtractCircle
                                className={`ms-3 ${styles.subtractCircle}`}
                                style={{fontSize: '1.5rem'}}
                                onClick={() => imageObject.component_content_id
                                    ? removeContent({contentId: imageObject.component_content_id})
                                    : removeImage({id: imageObject.image_id})
                                }
                            />
                        }
                    </InputGroup.Text>

                    <Form.Control.Feedback type='invalid'>
                        {errors[fieldName]}
                    </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>

            <Image
                className='mt-2 mb-3 rounded-3 bg-dark'
                style={{height: '4rem'}}
                src={localImageSrc ? `${localImageSrc}` : `${imageObject.src}`}
                fluid
            />
        </>
    );
};

OfficeImage.propTypes = {
    imageObject: PropTypes.shape({
        component_content_id: PropTypes.string,
        alt: PropTypes.string.isRequired,
        image_id: PropTypes.string.isRequired,
        image_text: PropTypes.string.isRequired,
        page_section_component_id: PropTypes.string,
        src: PropTypes.string.isRequired
    }).isRequired,
    isDisabled: PropTypes.bool,
    isSelectDisabled: PropTypes.bool,
    prefix: PropTypes.string,
    hideSubtractBtn: PropTypes.bool
};

export default OfficeImage;