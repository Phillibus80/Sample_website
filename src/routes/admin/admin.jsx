import {useEffect} from 'react';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import {useLocation, useNavigate} from 'react-router';

import OfficeTabsLoader
    from '../../components/back-office/office-tab-components/office-tab-list/office-tabs-loader.jsx';
import OfficeTabs from '../../components/back-office/office-tab-components/office-tab-list/office-tabs.jsx';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {useLogOut, useTokenMonitor} from '../../hooks/auth/auth-hooks.jsx';
import {useAuth} from '../../hooks/auth/use-auth.jsx';
import Header from '../../sections/header/header.jsx';

const Admin = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {username, token, role, csrfToken} = location.state || {};

    const {
        login,
        logout,
        currentUser,
        isAuthenticated
    } = useAuth();
    const {
        mutateAsync: logoutMutation
    } = useLogOut();

    const {timeRemaining} = useTokenMonitor({
        warningThreshold: 300, // 5-minute warning
        checkInterval: 60000   // Check every minute
    });

    useEffect(() => {
        if (token && username && role && !isAuthenticated) {
            const loginSuccess = login(token, username, role, csrfToken);

            if (loginSuccess) {
                navigate(location.pathname, {replace: true});
            } else {
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            }
        }

        if (!token && !isAuthenticated) {
            navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
        }
    }, [token, username, role, csrfToken, isAuthenticated, login, navigate, location.pathname]);

    const handleLogout = async () => {
        try {
            await logoutMutation({user_name: currentUser?.username});
            logout();
        } catch (error) {
            console.error('Logout error:', error);
            logout();
        }
    };

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