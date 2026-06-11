import PropTypes from 'prop-types';
import {Image} from 'react-bootstrap';

import * as styles from './carousel-image.module.scss';

/**
 * A wrapper component for the Carousel Image
 *
 * @param {string} imageSrc
 * @return {React.ReactNode}
 */
const CarouselImage = ({imageSrc}) => {
    return (
        <Image
            className={styles.carouselImage}
            src={imageSrc}
            alt=''
        />
    );
};

CarouselImage.propTypes = {
    imageSrc: PropTypes.string.isRequired
};

export default CarouselImage;