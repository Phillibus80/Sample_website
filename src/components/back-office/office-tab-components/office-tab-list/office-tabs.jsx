import {Tab, Tabs} from 'react-bootstrap';
import {GrAddCircle} from 'react-icons/gr';

import {ROLES} from '../../../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../../../constants/routing-constants.js';
import {useAuth} from '../../../../hooks/auth/use-auth.jsx';
import {useAdminContext} from '../../../../hooks/context/context-hooks.jsx';
import {toTitleCase} from '../../../../utils/utils.js';
import * as styles from '../../office-addition-button/office-addition-button.module.scss';
import OfficeContentTab from '../office-content-tab/office-content-tab.jsx';
import OfficeCreatePage from '../office-create-page/office-create-page.jsx';
import OfficeEmailUserTab from '../office-email-users-tab/office-email-user-tab.jsx';
import OfficeLogs from '../office-logs/office-logs.jsx';
import OfficeTab from '../office-tab/office-tab.jsx';
import OfficeUsers from '../office-users/office-users.jsx';

/**
 * A component that displays tabbed content based on the application pages' name
 *
 * @return {React.ReactNode | Array}
 */
const OfficeTabs = () => {
    const {pages, logs} = useAdminContext();
    const {roles} = useAuth();

    const hasAdminAccess = roles?.includes(ROLES.SUPER) || roles?.includes(ROLES.ADMIN);

    if (!pages) return [];

    const predefinedTabs = [
        <Tab
            title={'Audit Logs'}
            key={'audit-logs'}
            eventKey={'audit-logs'}
        >
            <h2 className='mt-5'>Audit Logs</h2>
            <OfficeLogs logs={logs}/>
        </Tab>,
        <Tab
            title={'User List'}
            key={'user-list'}
            eventKey={'user-list'}
        >
            <h2 className='mt-5'>User List</h2>
            <OfficeUsers/>
        </Tab>,
        <Tab
            title={'Email List'}
            key={'email-list'}
            eventKey={'email-list'}
        >
            <h2 className='mt-5'>Email List</h2>
            <OfficeEmailUserTab/>
        </Tab>,
        <Tab
            title={'Content List'}
            key={'content-list'}
            eventKey={'content-list'}
        >
            <h2 className='mt-5'>Content List</h2>
            <OfficeContentTab/>
        </Tab>
    ];

    const createPageTab = hasAdminAccess
        ? [
            <Tab
                title={<span>Create Page&nbsp;
                    <GrAddCircle
                        className={`${styles.btn_icon}`}
                    /></span>}
                key={'create-page'}
                eventKey={'create-page'}
            >
                <h2 className='mt-5'>Create Page</h2>
                <OfficeCreatePage/>
            </Tab>
        ]
        : [];

    const generateTabs = (pagesArray) => {
        const adminFilteredOutPages = pagesArray
            ?.reduce((accum, page) => {
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

        return [
            ...predefinedTabs,
            ...adminFilteredOutPages,
            ...createPageTab
        ];
    };

    const defActiveKey = pages?.at(0)?.NAME;

    return defActiveKey && (
        <>
            <Tabs defaultActiveKey={`${defActiveKey}`} fill>
                {generateTabs(pages)}
            </Tabs>
        </>
    );
};

export default OfficeTabs;
