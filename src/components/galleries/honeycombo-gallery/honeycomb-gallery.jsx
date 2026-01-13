import React from 'react';

import PropTypes from 'prop-types';
import {Row} from 'react-bootstrap';

import * as styles from './honeycomb-gallery.module.scss';
import HoneycombImage from '../honeycomb-image/honeycomb-image.jsx';

/**
 * An image gallery that mimics a honeycomb pattern going from left to right.
 * @param {Array<ImageObject>} imageList
 * @return {React.ReactNode|null}
 */
const honeycombGallery = ({imageList}) => {
    if (!imageList || imageList.length === 0) return null;

    return (
        <Row className='ps-sm-0 mw-100 overflow-hidden'>
            <div className={
                `${styles.gallery} 
                 ${imageList.length <= 3 ? 'justify-content-center' : 'justify-content-start'}
                 overflow-hidden
                 d-md-block 
                 d-lg-grid
                 p-sm-0
                 ps-lg-5
                 mb-sm-0
                 mb-md-4
             `}>
                {
                    imageList.map(({src: image_url, alt: image_alt}, index) => (
                        <div
                            key={`${image_url}_${index}`}
                            className={`${styles.gallery_image}`}
                        >
                            <HoneycombImage image_src={image_url} image_alt={image_alt}/>
                        </div>
                    ))
                }
            </div>
        </Row>
    );
};

honeycombGallery.propTypes = {
    imageList: PropTypes.arrayOf(
        PropTypes.shape({
            alt: PropTypes.string.isRequired,
            image_id: PropTypes.string,
            image_text: PropTypes.string,
            page_section_component_id: PropTypes.string,
            src: PropTypes.string.isRequired
        })
    ).isRequired,
};

export default honeycombGallery;