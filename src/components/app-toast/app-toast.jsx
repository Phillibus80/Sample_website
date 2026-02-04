import {Toast, ToastContainer} from 'react-bootstrap';

import * as styles from './app-toast.module.scss';
import {TOAST_TYPES} from '../../constants/constants.js';
import {useToastContext} from '../../hooks/context/context-hooks.jsx';

/**
 * A wrapper component for the React Bootstrap Toast component.
 *
 * @return {React.ReactNode}
 */
const AppToast = () => {
    const {toast, hideToast} = useToastContext();

    const getToastVariantClass = () => {
        let variantType;

        switch (toast.type) {
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
                onClose={hideToast}
                show={toast.isVisible}
                delay={3000}
                autohide
            >
                <Toast.Body>{toast.message}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default AppToast;