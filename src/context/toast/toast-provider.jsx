import {useCallback, useMemo, useReducer} from 'react';

import PropTypes from 'prop-types';

import ToastContext from './toast-context.jsx';
import {TOAST_TYPES} from '../../constants/constants.js';

/**
 * @typedef {Object} ToastState
 * @property {boolean} isVisible - Whether the toast is currently displayed
 * @property {string} message - The toast notification message
 * @property {ToastTypes} type - The toast variant type
 */

/**
 * @typedef {Object} ShowToastAction
 * @property {'SHOW'} type - Action type identifier
 * @property {string} message - The message to display
 * @property {ToastTypes} variant - The toast variant type
 */

/**
 * @typedef {Object} HideToastAction
 * @property {'HIDE'} type - Action type identifier
 */

/**
 * @typedef {ShowToastAction | HideToastAction} ToastAction
 */

/**
 * Reducer function for managing toast notification state.
 * Batches all toast fields into a single state update per dispatch.
 *
 * @param {ToastState} state - Current toast state
 * @param {ToastAction} action - The dispatched action
 * @return {ToastState} The next toast state
 */
const toastReducer = (state, action) => {
    switch (action.type) {
        case 'SHOW':
            return {
                isVisible: true,
                message: action.message,
                type: action.variant
            };
        case 'HIDE':
            return {...state, isVisible: false};
        default:
            return state;
    }
};

/** @type {ToastState} */
const TOAST_INITIAL_STATE = {
    isVisible: false,
    message: '',
    type: TOAST_TYPES.PRIMARY
};

/**
 * A Context Provider for managing toast notifications.
 * Uses useReducer to batch all toast state updates into a single dispatch,
 * eliminating the need for three separate setState calls per notification.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @return {React.JSX.Element}
 */
export const ToastProvider = ({children}) => {
    const [toast, dispatch] = useReducer(toastReducer, TOAST_INITIAL_STATE);

    /**
     * Triggers a toast notification with the given message and type.
     *
     * @param {Object} params
     * @param {string} params.message - The notification message to display
     * @param {ToastTypes} [params.type=TOAST_TYPES.PRIMARY] - The toast variant type
     */
    const showToast = useCallback(({message, type = TOAST_TYPES.PRIMARY}) => {
        dispatch({type: 'SHOW', message, variant: type});
    }, []);

    /**
     * Hides the currently displayed toast notification.
     */
    const hideToast = useCallback(() => {
        dispatch({type: 'HIDE'});
    }, []);

    const value = useMemo(() => ({
        toast,
        showToast,
        hideToast
    }), [toast, showToast, hideToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
};

ToastProvider.propTypes = {
    children: PropTypes.node.isRequired
};
