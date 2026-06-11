import {useCallback, useEffect, useMemo, useState} from 'react';

import PropTypes from 'prop-types';
import {useNavigate} from 'react-router';

import AuthContext from './auth-context.jsx';
import {setCsrfRefreshCallback, setLogoutCallback} from '../../api-calls/axios-interceptor.js';
import {refreshCsrfToken as refreshCsrfTokenApi} from '../../api-calls/calls.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {
    clearAuthFromSessionStorage,
    decodeJWT,
    destroyPhpSession,
    getAuthFromSessionStorage,
    getTokenTimeRemaining,
    isTokenExpired,
    saveAuthToSessionStorage
} from '../../utils/utils.js';

/**
 * @typedef TokenUser
 *
 * @property {Array<Role>} permLevel
 * @property {boolean} signedIn
 * @property {string} username
 */

export const AuthProvider = ({children}) => {
    const navigate = useNavigate();

    const savedAuth = useMemo(() => getAuthFromSessionStorage(), []);

    const isValid = useMemo(() => {
        const isValidToken = savedAuth.bearerToken && !isTokenExpired(savedAuth.bearerToken);
        const isValidCsrf = !!savedAuth.csrfToken;
        return !!(isValidToken && isValidCsrf);
    }, [savedAuth.bearerToken, savedAuth.csrfToken]);

    useEffect(() => {
        if ((savedAuth.bearerToken || savedAuth.csrfToken) && !isValid) {
            clearAuthFromSessionStorage();
        }
    }, [savedAuth.bearerToken, savedAuth.csrfToken, isValid]);

    // Local State
    const [bearerToken, setBearerToken] = useState(isValid ? savedAuth.bearerToken : '');
    const [loggedInUserName, setLoggedInUser] = useState(isValid ? savedAuth.username : '');
    const [roles, setRoles] = useState(isValid ? savedAuth.roles : []);
    const [csrfToken, setCsrfToken] = useState(isValid ? savedAuth.csrfToken : '');

    const logoutUser = useCallback(() => {
        setBearerToken('');
        setLoggedInUser('');
        setRoles([]);
        setCsrfToken('');
        clearAuthFromSessionStorage();
        destroyPhpSession();
        navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
    }, [navigate]);

    useEffect(() => {
        setLogoutCallback(logoutUser);
    }, [logoutUser]);

    const refreshCsrf = useCallback(async () => {
        try {
            const response = await refreshCsrfTokenApi(bearerToken);
            const newToken = response?.data?.csrfToken;
            if (newToken) {
                setCsrfToken(newToken);
                saveAuthToSessionStorage(bearerToken, newToken, loggedInUserName, roles);
                return newToken;
            }
            return null;
        } catch {
            return null;
        }
    }, [bearerToken, loggedInUserName, roles]);

    useEffect(() => {
        setCsrfRefreshCallback(refreshCsrf);
    }, [refreshCsrf]);

    const validateCurrentToken = useCallback(() => {
        if (!bearerToken) {
            return false;
        }

        return !isTokenExpired(bearerToken);
    }, [bearerToken]);

    const getTokenData = useCallback(() => {
        if (!bearerToken || isTokenExpired(bearerToken)) {
            return null;
        }

        return decodeJWT(bearerToken);
    }, [bearerToken]);

    const hasRole = useCallback((role) => {
        const tokenData = getTokenData();
        if (!tokenData) return false;

        return tokenData.user?.permLevel?.includes(role) || false;
    }, [getTokenData]);

    const hasAnyRole = useCallback((userRoles = []) => {
        /**
         * @type {{user: TokenUser, exp: number, iat: number, jti: string, iss: string, aud: string}}
         */
        const tokenData = getTokenData();
        if (!tokenData) return false;

        return userRoles.some(role =>
            tokenData.user?.permLevel?.includes(role)
        );
    }, [getTokenData]);

    const getTimeRemaining = useCallback(() => {
        if (!bearerToken) return 0;
        return getTokenTimeRemaining(bearerToken);
    }, [bearerToken]);

    const loginUser = useCallback((token, username, userRoles, csrf = '') => {
        if (!token || isTokenExpired(token)) {
            console.error('Invalid or expired token provided to login');
            return false;
        }

        setBearerToken(token);
        setLoggedInUser(username);
        setRoles(userRoles);
        setCsrfToken(csrf);
        saveAuthToSessionStorage(token, csrf, username, userRoles);
        return true;
    }, []);

    const isAuthenticated = useMemo(() => validateCurrentToken(), [validateCurrentToken]);
    const tokenData = useMemo(() => getTokenData(), [getTokenData]);
    const currentUser = tokenData?.user || null;

    const value = useMemo(() => ({
        // State
        isAuthenticated,
        bearerToken,
        csrfToken,
        currentUser,
        loggedInUserName,
        roles,

        // Methods
        login: loginUser,
        logout: logoutUser,
        hasRole,
        hasAnyRole,
        validateCurrentToken,
        getTimeRemaining,
        getTokenData,
        setBearerToken,
        setLoggedInUser,
        setRoles,
        setCsrfToken
    }), [
        isAuthenticated,
        bearerToken,
        csrfToken,
        currentUser,
        loggedInUserName,
        roles,
        loginUser,
        logoutUser,
        hasRole,
        hasAnyRole,
        validateCurrentToken,
        getTimeRemaining,
        getTokenData
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};
