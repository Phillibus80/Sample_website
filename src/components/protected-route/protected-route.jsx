import PropTypes from 'prop-types';
import {Navigate, useLocation} from 'react-router-dom';

import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {useAuth} from '../../hooks/auth/auth-hooks.js';

/**
 * Component to protect routes requiring authentication
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string|Array<string>} props.requiredRole - Role(s) required to access route
 * @param {string} props.redirectTo - Where to redirect if not authorized
 */
const ProtectedRoute = ({
                            children,
                            requiredRole = null,
                            redirectTo = ROUTING_CONSTANTS.LOGIN.URL
                        }) => {
    const {isAuthenticated, hasRole, hasAnyRole} = useAuth();
    const location = useLocation();

    // Check authentication
    if (!isAuthenticated) {
        return (
            <Navigate
                to={redirectTo}
                state={{from: location}}
                replace
            />
        );
    }

    // Check role requirements
    if (requiredRole) {
        const isAuthorized = Array.isArray(requiredRole)
            ? hasAnyRole(requiredRole)
            : hasRole(requiredRole);

        if (!isAuthorized) {
            return (
                <Navigate
                    to={ROUTING_CONSTANTS.HOME.URL}
                    state={{unauthorized: true}}
                    replace
                />
            );
        }
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiredRole: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ]),
    redirectTo: PropTypes.string
};

export default ProtectedRoute;