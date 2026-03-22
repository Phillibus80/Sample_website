import {useState} from 'react';

import PropTypes from 'prop-types';
import {Button, Form, Modal} from 'react-bootstrap';

import {isValidUrl} from '../../../utils/markup-utils.js';

/**
 * Modal dialog for inserting an external link into the rich text editor.
 * Validates the URL against a protocol whitelist before allowing insert.
 *
 * @param {boolean} show
 * @param {function} onHide
 * @param {function} onInsert - called with (url, text) when user confirms
 * @param {string} selectedText - pre-fills the link text field
 * @return {React.ReactNode}
 */
const LinkModal = ({show, onHide, onInsert, selectedText}) => {
    const [linkText, setLinkText] = useState('');
    const [url, setUrl] = useState('');
    const [touched, setTouched] = useState(false);

    const handleEnter = () => {
        setLinkText(selectedText || '');
        setUrl('');
        setTouched(false);
    };

    const urlValid = isValidUrl(url);
    const showError = touched && url && !urlValid;

    const handleInsert = () => {
        if (!urlValid) return;
        onInsert(url, linkText || url);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} onEnter={handleEnter} centered>
            <Modal.Header closeButton>
                <Modal.Title>Insert Link</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className='mb-3' controlId='linkModalText'>
                    <Form.Label>Link text</Form.Label>
                    <Form.Control
                        type='text'
                        value={linkText}
                        onChange={e => setLinkText(e.target.value)}
                        placeholder='Texas Beekeepers Association'
                    />
                </Form.Group>
                <Form.Group controlId='linkModalUrl'>
                    <Form.Label>URL</Form.Label>
                    <Form.Control
                        type='text'
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        onBlur={() => setTouched(true)}
                        isInvalid={showError}
                        placeholder='https://example.com'
                        autoFocus
                    />
                    <Form.Control.Feedback type='invalid'>
                        URL must start with http://, https://, mailto:, or tel:
                    </Form.Control.Feedback>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={onHide}>Cancel</Button>
                <Button variant='primary' onClick={handleInsert} disabled={!urlValid}>
                    Insert
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

LinkModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    onInsert: PropTypes.func.isRequired,
    selectedText: PropTypes.string
};

export default LinkModal;
