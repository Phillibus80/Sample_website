import PropTypes from 'prop-types';
import {ButtonGroup, Spinner} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

/**
 * A wrapper component that wraps buttons for modal actions
 * 
 * @param {string} buttonLabel
 * @param {function} setShowModal
 * @param {boolean} isPending
 *
 * @return {React.ReactNode|null}
 */
const ModalButtonGroup = ({buttonLabel, setShowModal, isPending}) => {
    if (!buttonLabel) return null;

    return (
        <ButtonGroup className='mt-5 d-flex justify-content-between'>
            <Button
                className='me-5 rounded'
                variant='secondary'
                onClick={() => setShowModal(false)}
            >
                Cancel
            </Button>

            <Button
                className='ms-5 rounded'
                variant='primary'
                type='submit'
                disabled={isPending}
            >
                <div className='d-flex g-3 justify-content-center align-items-center'>
                    <span>{buttonLabel}</span>
                    {(isPending) ?
                        <Spinner className='ms-3' animation='border' role='statue'/> : ''}
                </div>
            </Button>
        </ButtonGroup>
    );
};

ModalButtonGroup.propTypes = {
    buttonLabel: PropTypes.string.isRequired,
    setShowModal: PropTypes.func.isRequired,
    isPending: PropTypes.bool.isRequired
};

export default ModalButtonGroup;