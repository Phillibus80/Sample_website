import {useState} from 'react';

import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import {Accordion} from 'react-bootstrap';

import OfficeImage from './office-image.jsx';
import {imageComponentPropType} from '../../../common/commonPropTypes.jsx';
import {DEFAULT_CONTENT, IMAGE_SRC_PLACEHOLDER_TEXT, PLACEHOLDER_TEXT, ROLES} from '../../../constants/constants.js';
import {useAuth} from '../../../hooks/auth/use-auth.jsx';
import OfficeAdditionButton from '../office-addition-button/office-addition-button.jsx';
import OfficeDraftRow from '../office-draft-row/office-draft-row.jsx';

const DRAFT_FIELDS = ['image_url', 'image_text', 'image_alt'];

const isRealText = (val) =>
    typeof val === 'string'
    && val.trim() !== ''
    && val !== PLACEHOLDER_TEXT
    && val !== DEFAULT_CONTENT.IMAGE.LABEL
    && val !== DEFAULT_CONTENT.IMAGE.ALT;

const isRealSrc = (val) =>
    typeof val === 'string'
    && val.trim() !== ''
    && val !== PLACEHOLDER_TEXT
    && val !== IMAGE_SRC_PLACEHOLDER_TEXT
    && val !== DEFAULT_CONTENT.IMAGE.SRC;

/**
 * A utility function that takes an array of Link Component Objects taken from the
 * response object and creates an Accordion wrapped list of office link components.
 *
 * @param {Array<ImageObject>} imageContent
 * @param {function} handleClick - Async call to create a new image content in the current page/section/component
 * @param {number|null} [componentContentId] - the page section component id
 * @param {boolean} [isDisabled]
 * @param {boolean} [isSelectDisabled]
 * @param {string} [prefix] - Optional, used to differentiate between reused Fields
 * @param {boolean} [showAddon] - toggles the visibility of the add new content plue button
 *
 * @return {React.ReactNode}
 */
const OfficeImageList = (
    {
        imageContent,
        handleClick,
        componentContentId = null,
        isDisabled = false,
        isSelectDisabled = true,
        prefix = '',
        showAddon = true
    }
) => {
    const {roles} = useAuth();
    const hasAdminRole = roles.includes(ROLES.ADMIN);
    const hasSuperRole = roles.includes(ROLES.SUPER);

    const {values, setFieldValue} = useFormikContext();
    const [drafts, setDrafts] = useState([]);
    const [pendingDraft, setPendingDraft] = useState(null);

    const draftFieldBase = (key) => `${prefix ? `${prefix}_` : ''}image_${key}`;

    const clearDraftFields = (key) => {
        const base = draftFieldBase(key);
        DRAFT_FIELDS.forEach(f => setFieldValue(`${base}_${f}`, undefined, false));
    };

    const handleAddImageEvent = async () => {
        const draftKey = `draft_${Date.now()}`;
        const base = draftFieldBase(draftKey);
        await setFieldValue(`${base}_image_url`, PLACEHOLDER_TEXT, false);
        await setFieldValue(`${base}_image_text`, '', false);
        await setFieldValue(`${base}_image_alt`, '', false);
        setDrafts(prev => [...prev, {draftKey}]);
    };

    const discardDraft = (key) => {
        clearDraftFields(key);
        setDrafts(prev => prev.filter(d => d.draftKey !== key));
    };

    const isDraftValid = (key) => {
        const base = draftFieldBase(key);
        return isRealSrc(values[`${base}_image_url`])
            && isRealText(values[`${base}_image_text`])
            && isRealText(values[`${base}_image_alt`]);
    };

    const saveDraft = async (key) => {
        const base = draftFieldBase(key);

        const requestBody = {
            image_text: values[`${base}_image_text`],
            image_src: values[`${base}_image_url`],
            image_alt: values[`${base}_image_alt`]
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

    const noContent = !imageContent || imageContent.length === 0;
    const noDrafts = drafts.length === 0;

    if (hasSuperRole && noContent && componentContentId && noDrafts) {
        return <OfficeAdditionButton
            txt='Add a new image'
            handleOnClick={handleAddImageEvent}
        />;
    } else if (noContent && !componentContentId) return null;
    else if (noContent && noDrafts) return null;

    const generateImages = imageContent => {
        if (!imageContent || imageContent.length === 0) return null;

        return showAddon
            ? imageContent.map((content, index) =>
                <div
                    key={`${prefix ? prefix + '_' : ''}${content?.src === DEFAULT_CONTENT.IMAGE.SRC ? `default_${index}` : content?.src}`}>
                    <OfficeImage
                        currentImages={imageContent}
                        imageObject={content}
                        isDisabled={isDisabled}
                        syncFieldsOnSelect={true}
                        prefix={prefix}
                        hideSubtractBtn={!hasSuperRole && imageContent?.length < 2}
                    />
                </div>
            )
            : imageContent.reduce((accum, content, index) => {
                content.src !== IMAGE_SRC_PLACEHOLDER_TEXT
                && content.src !== DEFAULT_CONTENT.IMAGE.SRC
                && accum.push(<div
                    key={`${prefix ? prefix + '_' : ''}${content?.src === DEFAULT_CONTENT.IMAGE.SRC ? `default_${index}` : content?.src}`}>
                    <OfficeImage
                        currentImages={imageContent}
                        imageObject={content}
                        isDisabled={isDisabled}
                        isSelectDisabled={isSelectDisabled}
                        syncFieldsOnSelect={true}
                        prefix={prefix}
                    />
                </div>);

                return accum;
            }, []);
    };

    return (
        <Accordion defaultActiveKey='0'>
            <Accordion.Item eventKey='0'>
                <Accordion.Header>Images</Accordion.Header>
                <Accordion.Body>
                    {generateImages(imageContent)}

                    {
                        drafts.map(({draftKey}) =>
                            <OfficeDraftRow
                                key={draftKey}
                                isValid={isDraftValid(draftKey)}
                                isPending={pendingDraft === draftKey}
                                onSave={() => saveDraft(draftKey)}
                                onDiscard={() => discardDraft(draftKey)}
                            >
                                <OfficeImage
                                    currentImages={imageContent ?? []}
                                    imageObject={{
                                        component_content_id: null,
                                        image_id: draftKey,
                                        src: PLACEHOLDER_TEXT,
                                        image_text: '',
                                        alt: ''
                                    }}
                                    isDisabled={true}
                                    isSelectDisabled={false}
                                    syncFieldsOnSelect={true}
                                    prefix={prefix}
                                    hideSubtractBtn
                                />
                            </OfficeDraftRow>
                        )
                    }

                    {(showAddon && (hasSuperRole || hasAdminRole))
                        && <OfficeAdditionButton
                            txt='Add a new image'
                            handleOnClick={handleAddImageEvent}
                        />}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

OfficeImageList.propTypes = {
    imageContent: PropTypes.arrayOf(imageComponentPropType).isRequired,
    handleClick: PropTypes.func.isRequired,
    componentContentId: PropTypes.number.isRequired,
    isDisabled: PropTypes.bool,
    isSelectDisabled: PropTypes.bool,
    prefix: PropTypes.string,
    showAddon: PropTypes.bool
};

export default OfficeImageList;
