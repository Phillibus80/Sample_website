import PropTypes from 'prop-types';
import {Image} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';

import {componentContentWithEvents} from '../../../../../common/commonPropTypes.jsx';
import FormattedText from '../../../../../components/formatted-text/formatted-text.jsx';
import HoneyDipperTitle from '../../../../../components/typography/honey-dipper-title/honey-dipper-title.jsx';
import Subtitle from '../../../../../components/typography/subtitle/subtitle.jsx';
import {COMPONENTS} from '../../../../../constants/app-constants.js';
import * as infoStyles from '../../../../../sections/info/info.module.scss';
import * as infoPictureStyles from '../../../../../sections/info-picture/info-picture.module.scss';
import EditableOverlay from '../../editable-overlay/editable-overlay.jsx';
import OrphanStrip from '../orphan-strip.jsx';
import {findComponent} from '../utils.js';

// All three image variants are listed so whichever one the DB has wired
// doesn't fall through to the orphan strip.
const HANDLED = [
    COMPONENTS.IMAGE,
    COMPONENTS.IMAGE_GALLERY,
    COMPONENTS.IMAGE_LOADER,
    COMPONENTS.TITLE,
    COMPONENTS.SUBTITLE,
    COMPONENTS.TEXT_CONTAINER
];

/**
 * Mirrors src/sections/info-picture/info-picture.jsx. Serves both
 * INFO_PICTURE and INFO_GALLERY section types (same as page-generator.jsx).
 *
 * The public Carousel rotates through images; here only the first image is
 * shown static so the back-office doesn't animate. InfoContent renders
 * title/subtitle/body as one block so — like InfoPreview — each piece is
 * laid out individually with the same sub-components and classes.
 *
 * The image component may be IMAGE, IMAGE_GALLERY, or IMAGE_LOADER depending
 * on which variant the section was created with (see info-picture.jsx:20-25).
 *
 * @param {Section} section
 * @param {function} onEdit
 * @return {React.ReactNode}
 */
const InfoPicturePreview = ({section, onEdit}) => {
    const imageComponent = section?.components?.find(
        c => c.component_name === COMPONENTS.IMAGE
            || c.component_name === COMPONENTS.IMAGE_GALLERY
            || c.component_name === COMPONENTS.IMAGE_LOADER
    );
    const title = findComponent(section, COMPONENTS.TITLE);
    const subtitle = findComponent(section, COMPONENTS.SUBTITLE);
    const textContainer = findComponent(section, COMPONENTS.TEXT_CONTAINER);

    const firstImage = imageComponent?.images?.at(0);
    const titleText = title?.textContent?.at(0)?.text ?? '';
    const titleImages = title?.images ?? [];
    const subtitleText = subtitle?.textContent?.at(0)?.text ?? '';
    const bodyText = textContainer?.textContent?.at(0)?.text ?? '';

    return (
        <>
            <section className='mt-3 border shadow-sm'>
                <EditableOverlay component={imageComponent} onClick={onEdit}>
                    {firstImage && (
                        <Image
                            className={`object-fit-cover ${infoPictureStyles.item_picture}`}
                            src={firstImage.src}
                            alt={firstImage.alt}
                            fluid
                        />
                    )}
                </EditableOverlay>

                <div className='p-1 p-md-3 p-lg-5'>
                    <Container className='info pb-5 mt-5'>
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

                        <EditableOverlay component={textContainer} onClick={onEdit}>
                            <FormattedText text={bodyText} className={`text-start mb-0 ${infoStyles.info_text}`}/>
                        </EditableOverlay>
                    </Container>
                </div>
            </section>

            <OrphanStrip section={section} handledNames={HANDLED} onEdit={onEdit}/>
        </>
    );
};

InfoPicturePreview.propTypes = {
    section: componentContentWithEvents.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default InfoPicturePreview;
