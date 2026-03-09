import PropTypes from 'prop-types';
import {Modal} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

import OfficeComponentGenerator
    from '../../office-generators/office-component-generator/office-component-generator.jsx';

/**
 * Hosts the existing OfficeComponentGenerator inside a modal so ADMIN/USER
 * roles can edit a single component without navigating the accordion tree.
 *
 * OfficeComponentGenerator is imported unchanged — it brings its own Formik
 * context, its own Submit button, and every child list (text/image/link/event)
 * calls useAuth() internally, so all role guards apply exactly as they do in
 * the SUPER accordion view. The modal only supplies a Close button.
 *
 * The generator renders inside its own Accordion wrapper; that wrapper is
 * collapsed by default so the user clicks the header once inside the modal
 * to expand the editor. This is accepted redundancy in exchange for zero
 * modification to the shared editor.
 *
 * @param {Component|null} component — re-derived each render from fresh section data
 * @param {boolean} show
 * @param {function} onHide
 * @return {React.ReactNode}
 */
const ComponentEditorModal = ({component, show, onHide}) => {
    return (
        <Modal show={show} onHide={onHide} size='lg' centered>
            <Modal.Header closeButton>
                <Modal.Title>{component?.component_name}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {component && <OfficeComponentGenerator component={component}/>}
            </Modal.Body>

            <Modal.Footer>
                <Button variant='secondary' onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

ComponentEditorModal.propTypes = {
    component: PropTypes.shape({
        component_name: PropTypes.string.isRequired
    }),
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
};

export default ComponentEditorModal;
