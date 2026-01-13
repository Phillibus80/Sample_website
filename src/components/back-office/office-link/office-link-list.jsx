import PropTypes from 'prop-types';
import {Accordion} from 'react-bootstrap';

import OfficeLink from './office-link.jsx';
import {linkComponentPropType} from '../../../common/commonPropTypes.jsx';
import {DEFAULT_CONTENT, PLACEHOLDER_TEXT, ROLES} from '../../../constants/constants.js';
import {useAdminContext} from '../../../hooks/context/context-hooks.jsx';
import OfficeAdditionButton from '../office-addition-button/office-addition-button.jsx';

/**
 * A utility function that takes an array of Link Component Object taken from the
 * response object and creates an Accordion wrapped list of office link components.
 *
 * @param {Array<LinkObject>} linkContent
 * @param {function} handleClick - Async call to create a new link in the current page/section/component
 * @param {number|null} componentContentId - the page section component id
 * @param {boolean} isLinkTextInputDisabled - handles the disabling of the link text input field
 * @param {boolean} isSelectDisabled - handles the disabling of the link url dropdown
 * @param {string} prefix - Optional, used to differentiate between reused Fields
 * @param {boolean} showAddon - shows the add new content plus button
 * @return {React.ReactNode}
 */
const OfficeLinkList = ({
                            linkContent,
                            handleClick,
                            componentContentId,
                            isLinkTextInputDisabled = false,
                            isSelectDisabled = false,
                            prefix = '',
                            showAddon = true
                        }) => {
    const {roles} = useAdminContext();
    const hasAdminRole = roles.includes(ROLES.ADMIN);
    const hasSuperRole = roles.includes(ROLES.SUPER);

    const addLinkEvent = async () => {
        const requestBody = {
            link_text: PLACEHOLDER_TEXT,
            link_url: PLACEHOLDER_TEXT
        };

        await handleClick({componentContentId: componentContentId, requestBody: requestBody});
    };

    if ((!linkContent || linkContent?.length === 0) && hasSuperRole) {
        return <OfficeAdditionButton
            txt='Add a new link'
            handleOnClick={addLinkEvent}
        />;
    } else if (!linkContent || linkContent?.length === 0) {
        return null;
    }

    /**
     * A helper function that creates a list of office link objects.
     *
     * @param {Array<LinkObject>} linkContent
     * @return {Array<React.ReactNode>|null}
     */
    const generateLinks = (linkContent) => {
        if (!linkContent || linkContent.length === 0) return null;

        return linkContent
            .filter(link => (
                !showAddon
                && (link.link_url !== PLACEHOLDER_TEXT)
                && (link.link_url !== DEFAULT_CONTENT.LINK.SRC)
            ) || showAddon)
            .map((link) => (
                    <div
                        key={`${prefix ? prefix + '_' : ''}${link?.link_url}_${link?.component_content_id ?? link?.link_id}`}>
                        <OfficeLink
                            linkObject={link}
                            isSelectDisabled={link.link_text === PLACEHOLDER_TEXT ? false : isSelectDisabled}
                            isDisabled={isLinkTextInputDisabled}
                            prefix={prefix}
                        />
                    </div>
                )
            );
    };

    return (
        <Accordion defaultActiveKey='0'>
            <Accordion.Item eventKey='0'>
                <Accordion.Header>Links</Accordion.Header>
                <Accordion.Body>
                    {generateLinks(linkContent)}

                    {(showAddon && (hasSuperRole || hasAdminRole))
                        && <OfficeAdditionButton
                            txt='Add a new link'
                            handleOnClick={addLinkEvent}
                        />}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

OfficeLinkList.propTypes = {
    linkContent: PropTypes.arrayOf(linkComponentPropType).isRequired,
    handleClick: PropTypes.func.isRequired,
    componentContentId: PropTypes.number.isRequired,
    isLinkTextInputDisabled: PropTypes.bool,
    isSelectDisabled: PropTypes.bool,
    prefix: PropTypes.string,
    showAddon: PropTypes.bool
};

export default OfficeLinkList;