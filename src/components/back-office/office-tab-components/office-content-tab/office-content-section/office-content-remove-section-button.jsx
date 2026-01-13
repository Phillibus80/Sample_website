import PropTypes from 'prop-types';
import {Spinner} from 'react-bootstrap';
import {GrSubtractCircle} from 'react-icons/gr';

import {useRemoveSection} from '../../../../../hooks/sections/section-hooks.jsx';
import * as styles from '../office-content.module.scss';

/**
 * A button wrapper component that isolates the spinner and action for
 * removing a section from the application.
 *
 * @param {number} sectionId
 * @return {React.JSX.Element}
 */
const OfficeContentRemoveSectionButton = ({sectionId}) => {
    const {
        mutateAsync: removeSection,
        isPending
    } = useRemoveSection();

    return isPending
        ? <Spinner
            className='mt-5 ms-3'
            style={{color: 'blue'}}
            animation='border'
            role='status'
        />
        : <GrSubtractCircle
            className={`mt-5 ms-3 ${styles.subtractCircle}`}
            style={{fontSize: '1.5rem'}}
            onClick={async () => removeSection({id: sectionId})}
        />;
};

OfficeContentRemoveSectionButton.propTypes = {
    sectionId: PropTypes.number.isRequired
};

export default OfficeContentRemoveSectionButton;