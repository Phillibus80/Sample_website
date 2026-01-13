import PropTypes from 'prop-types';
import Image from 'react-bootstrap/Image';

import * as styles from './social-media-gallery.module.scss';

/**
 * A reusable component used to display images or link-wrapped images.
 *
 * @param {Array<ImageObject>} socialMediaImages
 * @param {Array<LinkObject>} socialMediaLinks
 */
const SocialMediaGallery = ({socialMediaImages, socialMediaLinks}) => {
    if (!socialMediaImages || socialMediaImages.length === 0) return null;
    /**
     *
     * @return {Array<React.ReactNode>}
     */
    const generateSocialImages = (firstHalf = true) => {
        return socialMediaImages?.reduce((accum, content, index) => {
                const middle = Math.ceil(socialMediaImages?.length / 2);
                const getCondition = () => firstHalf ? middle <= index : middle > index;

                getCondition()
                && accum.push(
                    <div
                        key={`${content.component_content_id}`}
                        className={
                            `${styles.social_gallery_image} 
                                        overflow-hidden 
                                        me-1`
                        }
                    >
                        <a href={`${socialMediaLinks?.at(index)?.link_url ?? ''}`}>
                            <figure
                                className={`${styles.social_gallery_image} me-3`}
                            >
                                <Image src={`${content?.src}`} fluid/>
                            </figure>
                        </a>
                    </div>
                );

                return accum;
            }, []
        );
    };

    return (
        <div className='text-start mt-5'>
            <h3 className={`${styles.social_gallery_title} text-start`}>Social Gallery</h3>
            <div className={`d-grid justify-content-start p-3 ${styles.social_gallery}`}>
                {
                    generateSocialImages()
                }
                {
                    generateSocialImages(false)
                }
            </div>
        </div>
    );
};

SocialMediaGallery.propTypes = {
    socialMediaImages: PropTypes.arrayOf(PropTypes.shape({
        component_content_id: PropTypes.string,
        alt: PropTypes.string,
        image_id: PropTypes.string,
        image_text: PropTypes.string,
        page_section_component_id: PropTypes.string,
        src: PropTypes.string
    })).isRequired,
    socialMediaLinks: PropTypes.arrayOf(PropTypes.shape({
        component_content_id: PropTypes.string,
        link_id: PropTypes.string,
        link_text: PropTypes.string,
        link_url: PropTypes.string,
        page_section_component_id: PropTypes.string
    })).isRequired
};

export default SocialMediaGallery;