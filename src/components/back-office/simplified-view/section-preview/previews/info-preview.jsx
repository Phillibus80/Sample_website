import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';

import {componentContentWithEvents} from '../../../../../common/commonPropTypes.jsx';
import SectionStyleWrapper from '../../../../../components/section-style-wrapper/section-style-wrapper.jsx';
import HoneyDipperTitle from '../../../../../components/typography/honey-dipper-title/honey-dipper-title.jsx';
import Subtitle from '../../../../../components/typography/subtitle/subtitle.jsx';
import {COMPONENTS} from '../../../../../constants/app-constants.js';
import * as infoStyles from '../../../../../sections/info/info.module.scss';
import EditableOverlay from '../../editable-overlay/editable-overlay.jsx';
import OrphanStrip from '../orphan-strip.jsx';
import {findComponent} from '../utils.js';

const HANDLED = [COMPONENTS.TITLE, COMPONENTS.SUBTITLE, COMPONENTS.TEXT_CONTAINER];

/**
 * Mirrors src/sections/info/info.jsx → InfoContent. InfoContent renders
 * title, subtitle, and body text as a single block so it can't be reused
 * whole — each piece is laid out here with the same sub-components and
 * classes but wrapped individually.
 *
 * Subtitle receives the TITLE component's images (matching InfoContent's
 * behaviour of passing titleImages to both title and subtitle).
 *
 * @param {Section} section
 * @param {function} onEdit
 * @return {React.ReactNode}
 */
const InfoPreview = ({section, onEdit}) => {
    const title = findComponent(section, COMPONENTS.TITLE);
    const subtitle = findComponent(section, COMPONENTS.SUBTITLE);
    const textContainer = findComponent(section, COMPONENTS.TEXT_CONTAINER);

    const titleText = title?.textContent?.at(0)?.text ?? '';
    const titleImages = title?.images ?? [];
    const subtitleText = subtitle?.textContent?.at(0)?.text ?? '';
    const bodyText = textContainer?.textContent?.at(0)?.text ?? '';

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

                    <EditableOverlay component={textContainer} onClick={onEdit}>
                        <p className={`text-start mb-0 ${infoStyles.info_text}`}>{bodyText}</p>
                    </EditableOverlay>
                </Container>
            </SectionStyleWrapper>

            <OrphanStrip section={section} handledNames={HANDLED} onEdit={onEdit}/>
        </>
    );
};

InfoPreview.propTypes = {
    section: componentContentWithEvents.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default InfoPreview;
