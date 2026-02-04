import PropTypes from 'prop-types';
import {Accordion} from 'react-bootstrap';

import OfficeImage from './office-image.jsx';
import {imageComponentPropType} from '../../../common/commonPropTypes.jsx';
import {DEFAULT_CONTENT, IMAGE_SRC_PLACEHOLDER_TEXT, ROLES} from '../../../constants/constants.js';
import {useAuth} from '../../../hooks/auth/use-auth.jsx';
import OfficeAdditionButton from '../office-addition-button/office-addition-button.jsx';

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

    const handleAddImageEvent = async () => {
        const requestBody = {
            image_text: DEFAULT_CONTENT.IMAGE.LABEL,
            image_src: DEFAULT_CONTENT.IMAGE.SRC,
            image_alt: DEFAULT_CONTENT.IMAGE.ALT
        };

        await handleClick({componentContentId: componentContentId, requestBody: requestBody});
    };

    if (hasSuperRole && ((!imageContent || imageContent?.length === 0) && componentContentId)) {
        return <OfficeAdditionButton
            txt='Add a new image'
            handleOnClick={handleAddImageEvent}
        />;
    } else if ((!imageContent || imageContent?.length === 0) && !componentContentId) return null;
    else if (!imageContent || imageContent?.length === 0) return null;

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
                        prefix={prefix}
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