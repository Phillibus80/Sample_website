import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';

import {componentContentWithEvents} from '../../../../../common/commonPropTypes.jsx';
import HoneycombImage from '../../../../../components/galleries/honeycomb-image/honeycomb-image.jsx';
import SectionStyleWrapper from '../../../../../components/section-style-wrapper/section-style-wrapper.jsx';
import Subtitle from '../../../../../components/typography/subtitle/subtitle.jsx';
import WhiteDoubleHoneyDipperTitle
    from '../../../../../components/typography/white-double-honey-dipper-title/white-double-honey-dipper-title.jsx';
import {COMPONENTS} from '../../../../../constants/app-constants.js';
import * as benefitsStyles from '../../../../../sections/benefits/benefits.module.scss';
import EditableOverlay from '../../editable-overlay/editable-overlay.jsx';
import OrphanStrip from '../orphan-strip.jsx';
import {findComponent} from '../utils.js';

const HANDLED = [
    COMPONENTS.TITLE,
    COMPONENTS.SUBTITLE,
    COMPONENTS.HEX_IMAGE,
    COMPONENTS.BENEFITS_LIST
];

/**
 * Mirrors src/sections/benefits/benefits.jsx. The public section runs a
 * setInterval that cycles a highlight class across list items every 5s;
 * that's dropped here — the back-office re-renders on every mutation and
 * the cycling is purely decorative.
 *
 * The section's yellow background matches the overlay border colour; the
 * badge and hover tint still distinguish editable regions.
 *
 * @param {Section} section
 * @param {function} onEdit
 * @return {React.ReactNode}
 */
const BenefitsPreview = ({section, onEdit}) => {
    const title = findComponent(section, COMPONENTS.TITLE);
    const subtitle = findComponent(section, COMPONENTS.SUBTITLE);
    const hexImage = findComponent(section, COMPONENTS.HEX_IMAGE);
    const benefitsList = findComponent(section, COMPONENTS.BENEFITS_LIST);

    const titleText = title?.textContent?.at(0)?.text ?? '';
    const titleImages = title?.images ?? [];
    const subtitleText = subtitle?.textContent?.at(0)?.text ?? '';
    const {src: hexImageSrc, alt: hexImageAlt} = hexImage?.images?.at(0) ?? {src: '', alt: ''};
    const benefitsTextContent = benefitsList?.textContent ?? [];

    return (
        <>
            <SectionStyleWrapper backgroundColor='#ffb508'>
                <EditableOverlay component={title} onClick={onEdit} contrast>
                    <WhiteDoubleHoneyDipperTitle
                        titleContent={titleText}
                        imageList={titleImages}
                        titleFontSize={'2rem'}
                        showSecondDipper={true}
                    />
                </EditableOverlay>

                <EditableOverlay component={subtitle} onClick={onEdit} contrast>
                    <Subtitle titleContent={subtitleText} imageList={titleImages} fontColor='white'/>
                </EditableOverlay>

                <EditableOverlay component={hexImage} onClick={onEdit} contrast>
                    <div className={`${benefitsStyles.benefits_image} justify-content-center`}>
                        <HoneycombImage image_src={hexImageSrc} image_alt={hexImageAlt}/>
                    </div>
                </EditableOverlay>

                <EditableOverlay component={benefitsList} onClick={onEdit} contrast>
                    <Container className={benefitsStyles.benefits_list}>
                        {benefitsTextContent.map((benefit) => (
                            <div
                                key={benefit?.text}
                                className={`${benefitsStyles.benefits_list_item} text-start rounded-4 pt-4 pb-3 ps-2 pe-2`}
                            >
                                <p>{benefit?.text}</p>
                            </div>
                        ))}
                    </Container>
                </EditableOverlay>
            </SectionStyleWrapper>

            <OrphanStrip section={section} handledNames={HANDLED} onEdit={onEdit}/>
        </>
    );
};

BenefitsPreview.propTypes = {
    section: componentContentWithEvents.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default BenefitsPreview;
