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
        <div className={`${styles.imageGradient}`}>
            <Image
                className='object-fit-cover'
                style={{width: '100%', height: '100%'}}
                src={imageSrc}
                fluid
            />
        </div>
    );
};

CarouselImage.propTypes = {
    imageSrc: PropTypes.string.isRequired
};

export default CarouselImage;