import {useState} from 'react';

import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import {Accordion} from 'react-bootstrap';

import OfficeLink from './office-link.jsx';
import {componentCommonPropType, linkComponentPropType} from '../../../common/commonPropTypes.jsx';
import {COMPONENTS} from '../../../constants/app-constants.js';
import {DEFAULT_CONTENT, PLACEHOLDER_TEXT, ROLES} from '../../../constants/constants.js';
import {useAuth} from '../../../hooks/auth/use-auth.jsx';
import OfficeAdditionButton from '../office-addition-button/office-addition-button.jsx';
import OfficeDraftRow from '../office-draft-row/office-draft-row.jsx';

const DRAFT_FIELDS = ['link_url', 'link_text'];

const isRealValue = (val) =>
    typeof val === 'string'
    && val.trim() !== ''
    && val !== PLACEHOLDER_TEXT
    && val !== DEFAULT_CONTENT.LINK.LABEL
    && val !== DEFAULT_CONTENT.LINK.SRC;

/**
 * A utility function that takes an array of Link Component Object taken from the
 * response object and creates an Accordion wrapped list of office link components.
 *
 * @param {Component} component
 * @param {Array<LinkObject>} linkContent
 * @param {function} handleClick - Async call to create a new link in the current page/section/component
 * @param {number|null} componentContentId - the page section component id
 * @param {boolean} [isLinkTextInputDisabled] - handles the disabling of the link text input field
 * @param {boolean} [isSelectDisabled] - handles the disabling of the link url dropdown
 * @param {string} [prefix] - Optional, used to differentiate between reused Fields
 * @param {boolean} [showAddon] - shows the add new content plus button
 * @param {boolean} [isMenu] - indicates if the link list is for a menu component
 *
 * @return {React.ReactNode}
 */
const OfficeLinkList = ({
                            component,
                            linkContent,
                            handleClick,
                            componentContentId,
                            isLinkTextInputDisabled = false,
                            isSelectDisabled = false,
                            prefix = '',
                            showAddon = true,
                            isMenu = false
                        }) => {
    const {roles} = useAuth();

    const hasAdminRole = roles.includes(ROLES.ADMIN);
    const hasSuperRole = roles.includes(ROLES.SUPER);

    const {values, setFieldValue} = useFormikContext();
    const [drafts, setDrafts] = useState([]);
    const [pendingDraft, setPendingDraft] = useState(null);

    const draftFieldBase = (key) => `${prefix ? `${prefix}_` : ''}link_${key}`;

    const clearDraftFields = (key) => {
        const base = draftFieldBase(key);
        DRAFT_FIELDS.forEach(f => setFieldValue(`${base}_${f}`, undefined, false));
    };

    const addLinkEvent = async () => {
        const draftKey = `draft_${Date.now()}`;
        const base = draftFieldBase(draftKey);
        await setFieldValue(`${base}_link_url`, PLACEHOLDER_TEXT, false);
        await setFieldValue(`${base}_link_text`, '', false);
        setDrafts(prev => [...prev, {draftKey}]);
    };

    const discardDraft = (key) => {
        clearDraftFields(key);
        setDrafts(prev => prev.filter(d => d.draftKey !== key));
    };

    const isDraftValid = (key) => {
        const base = draftFieldBase(key);
        return isRealValue(values[`${base}_link_url`])
            && isRealValue(values[`${base}_link_text`]);
    };

    const saveDraft = async (key) => {
        const base = draftFieldBase(key);

        const requestBody = {
            link_text: values[`${base}_link_text`],
            link_url: values[`${base}_link_url`]
        };

        setPendingDraft(key);
        try {
            await handleClick({componentContentId: componentContentId, requestBody: requestBody});
            clearDraftFields(key);
            setDrafts(prev => prev.filter(d => d.draftKey !== key));
        } finally {
            setPendingDraft(null);
        }
    };

    const noContent = !linkContent || linkContent.length === 0;
    const noDrafts = drafts.length === 0;

    if (
        noContent && noDrafts
        && (hasSuperRole || (hasAdminRole && component?.component_name === COMPONENTS.SOCIAL_GALLERY))
    ) {
        return <OfficeAdditionButton
            txt='Add a new link'
            handleOnClick={addLinkEvent}
        />;
    } else if (noContent && noDrafts) {
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
                            isMenuLink={isMenu}
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

                    {
                        drafts.map(({draftKey}) =>
                            <OfficeDraftRow
                                key={draftKey}
                                isValid={isDraftValid(draftKey)}
                                isPending={pendingDraft === draftKey}
                                onSave={() => saveDraft(draftKey)}
                                onDiscard={() => discardDraft(draftKey)}
                            >
                                <OfficeLink
                                    linkObject={{
                                        component_content_id: null,
                                        link_id: draftKey,
                                        link_url: PLACEHOLDER_TEXT,
                                        link_text: ''
                                    }}
                                    isSelectDisabled={false}
                                    isDisabled={true}
                                    syncFieldsOnSelect={true}
                                    prefix={prefix}
                                    isMenuLink={isMenu}
                                    hideSubtractBtn
                                />
                            </OfficeDraftRow>
                        )
                    }

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
    component: componentCommonPropType,
    linkContent: PropTypes.arrayOf(linkComponentPropType).isRequired,
    handleClick: PropTypes.func.isRequired,
    componentContentId: PropTypes.number.isRequired,
    isLinkTextInputDisabled: PropTypes.bool,
    isSelectDisabled: PropTypes.bool,
    prefix: PropTypes.string,
    showAddon: PropTypes.bool,
    isMenu: PropTypes.bool
};

export default OfficeLinkList;
