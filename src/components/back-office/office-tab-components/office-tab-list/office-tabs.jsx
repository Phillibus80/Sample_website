import {useState} from 'react';

import {Tab, Tabs} from 'react-bootstrap';
import {GrAddCircle} from 'react-icons/gr';

import * as styles from './office-tabs.module.scss';
import {ROLES} from '../../../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../../../constants/routing-constants.js';
import {useAuth} from '../../../../hooks/auth/use-auth.jsx';
import {useAdminContext} from '../../../../hooks/context/context-hooks.jsx';
import {toTitleCase} from '../../../../utils/utils.js';
import OfficeSideNav from '../../../office-side-nav/office-side-nav.jsx';
import * as btnStyles from '../../office-addition-button/office-addition-button.module.scss';
import OfficeContentTab from '../office-content-tab/office-content-tab.jsx';
import OfficeCreatePage from '../office-create-page/office-create-page.jsx';
import OfficeEmailUserTab from '../office-email-users-tab/office-email-user-tab.jsx';
import OfficeLogs from '../office-logs/office-logs.jsx';
import OfficeTab from '../office-tab/office-tab.jsx';
import OfficeUsers from '../office-users/office-users.jsx';

/**
 * Back-office shell with a fixed side navigation panel.
 * The predefined views (Audit Logs, User List, etc.) are accessed via the
 * sidebar; generated page tabs are displayed under the "Pages" nav item.
 *
 * @return {React.ReactNode}
 */
const OfficeTabs = () => {
    const {pages, logs} = useAdminContext();
    const {roles} = useAuth();

    const [activeView, setActiveView] = useState('pages');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    const hasAdminAccess = roles?.includes(ROLES.SUPER) || roles?.includes(ROLES.ADMIN);

    if (!pages) return null;

    const createPageTab = hasAdminAccess
        ? [
            <Tab
                title={
                    <span>
                        Create Page&nbsp;
                        <GrAddCircle className={btnStyles.btn_icon}/>
                    </span>
                }
                key='create-page'
                eventKey='create-page'
            >
                <h2 className='mt-5'>Create Page</h2>
                <OfficeCreatePage/>
            </Tab>,
        ]
        : [];

    const generateTabs = (pagesArray) => {
        const pageTabs = pagesArray?.reduce((accum, page) => {
            if (page.NAME !== ROUTING_CONSTANTS.ADMIN.LABEL.toLowerCase()) {
                accum.push(
                    <Tab
                        title={toTitleCase(page.NAME)}
                        key={page.NAME}
                        eventKey={page.NAME}
                    >
                        <OfficeTab pageName={page.NAME}/>
                    </Tab>
                );
            }
            return accum;
        }, []);

        return [...pageTabs, ...createPageTab];
    };

    const defActiveKey = pages?.at(0)?.NAME;

    return (
        <div className={styles.layout}>
            <OfficeSideNav
                activeKey={activeView}
                onNavigate={setActiveView}
                isExpanded={isSidebarExpanded}
                onToggle={() => setIsSidebarExpanded((prev) => !prev)}
            />

            <main
                className={`${styles.content} ${
                    isSidebarExpanded ? styles.contentExpanded : styles.contentCollapsed
                }`}
            >
                {activeView === 'pages' && defActiveKey && (
                    <Tabs defaultActiveKey={defActiveKey} fill>
                        {generateTabs(pages)}
                    </Tabs>
                )}

                {activeView === 'audit-logs' && (
                    <>
                        <h2 className='mt-5'>Audit Logs</h2>
                        <OfficeLogs logs={logs}/>
                    </>
                )}

                {activeView === 'user-list' && (
                    <>
                        <h2 className='mt-5'>User List</h2>
                        <OfficeUsers/>
                    </>
                )}

                {activeView === 'email-list' && (
                    <>
                        <h2 className='mt-5'>Email List</h2>
                        <OfficeEmailUserTab/>
                    </>
                )}

                {activeView === 'content-list' && (
                    <>
                        <h2 className='mt-5'>Content List</h2>
                        <OfficeContentTab/>
                    </>
                )}
            </main>
        </div>
    );
};

export default OfficeTabs;