import Carousel from 'react-bootstrap/Carousel';

import * as styles from './hero-carousel.module.scss';
import {sectionContentPropType} from '../../../common/commonPropTypes.jsx';
import {COMPONENTS} from '../../../constants/app-constants.js';
import {extractComponentsFromSection} from '../../../utils/utils.js';
import CarouselImage from '../carousel-image/carousel-image.jsx';

/**
 * A wrapper for the ReactBootstrap component
 *
 * @param {Section} content
 * @return {React.ReactNode|null}
 */
const Hero = ({content}) => {
    if (!content) return null;

    const {images} = extractComponentsFromSection(content, COMPONENTS.CAROUSEL, ['images']) || {images: []};

    return (images && images?.length > 0)
        ? (<Carousel className={`mb-1 shadow-sm ${styles.carousel}`} fade>
            {
                images.map(({src: image_url, alt: image_alt}) => (
                    <Carousel.Item key={image_url} className={styles.carousel_image_container}>
                        <CarouselImage
                            imageSrc={`${image_url}`}
                            altText={image_alt}
                        />
                        <Carousel.Caption>
                            <p>{image_alt}</p>
                        </Carousel.Caption>
                    </Carousel.Item>)
                )
            }
        </Carousel>)
        : null;
};

Hero.propTypes = sectionContentPropType;

export default Hero;