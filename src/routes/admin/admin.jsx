import {useEffect} from 'react';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import {useLocation, useNavigate} from 'react-router';

import OfficeTabsLoader
    from '../../components/back-office/office-tab-components/office-tab-list/office-tabs-loader.jsx';
import OfficeTabs from '../../components/back-office/office-tab-components/office-tab-list/office-tabs.jsx';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {useAuth, useLogOut, useTokenMonitor} from '../../hooks/auth/auth-hooks.js';
import Header from '../../sections/header/header.jsx';

const Admin = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {username, token, role} = location.state || {};

    // Use the new auth hook
    const {
        login,
        logout,
        currentUser,
        isAuthenticated
    } = useAuth();
    const {
        mutateAsync: logoutMutation
    } = useLogOut();

    // Monitor token expiration
    const {timeRemaining} = useTokenMonitor({
        warningThreshold: 300, // 5-minute warning
        checkInterval: 60000   // Check every minute
    });

    // Handle initial authentication from the login redirect
    useEffect(() => {
        if (token && username && role && !isAuthenticated) {
            const loginSuccess = login(token, username, role);

            if (loginSuccess) {
                // Clear the state from location to prevent re-processing
                navigate(location.pathname, {replace: true});
            } else {
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            }
        }

        // Redirect to log in if no token and not authenticated
        if (!token && !isAuthenticated) {
            navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
        }
    }, [token, username, role, isAuthenticated, login, navigate, location.pathname]);

    const handleLogout = async () => {
        try {
            await logoutMutation({user_name: currentUser?.username});
            logout();
        } catch (error) {
            console.error('Logout error:', error);
            // Still logout on client side even if server call fails
            logout();
        }
    };

    // Show loading while authenticating
    if (!isAuthenticated) {
        return <div>Authenticating...</div>;
    }

    return (
            <OfficeTabsLoader>
                <div className='mb-3'>
                    <Header detachFromResponse={true}/>
                </div>

                <Container className='mb-5'>
                    <div className='text-end pe-5'>
                        <div className='d-flex align-items-center justify-content-end gap-3'>
                            {timeRemaining && timeRemaining < 600 && (
                                <span className='text-muted small'>
                                    Session expires in {Math.ceil(timeRemaining / 60)} min
                                </span>
                            )}
                            <span className='text-muted'>
                                Welcome, {currentUser?.username}
                            </span>
                            <Button type='button' onClick={handleLogout}>
                                Log out
                            </Button>
                        </div>
                    </div>
                </Container>

                <OfficeTabs/>
            </OfficeTabsLoader>
    );
};

export default Admin;