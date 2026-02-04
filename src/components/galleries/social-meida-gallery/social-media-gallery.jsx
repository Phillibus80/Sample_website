import PropTypes from 'prop-types';
import Image from 'react-bootstrap/Image';

import * as styles from './social-media-gallery.module.scss';
import {imageComponentPropType, linkComponentPropType} from '../../../common/commonPropTypes.jsx';

/**
 * A reusable component used to display images or link-wrapped images.
 *
 * @param {Array<ImageObject>} socialMediaImages
 * @param {Array<LinkObject>} socialMediaLinks
 */
const SocialMediaGallery = ({socialMediaImages, socialMediaLinks}) => {
    if (!socialMediaImages || socialMediaImages.length === 0) return null;

    const getExternalUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
            return url;
        }
        return `https://${url}`;
    };

    return (
        <div className='text-start mt-5'>
            <h3 className={`${styles.social_gallery_title} text-start`}>Social Gallery</h3>
            <div className={`${styles.social_gallery}`}>
                {socialMediaImages.map((content, index) => (
                    <div
                        key={content.component_content_id}
                        className={styles.social_gallery_image}
                    >
                        {
                            socialMediaLinks?.at(index)?.link_url
                                ? <a
                                    href={getExternalUrl(socialMediaLinks?.at(index)?.link_url)}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <figure className='m-0'>
                                        <Image src={content.src} fluid/>
                                    </figure>
                                </a>
                                : <figure className='m-0'>
                                    <Image src={content.src} fluid/>
                                </figure>
                        }
                    </div>
                ))}
            </div>
        </div>
    );
};

SocialMediaGallery.propTypes = {
    socialMediaImages: PropTypes.arrayOf(imageComponentPropType).isRequired,
    socialMediaLinks: PropTypes.arrayOf(linkComponentPropType).isRequired
};

export default SocialMediaGallery;