import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';

import {componentContentWithEvents} from '../../../../../common/commonPropTypes.jsx';
import LinearHoneycombGrid
    from '../../../../../components/galleries/linear-honeycomb-grid/linear-honeycomb-grid.jsx';
import SectionStyleWrapper from '../../../../../components/section-style-wrapper/section-style-wrapper.jsx';
import HoneyDipperTitle from '../../../../../components/typography/honey-dipper-title/honey-dipper-title.jsx';
import Subtitle from '../../../../../components/typography/subtitle/subtitle.jsx';
import {COMPONENTS} from '../../../../../constants/app-constants.js';
import EditableOverlay from '../../editable-overlay/editable-overlay.jsx';
import OrphanStrip from '../orphan-strip.jsx';
import {findComponent} from '../utils.js';

const HANDLED = [COMPONENTS.TITLE, COMPONENTS.SUBTITLE, COMPONENTS.STACKABLE_HEX_GALLERY];

/**
 * Mirrors src/sections/spaced-hex-gallery/hex-picture-gallery.jsx. Same
 * shape as InfoPreview — title/subtitle pair then a gallery instead of
 * body text. LinearHoneycombGrid is a pure renderer, reused as-is.
 *
 * @param {Section} section
 * @param {function} onEdit
 * @return {React.ReactNode}
 */
const SpacedHexGalleryPreview = ({section, onEdit}) => {
    const title = findComponent(section, COMPONENTS.TITLE);
    const subtitle = findComponent(section, COMPONENTS.SUBTITLE);
    const gallery = findComponent(section, COMPONENTS.STACKABLE_HEX_GALLERY);

    const titleText = title?.textContent?.at(0)?.text ?? '';
    const titleImages = title?.images ?? [];
    const subtitleText = subtitle?.textContent?.at(0)?.text ?? '';
    const galleryImages = gallery?.images ?? [];

    return (
        <>
            <SectionStyleWrapper>
                <Container className='pb-5 mt-5'>
                    <EditableOverlay component={title} onClick={onEdit}>
                        <HoneyDipperTitle
                            titleContent={titleText}
                            imageList={titleImages}
                            titleFontSize={'1.25rem'}
                            showSecondDipper={false}
                        />
                    </EditableOverlay>

                    <EditableOverlay component={subtitle} onClick={onEdit}>
                        <Subtitle titleContent={subtitleText} imageList={titleImages}/>
                    </EditableOverlay>

                    <EditableOverlay component={gallery} onClick={onEdit}>
                        <LinearHoneycombGrid imageList={galleryImages}/>
                    </EditableOverlay>
                </Container>
            </SectionStyleWrapper>

            <OrphanStrip section={section} handledNames={HANDLED} onEdit={onEdit}/>
        </>
    );
};

SpacedHexGalleryPreview.propTypes = {
    section: componentContentWithEvents.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default SpacedHexGalleryPreview;
