import React from 'react';

import PropTypes from 'prop-types';

import * as styles from './linear-honeycomb-grid.module.scss';
import HoneycombImage from '../honeycomb-image/honeycomb-image.jsx';

/**
 * A gallery that aligns the images in a linear pattern.  On smaller screens, the image
 * align vertically.
 *
 * @param {Array<ImageObject>} imageList
 * @return {React.ReactNode|null}
 */
const LinearHoneycombGrid = ({imageList}) => {
    if (!imageList || imageList.length === 0) return null;

    return (
        <div
            className={`${styles.honeycomb_gallery} d-flex flex-column mt-sm-3 mt-md-5 flex-md-row flex-lg-nowrap g-sm-0 g-lg-0`}>
            {imageList.map((image, index) =>
                <div
                    key={`${image.src}_${index}`}
                    className={styles.honeycomb_gallery_image}
                >
                    <HoneycombImage image_src={image.src} image_alt={image.alt}/>
                </div>
            )}
        </div>
    );
};

LinearHoneycombGrid.propTypes = {
    imageList: PropTypes.arrayOf(
        PropTypes.shape({
            component_content_id: PropTypes.string,
            alt: PropTypes.string,
            image_id: PropTypes.string,
            image_text: PropTypes.string,
            page_section_component_id: PropTypes.string,
            src: PropTypes.string
        })
    ).isRequired,
};

export default LinearHoneycombGrid;
