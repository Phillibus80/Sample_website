import PropTypes from 'prop-types';
import {AiOutlineMail} from 'react-icons/ai';
import {GoSidebarCollapse} from 'react-icons/go';
import {LuLogs, LuUsers} from 'react-icons/lu';
import {MdContentCopy} from 'react-icons/md';
import {RiPagesLine} from 'react-icons/ri';

import * as styles from './office-side-nav.module.scss';

/** Ordered list of nav items rendered by the sidebar. */
const NAV_ITEMS = [
    {key: 'audit-logs',   label: 'Audit Logs',   Icon: LuLogs},
    {key: 'user-list',    label: 'User List',    Icon: LuUsers},
    {key: 'email-list',   label: 'Email List',   Icon: AiOutlineMail},
    {key: 'content-list', label: 'Content List', Icon: MdContentCopy},
    {key: 'pages',        label: 'Pages',        Icon: RiPagesLine},
];

/**
 * Fixed left-side navigation panel for the back-office.
 * Supports expand/collapse with smooth width and text-fade transitions.
 *
 * @param {string}   activeKey    - Key of the currently active view.
 * @param {Function} onNavigate   - Callback invoked with the clicked key.
 * @param {boolean}  isExpanded   - Whether the sidebar is currently expanded.
 * @param {Function} onToggle     - Callback invoked when the toggle button is clicked.
 * @returns {JSX.Element}
 */
const OfficeSideNav = ({activeKey, onNavigate, isExpanded, onToggle}) => {
    return (
        <nav
            className={`${styles.nav} ${isExpanded ? styles.expanded : styles.collapsed}`}
            aria-label='Back-office navigation'
        >
            {NAV_ITEMS.map(({key, label, Icon}) => (
                <button
                    key={key}
                    type='button'
                    className={`${styles.navItem} ${activeKey === key ? styles.navItemActive : ''}`}
                    onClick={() => onNavigate(key)}
                    aria-current={activeKey === key ? 'page' : undefined}
                    title={isExpanded ? undefined : label}
                >
                    <span className={`${styles.label} ${isExpanded ? styles.labelVisible : styles.labelHidden}`}>
                        {label}
                    </span>
                    <Icon className={styles.icon} aria-hidden='true' />
                </button>
            ))}

            <div className={styles.spacer} />

            <button
                type='button'
                className={styles.toggleBtn}
                onClick={onToggle}
                aria-expanded={isExpanded}
                title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                <GoSidebarCollapse
                    className={`${styles.toggleIcon} ${isExpanded ? styles.toggleIconExpanded : styles.toggleIconCollapsed}`}
                    aria-hidden='true'
                />
            </button>
        </nav>
    );
};

OfficeSideNav.propTypes = {
    activeKey:  PropTypes.string.isRequired,
    onNavigate: PropTypes.func.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    onToggle:   PropTypes.func.isRequired,
};

export default OfficeSideNav;
