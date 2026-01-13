import PropTypes from 'prop-types';
import {Image} from 'react-bootstrap';

import * as styles from './honeycomb-image.module.scss';

/**
 * A wrapper component that takes the image and uses a svg mask to make the result in
 * a hexagon shape.
 *
 * @param {string} image_src
 * @param {string} image_alt
 * @return {React.ReactNode}
 */
const honeycombImage = ({image_src, image_alt}) => {
    return (
        <figure className={`${styles.honeycomb} mb-0`}>
            <Image
                className={`${styles.honeycomb_image}`}
                src={`${image_src}`}
                alt={image_alt}
                fluid
            />
        </figure>
    );
};

honeycombImage.propTypes = {
    image_src: PropTypes.string.isRequired,
    image_alt: PropTypes.string.isRequired
};

export default honeycombImage;