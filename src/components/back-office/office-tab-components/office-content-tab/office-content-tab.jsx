import {lazy, Suspense} from 'react';

import OfficeContentImage from './office-content-image.jsx';
import OfficeContentLink from './office-content-link.jsx';
import OfficeContentLocation from './office-content-location.jsx';
import {ROLES} from '../../../../constants/constants.js';
import {useAuth} from '../../../../hooks/auth/use-auth.jsx';
import LoadingSkeleton from '../../../loading-skeleton/loading-skeleton.jsx';
import ScrollTopButton from '../../../scroll-top-button/scroll-top-button.jsx';

const OfficeContentSection = lazy(() => import('./office-content-section/office-content-section.jsx'));
const OfficeContentComponent = lazy(() => import('./office-content-component/office-content-component.jsx'));

/**
 * The back office component that displays the global content for the entire site.
 *
 * @return {false|React.ReactNode}
 */
const OfficeContentTab = () => {
    const {roles} = useAuth();

    return (
        <>
            <OfficeContentImage/>
            <OfficeContentLink/>
            <OfficeContentLocation/>
            {
                roles.includes(ROLES.SUPER)
                && <Suspense fallback={<LoadingSkeleton/>}>
                    <OfficeContentSection/>
                    <OfficeContentComponent/>
                </Suspense>
            }
            <ScrollTopButton/>
        </>
    );
};

export default OfficeContentTab;