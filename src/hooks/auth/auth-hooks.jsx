import {useCallback, useEffect, useRef} from 'react';

import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {useAuth} from './use-auth.jsx';
import {login, logout} from '../../api-calls/calls.js';
import {TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {clearAuthFromSessionStorage} from '../../utils/utils.js';
import {useToastContext} from '../context/context-hooks.jsx';


export const useLogin = () => {
    const {showToast} = useToastContext();
    const {setCsrfToken} = useAuth();

    return useMutation(
        {
            mutationKey: ['login'],
            mutationFn: async ({
                                   user_name,
                                   password
                               }) => login(user_name, password),
            onSuccess: (data) => {
                setCsrfToken(data.data.csrfToken);
                showToast({message: 'Login Successful.', type: TOAST_TYPES.PRIMARY});
            },
            onError: () => showToast({message: 'Error logging in.', type: TOAST_TYPES.ERROR})
        }
    );
};

export const useLogOut = () => {
    const {showToast} = useToastContext();
    const {bearerToken, csrfToken, logout: logoutFromContext} = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation(
        {
            mutationKey: ['logout'],
            mutationFn: async ({user_name}) => logout(user_name, bearerToken, csrfToken),
            onSuccess: () => {
                queryClient.clear();
                clearAuthFromSessionStorage();
                logoutFromContext();
                showToast({message: 'Logged out.', type: TOAST_TYPES.PRIMARY});
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            },
            onError: () => {
                showToast({message: 'Error logging out.', type: TOAST_TYPES.ERROR});
            }
        }
    );
};

/**
 * Hook to monitor token expiration and auto-logout
 * Also provides warnings before expiration
 *
 * @param {Object} options - Configuration options
 * @param {number} options.warningThreshold - Seconds before expiry to show warning (default: 300 = 5 min)
 * @param {number} options.checkInterval - How often to check in ms
 * (default: 60,000 = 1 min)
 */
export const useTokenMonitor = ({
                                    warningThreshold = 300, // 5 minutes
                                    checkInterval = 60000    // 1 minute
                                } = {}) => {
    const {logout, getTimeRemaining, isAuthenticated} = useAuth();
    const {showToast} = useToastContext();
    const hasShownWarning = useRef(false);
    const expirationTimeoutRef = useRef(null);

    const showExpirationWarning = useCallback((minutesRemaining) => {
        if (!hasShownWarning.current) {
            showToast({
                message: `Your session will expire in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}. Please save your work.`,
                type: TOAST_TYPES.WARNING
            });
            hasShownWarning.current = true;
        }
    }, [showToast]);

    const checkTokenExpiration = useCallback(() => {
        if (!isAuthenticated) {
            return;
        }

        const timeRemaining = getTimeRemaining();

        if (timeRemaining === null || timeRemaining === 0) {
            console.warn('Token expired - logging out');
            showToast({message: 'Your session has expired. Please log in again.', type: TOAST_TYPES.WARNING});
            logout();
            return;
        }

        if (timeRemaining <= warningThreshold && timeRemaining > 0) {
            const minutesRemaining = Math.ceil(timeRemaining / 60);
            showExpirationWarning(minutesRemaining);
        }

        if (!expirationTimeoutRef.current) {
            expirationTimeoutRef.current = setTimeout(() => {
                console.warn('Token expired - auto logout');
                logout();
            }, timeRemaining * 1000);
        }
    }, [
        isAuthenticated,
        getTimeRemaining,
        warningThreshold,
        showExpirationWarning,
        logout,
        showToast
    ]);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        checkTokenExpiration();

        const intervalId = setInterval(checkTokenExpiration, checkInterval);

        return () => {
            clearInterval(intervalId);
            if (expirationTimeoutRef.current) {
                clearTimeout(expirationTimeoutRef.current);
                expirationTimeoutRef.current = null;
            }
            hasShownWarning.current = false;
        };
    }, [isAuthenticated, checkTokenExpiration, checkInterval]);

    return {
        timeRemaining: getTimeRemaining(),
    };
};
