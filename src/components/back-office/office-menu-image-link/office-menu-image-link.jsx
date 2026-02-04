import PropTypes from 'prop-types';
import {Accordion} from 'react-bootstrap';

import {imageComponentPropType, linkComponentPropType} from '../../../common/commonPropTypes.jsx';
import {ROLES} from '../../../constants/constants.js';
import {useAuth} from '../../../hooks/auth/use-auth.jsx';
import OfficeImage from '../office-image/office-image.jsx';
import OfficeLink from '../office-link/office-link.jsx';

/**
 * A wrapper component that shows the user the image link that is displayed on the
 * top menu component.
 *
 * @param {ImageObject|null} imageObject
 * @param {LinkObject|null} linkObject
 * @param {string} [prefix]
 *
 * @return {React.JSX.Element|null}
 */
const OfficeMenuImageLink = ({imageObject, linkObject, prefix = ''}) => {
    const {roles} = useAuth();

    if (
        !imageObject
        || Object.values(imageObject)?.length === 0
        || !linkObject
        || Object.values(linkObject)?.length === 0
    ) return null;

    return (
        <Accordion defaultActiveKey='120'>
            <Accordion.Item eventKey='120'>
                <Accordion.Header>Menu Logo Link</Accordion.Header>
                <Accordion.Body>
                    <OfficeLink
                        linkObject={linkObject}
                        isSelectDisabled={false}
                        isDisabled={true}
                        prefix={prefix}
                        hideSubtractBtn={true}
                    />
                    <OfficeImage
                        imageObject={imageObject}
                        isDisabled={true}
                        prefix={prefix}
                        hideSubtractBtn={!roles.includes(ROLES.SUPER)}
                    />
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

OfficeMenuImageLink.propTypes = {
    imageObject: imageComponentPropType,
    linkObject: linkComponentPropType,
    prefix: PropTypes.string
};

export default OfficeMenuImageLink;