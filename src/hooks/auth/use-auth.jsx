import {useContext} from 'react';

import AuthContext from '../../context/auth/auth-context.jsx';

/**
 * Custom hook to access authentication context
 * Must be used within an AuthProvider
 *
 * @returns {Object} Auth state and methods
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
