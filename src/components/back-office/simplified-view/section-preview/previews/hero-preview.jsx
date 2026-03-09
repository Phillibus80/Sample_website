import PropTypes from 'prop-types';

import {componentContentWithEvents} from '../../../../../common/commonPropTypes.jsx';
import CarouselImage from '../../../../../components/galleries/carousel-image/carousel-image.jsx';
import * as carouselStyles from '../../../../../components/galleries/hero-carousel/hero-carousel.module.scss';
import {COMPONENTS} from '../../../../../constants/app-constants.js';
import EditableOverlay from '../../editable-overlay/editable-overlay.jsx';
import OrphanStrip from '../orphan-strip.jsx';
import {findComponent} from '../utils.js';

const HANDLED = [COMPONENTS.CAROUSEL];

/**
 * Mirrors src/sections/hero/hero.jsx visually. Shows only the first carousel
 * image, static — the rotation is noise in an editing context and the user's
 * spec calls for "show the first image in the preview".
 *
 * @param {Section} section
 * @param {function} onEdit
 * @return {React.ReactNode}
 */
const HeroPreview = ({section, onEdit}) => {
    const carousel = findComponent(section, COMPONENTS.CAROUSEL);
    const firstImage = carousel?.images?.at(0);

    return (
        <>
            <section className='shadow-sm'>
                <EditableOverlay component={carousel} onClick={onEdit}>
                    {firstImage && (
                        <div className={carouselStyles.carousel_image_container}>
                            <CarouselImage imageSrc={firstImage.src} altText={firstImage.alt}/>
                        </div>
                    )}
                </EditableOverlay>
            </section>

            <OrphanStrip section={section} handledNames={HANDLED} onEdit={onEdit}/>
        </>
    );
};

HeroPreview.propTypes = {
    section: componentContentWithEvents.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default HeroPreview;
