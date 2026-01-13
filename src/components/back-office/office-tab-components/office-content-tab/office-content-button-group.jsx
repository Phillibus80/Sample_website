import PropTypes from 'prop-types';
import {Spinner} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

/**
 * A wrapper component for a button group in the office content tab.
 *
 * @param {string} buttonLabel
 * @param {function} setShowModal
 * @param {boolean} isPending
 *
 * @return {React.ReactNode|null}
 */
const OfficeContentButtonGroup = ({buttonLabel, setShowModal, isPending}) => {
    if (!buttonLabel) return null;

    return <div className='mt-5 d-flex justify-content-between'>
        <Button
            className='mt-3 mb-3'
            type='button'
            onClick={() => setShowModal(true)}
        >
            {buttonLabel}
        </Button>

        <Button className='mt-3 mb-3' type='submit' disabled={isPending}>
            <div className='d-flex g-3 justify-content-center align-items-center'>
                <span>Submit Changes</span>
                {isPending ? <Spinner className='ms-3' animation='border'
                                      role='statue'/> : ''}
            </div>
        </Button>
    </div>;
};

OfficeContentButtonGroup.propTypes = {
    buttonLabel: PropTypes.string.isRequired,
    setShowModal: PropTypes.func.isRequired,
    isPending: PropTypes.bool.isRequired
};

export default OfficeContentButtonGroup;