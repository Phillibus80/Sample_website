import PropTypes from 'prop-types';
import {Spinner} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import {GrSubtractCircle} from 'react-icons/gr';

import * as styles from './office-draft-row.module.scss';

/**
 * Wraps an unsaved draft input row with a Save button and discard circle.
 * Save is disabled until the parent reports `isValid`; discard drops the draft
 * locally without touching the backend.
 *
 * @param {React.ReactNode} children - the form-field component (OfficeEvent/Image/Link)
 * @param {function} onSave - called on Save click (parent builds request body and fires the mutation)
 * @param {function} onDiscard - called on subtract-circle click (parent removes draft from local state)
 * @param {boolean} isValid - enables the Save button
 * @param {boolean} [isPending] - shows spinner and disables both controls while the create call is in flight
 *
 * @return {React.ReactNode}
 */
const OfficeDraftRow = ({children, onSave, onDiscard, isValid, isPending = false}) => {
    return (
        <div className={`p-2 my-2 rounded ${styles.draft}`}>
            {children}
            <div className='mt-2 d-flex justify-content-end align-items-center'>
                <Button
                    variant='success'
                    size='sm'
                    type='button'
                    disabled={!isValid || isPending}
                    onClick={onSave}
                >
                    {isPending
                        ? <Spinner size='sm' animation='border' role='status'/>
                        : 'Save'}
                </Button>
                {
                    !isPending
                    && <GrSubtractCircle
                        className={`ms-3 ${styles.subtractCircle}`}
                        onClick={onDiscard}
                    />
                }
            </div>
        </div>
    );
};

OfficeDraftRow.propTypes = {
    children: PropTypes.node.isRequired,
    onSave: PropTypes.func.isRequired,
    onDiscard: PropTypes.func.isRequired,
    isValid: PropTypes.bool.isRequired,
    isPending: PropTypes.bool
};

export default OfficeDraftRow;
