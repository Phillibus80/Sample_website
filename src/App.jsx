import './App.scss';
import {lazy, Suspense} from 'react';

import {ErrorBoundary} from 'react-error-boundary';
import {BrowserRouter, Route, Routes} from 'react-router';

import LoadingSkeleton from './components/loading-skeleton/loading-skeleton.jsx';
import PageGenerator from './components/page-generator/page-generator.jsx';
import ProtectedRoute from './components/protected-route/protected-route.jsx';
import {SECTIONS} from './constants/app-constants.js';
import {ROLES} from './constants/constants.js';
import {ROUTING_CONSTANTS} from './constants/routing-constants.js';
import {AdminProvider} from './context/admin/admin-provider.jsx';
import {ToastProvider} from './context/toast/toast-provider.jsx';
import {useGetSiteLinksBySectionName} from './hooks/links/link-hooks.js';
import AboutUs from './routes/about-us/about-us.jsx';
import Error from './routes/error/error.jsx';
import Home from './routes/home/home.jsx';
import Login from './routes/login/Login.jsx';
import NotFound from './routes/not-found/not-found.jsx';
import UpcomingEvents from './routes/upcoming-events/upcoming-events.jsx';

const Admin = lazy(() => import('./routes/admin/admin.jsx'));

const App = () => {
    const {isSuccess, data: linksData} = useGetSiteLinksBySectionName(SECTIONS.HEADER);

    const links = isSuccess && linksData?.data?.length > 0
        ? linksData.data.sort((a, b) => Number(a.id) - Number(b.id))
        : [];

    const getPage = title => {
        switch (title) {
            case ROUTING_CONSTANTS.HOME.LABEL:
                return <Home/>;
            case ROUTING_CONSTANTS.ABOUT_US.LABEL :
                return <AboutUs/>;
            case ROUTING_CONSTANTS.UPCOMING_EVENTS.LABEL:
            case 'Events':
                return <UpcomingEvents/>;
            case ROUTING_CONSTANTS.ADMIN.LABEL:
                return (
                    <AdminProvider>
                        <ProtectedRoute requiredRole={[ROLES.USER, ROLES.ADMIN, ROLES.SUPER]}>
                            <Suspense fallback={<LoadingSkeleton/>}>
                                <Admin/>
                            </Suspense>
                        </ProtectedRoute>
                    </AdminProvider>
                );
            case ROUTING_CONSTANTS.LOGIN.LABEL:
                return (
                    <AdminProvider>
                        <Login/>
                    </AdminProvider>
                );
            default:
                return <PageGenerator pageName={title}/>;
        }
    };

    return (
        <ToastProvider>
            <BrowserRouter>
                <ErrorBoundary fallback={<Error/>}>
                    <Routes>
                        {
                            links.map(({title, url}) =>
                                <Route
                                    key={url}
                                    path={url}
                                    element={getPage(title)}
                                />
                            )
                        }
                        <Route path='*' element={<NotFound/>}/>
                    </Routes>
                </ErrorBoundary>
            </BrowserRouter>
        </ToastProvider>
    );
};

export default App;
