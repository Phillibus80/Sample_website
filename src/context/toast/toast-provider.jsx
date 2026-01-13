import {useState} from 'react';

import PropTypes from 'prop-types';

import ToastContext from './toast-context.jsx';
import {TOAST_TYPES} from '../../constants/constants.js';

/**
 * A Context Provider for managing toast notifications.
 *
 * @param {React.ReactNode} children
 * @return {React.JSX.Element}
 * @constructor
 */
export const ToastProvider = ({children}) => {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState(TOAST_TYPES.PRIMARY);

    return (
        <ToastContext value={{
            showToast,
            setShowToast,
            toastMessage,
            setToastMessage,
            toastType,
            setToastType
        }}>
            {children}
        </ToastContext>
    );
};

ToastProvider.propTypes = {
    children: PropTypes.node.isRequired
};
