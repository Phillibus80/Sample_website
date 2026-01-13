import PropTypes from 'prop-types';
import {Toast, ToastContainer} from 'react-bootstrap';

import * as styles from './app-toast.module.scss';
import {TOAST_TYPES} from '../../constants/constants.js';

/**
 * A wrapper component for the React Bootstrap Toast component.
 *
 * @param {boolean} showToast
 * @param {function} setShowToast
 * @param {string} toastMessage
 * @param {ToastTypes} variant
 * @return {React.ReactNode}
 */
const AppToast = ({showToast, setShowToast, toastMessage, variant}) => {
    const getToastVariantClass = () => {
        let variantType;

        switch (variant) {
            case TOAST_TYPES.PRIMARY:
                variantType = styles.toast_primary;
                break;
            case TOAST_TYPES.WARNING:
                variantType = styles.toast_warn;
                break;
            case TOAST_TYPES.ERROR:
                variantType = styles.toast_error;
                break;
        }

        return variantType;
    };

    return (
        <ToastContainer className='position-fixed p-5' position='bottom-end'>
            <Toast
                className={getToastVariantClass()}
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={3000}
                autohide
            >
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

AppToast.propTypes = {
    showToast: PropTypes.bool.isRequired,
    setShowToast: PropTypes.func.isRequired,
    toastMessage: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(Object.values(TOAST_TYPES)).isRequired
};

export default AppToast;