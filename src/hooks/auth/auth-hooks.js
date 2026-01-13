import {useCallback, useEffect, useRef} from 'react';

import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {login, logout} from '../../api-calls/calls.js';
import {TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {decodeJWT, getTokenTimeRemaining, isTokenExpired, setSessionStorage} from '../../utils/utils.js';
import {useAdminContext, useToastContext} from '../context/context-hooks.jsx';

export const useLogin = () => {
    const {setShowToast, setToastMessage, setToastType} = useToastContext();
    const {setCsrfToken} = useAdminContext();

    return useMutation(
        {
            mutationKey: ['login'],
            mutationFn: async ({
                                   user_name,
                                   password
                               }) => login(user_name, password),
            onSuccess: async (data) => {
                setCsrfToken(data.data.csrfToken);

                return Promise.all([
                    setToastMessage('Login Successful.'),
                    setToastType(TOAST_TYPES.PRIMARY),
                    setShowToast(true)
                ]);
            },
            onError: async () => Promise.all([
                setToastMessage('Error logging in.'),
                setToastType(TOAST_TYPES.ERROR),
                setShowToast(true)
            ])
        }
    );
};

export const useLogOut = () => {
    const {setShowToast, setToastMessage, setToastType} = useToastContext();
    const {bearerToken, setBearerToken, csrfToken, setCsrfToken} = useAdminContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation(
        {
            mutationKey: ['logout'],
            mutationFn: async ({user_name}) => logout(user_name, bearerToken, csrfToken),
            onSuccess: () => {
                queryClient.clear();
                sessionStorage.removeItem('authToken');
                setBearerToken('');
                setCsrfToken('');
                setToastMessage('Logged out.');
                setToastType(TOAST_TYPES.PRIMARY);
                setShowToast(true);
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            },
            onError: async () => Promise.all([
                setToastMessage('Error logging out.'),
                setToastType(TOAST_TYPES.ERROR),
                setShowToast(true)
            ])
        }
    );
};

/**
 * Custom hook for authentication management
 * Handles token validation, auto-logout, and auth state
 *
 * @returns {Object} Auth state and methods
 */
export const useAuth = () => {
    const navigate = useNavigate();
    const {bearerToken, setBearerToken, setLoggedInUser, setRoles} = useAdminContext();

    /**
     * Log out user and clear auth state
     */
    const logout = useCallback(() => {
        setBearerToken('');
        setLoggedInUser('');
        setRoles([]);
        sessionStorage.removeItem('authToken');
        navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
    }, [setBearerToken, setLoggedInUser, setRoles, navigate]);

    /**
     * Validate the current token
     */
    const validateCurrentToken = useCallback(() => {
        if (!bearerToken) {
            return false;
        }

        if (isTokenExpired(bearerToken)) {
            console.warn('Token has expired');
            logout();
            return false;
        }

        return true;
    }, [bearerToken, logout]);

    /**
     * Get the decoded token data
     */
    const getTokenData = useCallback(() => {
        if (!bearerToken || isTokenExpired(bearerToken)) {
            return null;
        }

        return decodeJWT(bearerToken);
    }, [bearerToken]);

    /**
     * Check if the user has a specific role
     */
    const hasRole = useCallback((role) => {
        /**
         * @type {{user: {signedIn: boolean, username: string, permLevel: string}, exp: number, iat: number, jti: string, iss: string, aud: string}}
         */
        const tokenData = getTokenData();
        if (!tokenData) return false;

        return tokenData.user?.permLevel?.includes(role) || false;
    }, [getTokenData]);

    /**
     * Check if a user has any of the specified roles
     */
    const hasAnyRole = useCallback((roles = []) => {
        const tokenData = getTokenData();
        if (!tokenData) return false;

        return roles.some(role =>
            tokenData.user?.permLevel?.includes(role)
        );
    }, [getTokenData]);

    /**
     * Get time remaining before the token expires
     */
    const getTimeRemaining = useCallback(() => {
        if (!bearerToken) return 0;
        return getTokenTimeRemaining(bearerToken);
    }, [bearerToken]);

    /**
     * Login user with token
     */
    const login = useCallback((token, username, roles) => {
        if (!token || isTokenExpired(token)) {
            console.error('Invalid or expired token provided to login');
            return false;
        }

        setBearerToken(token);
        setLoggedInUser(username);
        setRoles(roles);
        setSessionStorage('authToken', token);
        return true;
    }, [setBearerToken, setLoggedInUser, setRoles]);

    /**
     * Check if the user is authenticated
     */
    const isAuthenticated = validateCurrentToken();

    /**
     * Get current user info
     */
    const tokenData = getTokenData();
    const currentUser = tokenData?.user || null;

    return {
        // State
        isAuthenticated,
        bearerToken,
        currentUser,

        // Methods
        login,
        logout,
        hasRole,
        hasAnyRole,
        validateCurrentToken,
        getTimeRemaining,
        getTokenData,
    };
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
    const {setShowToast, setToastMessage, setToastType} = useToastContext();
    const hasShownWarning = useRef(false);
    const expirationTimeoutRef = useRef(null);

    const showExpirationWarning = useCallback((minutesRemaining) => {
        if (!hasShownWarning.current) {
            setToastMessage(
                `Your session will expire in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}. Please save your work.`
            );
            setToastType('warning');
            setShowToast(true);
            hasShownWarning.current = true;
        }
    }, [setShowToast, setToastMessage, setToastType]);

    const checkTokenExpiration = useCallback(() => {
        if (!isAuthenticated) {
            return;
        }

        const timeRemaining = getTimeRemaining();

        if (timeRemaining === null || timeRemaining === 0) {
            console.warn('Token expired - logging out');
            setToastMessage('Your session has expired. Please log in again.');
            setToastType('info');
            setShowToast(true);
            logout();
            return;
        }

        // Show warning if approaching expiration
        if (timeRemaining <= warningThreshold && timeRemaining > 0) {
            const minutesRemaining = Math.ceil(timeRemaining / 60);
            showExpirationWarning(minutesRemaining);
        }

        // Set up auto-logout at the exact expiration time
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
        setToastMessage,
        setToastType,
        setShowToast
    ]);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        // Check immediately on mount
        checkTokenExpiration();

        // Set up periodic checking
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