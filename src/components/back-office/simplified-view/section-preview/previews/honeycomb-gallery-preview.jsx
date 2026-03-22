import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';

import {componentContentWithEvents} from '../../../../../common/commonPropTypes.jsx';
import FormattedText from '../../../../../components/formatted-text/formatted-text.jsx';
import HoneycombGallery from '../../../../../components/galleries/honeycombo-gallery/honeycomb-gallery.jsx';
import SectionStyleWrapper from '../../../../../components/section-style-wrapper/section-style-wrapper.jsx';
import CursiveTitle from '../../../../../components/typography/cursive-title/cursive-title.jsx';
import HoneyDipperTitle from '../../../../../components/typography/honey-dipper-title/honey-dipper-title.jsx';
import Subtitle from '../../../../../components/typography/subtitle/subtitle.jsx';
import {COMPONENTS} from '../../../../../constants/app-constants.js';
import * as infoStyles from '../../../../../sections/info/info.module.scss';
import EditableOverlay from '../../editable-overlay/editable-overlay.jsx';
import OrphanStrip from '../orphan-strip.jsx';
import {findComponent} from '../utils.js';

const HANDLED = [
    COMPONENTS.TITLE,
    COMPONENTS.HEX_IMAGE_GROUP,
    COMPONENTS.SECONDARY_TITLE,
    COMPONENTS.SUBTITLE,
    COMPONENTS.TEXT_CONTAINER
];

/**
 * Mirrors src/sections/hex-picture-gallery/honeycomb-picture-gallery.jsx.
 * The public section is a composite: CursiveTitle + HoneycombGallery on top,
 * then an InfoContent block below that's fed SECONDARY_TITLE (not TITLE) as
 * its title component. That InfoContent block is decomposed here the same way
 * InfoPreview decomposes it — the only difference being which component feeds
 * the HoneyDipperTitle/Subtitle pair.
 *
 * @param {Section} section
 * @param {function} onEdit
 * @return {React.ReactNode}
 */
const HoneycombGalleryPreview = ({section, onEdit}) => {
    const title = findComponent(section, COMPONENTS.TITLE);
    const hexImageGroup = findComponent(section, COMPONENTS.HEX_IMAGE_GROUP);
    const secondaryTitle = findComponent(section, COMPONENTS.SECONDARY_TITLE);
    const subtitle = findComponent(section, COMPONENTS.SUBTITLE);
    const textContainer = findComponent(section, COMPONENTS.TEXT_CONTAINER);

    const titleText = title?.textContent?.at(0)?.text ?? '';
    const hexGroupImages = hexImageGroup?.images ?? [];
    const secondaryTitleText = secondaryTitle?.textContent?.at(0)?.text ?? '';
    const secondaryTitleImages = secondaryTitle?.images ?? [];
    const subtitleText = subtitle?.textContent?.at(0)?.text ?? '';
    const bodyText = textContainer?.textContent?.at(0)?.text ?? '';

    return (
        <>
            <SectionStyleWrapper>
                <EditableOverlay component={title} onClick={onEdit}>
                    <CursiveTitle strContent={titleText} titleFontSize={'3rem'}/>
                </EditableOverlay>

                <EditableOverlay component={hexImageGroup} onClick={onEdit}>
                    <HoneycombGallery imageList={hexGroupImages}/>
                </EditableOverlay>

                <Container className='info pb-5 mt-5'>
                    <EditableOverlay component={secondaryTitle} onClick={onEdit}>
                        <HoneyDipperTitle
                            titleContent={secondaryTitleText}
                            imageList={secondaryTitleImages}
                            titleFontSize={'1.25rem'}
                            showSecondDipper={false}
                        />
                    </EditableOverlay>

                    <EditableOverlay component={subtitle} onClick={onEdit}>
                        <Subtitle titleContent={subtitleText} imageList={secondaryTitleImages}/>
                    </EditableOverlay>

                    <EditableOverlay component={textContainer} onClick={onEdit}>
                        <FormattedText text={bodyText} className={`text-start mb-0 ${infoStyles.info_text}`}/>
                    </EditableOverlay>
                </Container>
            </SectionStyleWrapper>

            <OrphanStrip section={section} handledNames={HANDLED} onEdit={onEdit}/>
        </>
    );
};

HoneycombGalleryPreview.propTypes = {
    section: componentContentWithEvents.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default HoneycombGalleryPreview;
