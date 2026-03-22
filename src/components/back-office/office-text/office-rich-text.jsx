import {useCallback, useEffect, useRef, useState} from 'react';

import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import {InputGroup, Spinner} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import {GrSubtractCircle} from 'react-icons/gr';

import LinkModal from './link-modal.jsx';
import * as styles from './office-rich-text.module.scss';
import {insertLink, insertPlainText} from './rich-text-commands.js';
import RichTextToolbar from './rich-text-toolbar.jsx';
import {PLACEHOLDER_TEXT, ROLES} from '../../../constants/constants.js';
import {useAuth} from '../../../hooks/auth/use-auth.jsx';
import {useRemoveComponentContent} from '../../../hooks/component-content/component-content-hooks.js';
import {htmlToMarkup, markupToHtml} from '../../../utils/markup-utils.js';

const BYTE_LIMIT = 65535;
const BYTE_WARN = 58000;
const BYTE_DANGER = 64000;

/**
 * WYSIWYG editor for Text Container components. Stores lightweight markup
 * (**bold**, - bullets, etc.) in the DB while the user edits formatted HTML
 * in a contentEditable surface. Mirrors OfficeText's Formik/auth/remove
 * hook wiring so form submission and permissions behave identically.
 *
 * @param {TextContentObject} textComponent
 * @param {string} [prefix]
 * @param {boolean} hideDeleteButton
 * @return {React.ReactNode|null}
 */
const OfficeRichText = ({textComponent, prefix = '', hideDeleteButton}) => {
    const fieldName = `${prefix ? `${prefix}_` : ''}text_${textComponent?.component_content_id}_text`;

    const editorRef = useRef(null);
    const savedRangeRef = useRef(null);
    const {initialValues, setFieldValue, setFieldTouched} = useFormikContext();
    const {roles} = useAuth();
    const {mutateAsync: removeContent, isPending} = useRemoveComponentContent();

    const [charCount, setCharCount] = useState(0);
    const [byteCount, setByteCount] = useState(0);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedText, setSelectedText] = useState('');

    const syncToFormik = useCallback(() => {
        if (!editorRef.current) return;
        const html = editorRef.current.innerHTML;
        const markup = htmlToMarkup(html);
        setFieldValue(fieldName, markup);
        setCharCount(editorRef.current.innerText.length);
        setByteCount(new TextEncoder().encode(markup).length);
    }, [fieldName, setFieldValue]);

    // Hydrate editor from stored markup on mount / when the backing record changes.
    useEffect(() => {
        if (!editorRef.current || !textComponent) return;
        const initialMarkup = textComponent.text === PLACEHOLDER_TEXT ? '' : textComponent.text;
        editorRef.current.innerHTML = markupToHtml(initialMarkup);
        initialValues[fieldName] = initialMarkup;
        setFieldValue(fieldName, initialMarkup);
        setCharCount(editorRef.current.innerText.length);
        setByteCount(new TextEncoder().encode(initialMarkup).length);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [textComponent?.component_content_id]);

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        insertPlainText(editorRef.current, text);
        syncToFormik();
    };

    const handleLinkClick = () => {
        const sel = window.getSelection();
        if (sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
            savedRangeRef.current = sel.getRangeAt(0).cloneRange();
            setSelectedText(sel.toString());
        } else {
            savedRangeRef.current = null;
            setSelectedText('');
        }
        setShowLinkModal(true);
    };

    const handleLinkInsert = (url, text) => {
        insertLink(editorRef.current, url, text, savedRangeRef.current);
        savedRangeRef.current = null;
        syncToFormik();
    };

    if (!textComponent) return null;

    const counterClass = byteCount >= BYTE_DANGER
        ? styles.counterDanger
        : byteCount >= BYTE_WARN
            ? styles.counterWarn
            : '';

    return (
        <Form.Group className='mt-2' controlId={fieldName}>
            <InputGroup
                className='d-flex flex-sm-column flex-md-row flex-md-nowrap align-items-end justify-content-sm-center justify-content-md-between'>
                <div className='ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100'>
                    <Form.Label column={true}>Text</Form.Label>
                    <RichTextToolbar
                        editorRef={editorRef}
                        onContentChange={syncToFormik}
                        onLinkClick={handleLinkClick}
                    />
                    <div
                        ref={editorRef}
                        className={styles.editor}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={syncToFormik}
                        onBlur={() => setFieldTouched(fieldName, true)}
                        onPaste={handlePaste}
                        role='textbox'
                        aria-multiline='true'
                        aria-label='Rich text editor'
                    />
                    <div className={`${styles.counter} ${counterClass}`}>
                        {charCount.toLocaleString()} characters
                        {' · '}
                        {byteCount.toLocaleString()} / {BYTE_LIMIT.toLocaleString()} bytes
                    </div>
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
            <LinkModal
                show={showLinkModal}
                onHide={() => setShowLinkModal(false)}
                onInsert={handleLinkInsert}
                selectedText={selectedText}
            />
        </Form.Group>
    );
};

OfficeRichText.propTypes = {
    textComponent: PropTypes.shape({
        component_content_id: PropTypes.string.isRequired,
        page_section_component_id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        text_content_id: PropTypes.string.isRequired
    }).isRequired,
    prefix: PropTypes.string,
    hideDeleteButton: PropTypes.bool
};

export default OfficeRichText;
