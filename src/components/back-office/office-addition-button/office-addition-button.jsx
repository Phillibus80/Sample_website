import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import {GrAddCircle} from 'react-icons/gr';

import * as styles from './office-addition-button.module.scss';

/**
 * A component that wraps the react-icon: addition circle.
 *
 * @param {string} txt - button label text
 * @param {function} handleOnClick - event handler for the clicking of the button
 * @return {React.ReactNode}
 */
const OfficeAdditionButton = ({txt, handleOnClick}) => {
    return (
        <Container className='ps-5'>
            <div
                className={`my-3 d-flex align-items-center ${styles.btn}`}
                onClick={handleOnClick}
                aria-label={txt}
            >
                <GrAddCircle
                    className={`${styles.btn_icon}`}
                />
                <span className={`ms-2 ${styles.btn_text}`}>{txt}</span>
            </div>
        </Container>
    );
};

OfficeAdditionButton.propTypes = {
    txt: PropTypes.string.isRequired,
    handleOnClick: PropTypes.func.isRequired
};

export default OfficeAdditionButton;