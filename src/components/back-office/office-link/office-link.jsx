import {useEffect, useRef} from 'react';

import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import {InputGroup, Spinner} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import {GrSubtractCircle} from 'react-icons/gr';

import * as styles from './office-link.module.scss';
import {linkComponentPropType} from '../../../common/commonPropTypes.jsx';
import {DEFAULT_CONTENT, PLACEHOLDER_TEXT, ROLES} from '../../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../../constants/routing-constants.js';
import {useAuth} from '../../../hooks/auth/use-auth.jsx';
import {useRemoveComponentContent} from '../../../hooks/component-content/component-content-hooks.js';
import {useAdminContext} from '../../../hooks/context/context-hooks.jsx';
import {useRemoveLink} from '../../../hooks/links/link-hooks.js';

/**
 * The Back Office input field to update any link-related component.
 *
 * @param {LinkObject} linkObject
 * @param {boolean} [isDisabled]
 * @param {boolean} [isSelectDisabled]
 * @param {string} [prefix] - Optional, can be added to the beginning of field names to namespace Fields
 * @param {boolean} [hideSubtractBtn] - Optional, hide subtract button completely
 * @param {boolean} [isMenuLink] - indicates if the link is for a menu component
 * @param {boolean} [syncFieldsOnSelect] - when true, selecting a URL auto-fills Link Title from the matching admin-context link
 *
 * @return {React.ReactNode | null}
 */
const OfficeLink = ({
                        linkObject,
                        isSelectDisabled = false,
                        isDisabled = false,
                        prefix = '',
                        hideSubtractBtn = false,
                        isMenuLink = false,
                        syncFieldsOnSelect = false
                    }) => {
    const fieldName = `${prefix ? `${prefix}_` : ''}link_${linkObject.component_content_id ?? linkObject.link_id}`;

    const selectRef = useRef(null);
    const titleRef = useRef(null);

    const {
        touched,
        errors,
        handleChange,
        handleBlur,
        initialValues,
        values,
        setFieldValue
    } = useFormikContext();
    const {links} = useAdminContext();
    const {roles} = useAuth();

    const {
        mutateAsync: removeContent,
        isPending: removeContentIsPending
    } = useRemoveComponentContent();
    const {
        mutateAsync: removeLink,
        isPending: removeLinkIsPending
    } = useRemoveLink();

    useEffect(() => {
        if (selectRef?.current?.value !== values[selectRef?.current?.name]) {
            setFieldValue(selectRef?.current?.name, selectRef?.current?.value).then(() => {
            });
        }
    }, [fieldName, initialValues, setFieldValue, values]);

    if (!linkObject) return null;
    const hasAdminRole = roles.includes(ROLES.ADMIN);
    const hasSuperRole = roles.includes(ROLES.SUPER);
    const isCorePage = linkObject.link_url === ROUTING_CONSTANTS.HOME.URL
        || linkObject.link_url === ROUTING_CONSTANTS.ADMIN.URL
        || linkObject.link_url === ROUTING_CONSTANTS.LOGIN.URL;

    const areCallsPending = removeLinkIsPending || removeContentIsPending;

    const showSubtractCircle = () => {
        return (
            !areCallsPending
            && (hasSuperRole || (hasAdminRole && !isCorePage)))
            ? <GrSubtractCircle
                className={`ms-3 ${styles.subtractCircle}`}
                style={{fontSize: '1.5rem'}}
                onClick={async () => {
                    if (linkObject.component_content_id) {
                        await removeContent({contentId: linkObject.component_content_id});
                    } else {
                        await removeLink({id: linkObject.link_id});
                    }
                }}
            />
            : null;
    };

    return (
        <Form.Group
            className='mt-2'
        >
            <InputGroup
                className='d-flex flex-sm-column flex-md-row flex-md-nowrap align-items-end justify-content-sm-center justify-content-md-between'>
                <div className='ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100'>
                    <Form.Label
                        htmlFor={`${fieldName}_link_url`}
                        column={true}
                    >
                        Link URL
                    </Form.Label>
                    <Form.Select
                        ref={selectRef}
                        id={`${fieldName}_link_url`}
                        name={`${fieldName}_link_url`}
                        defaultValue={`${linkObject?.link_url}`}
                        onChange={e => {
                            handleChange(e);
                            if (syncFieldsOnSelect) {
                                const selected = links.find(l => l.link_url === e.target.value);
                                if (selected && titleRef.current) {
                                    titleRef.current.value = selected.link_text;
                                    if (!linkObject.component_content_id) {
                                        setFieldValue(`${fieldName}_link_text`, selected.link_text, false);
                                    }
                                }
                            }
                        }}
                        onBlur={handleBlur}
                        isInvalid={touched[`${fieldName}_link_url`] && !!errors[`${fieldName}_link_url`]}
                        disabled={isSelectDisabled}
                    >
                        <option value={PLACEHOLDER_TEXT} disabled={true}>Select a Link</option>
                        {
                            links
                                .filter(link => link.link_url !== DEFAULT_CONTENT.LINK.SRC)
                                .reduce((accum, {link_url: url}, index) => {
                                        !url.toLowerCase().includes(PLACEHOLDER_TEXT.toLowerCase())
                                        && accum.push(
                                            <option
                                                key={`${url}_${index}`}
                                                value={url}
                                                disabled={isMenuLink ? !url.startsWith('/') : false}
                                            >
                                                {url}
                                            </option>
                                        );

                                        return accum;
                                    }
                                    , [])
                        }
                    </Form.Select>
                </div>

                <div className='ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100'>
                    <Form.Label
                        htmlFor={`${fieldName}_link_text`}
                        column={true}
                    >
                        Link Title
                    </Form.Label>
                    <Form.Control
                        ref={titleRef}
                        id={`${fieldName}_link_text`}
                        name={`${fieldName}_link_text`}
                        className='rounded'
                        type='input'
                        defaultValue={linkObject.link_text === PLACEHOLDER_TEXT ? '' : linkObject.link_text}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched[`${fieldName}_link_text`] && !!errors[`${fieldName}_link_text`]}
                        disabled={isDisabled}
                    />
                    <Form.Control.Feedback type='invalid'>
                        {errors[`${fieldName}_link_text`]}
                    </Form.Control.Feedback>
                </div>

                {
                    !hideSubtractBtn
                    && <InputGroup.Text style={{background: 'transparent', border: 'none'}}>
                        {
                            areCallsPending
                            && <Spinner style={{color: 'blue'}} animation='border' role='status'/>
                        }
                        {showSubtractCircle()}
                    </InputGroup.Text>}
            </InputGroup>
        </Form.Group>
    );
};

OfficeLink.propTypes = {
    linkObject: linkComponentPropType.isRequired,
    isSelectDisabled: PropTypes.bool,
    isDisabled: PropTypes.bool,
    prefix: PropTypes.string,
    hideSubtractBtn: PropTypes.bool,
    isMenuLink: PropTypes.bool,
    syncFieldsOnSelect: PropTypes.bool
};

export default OfficeLink;