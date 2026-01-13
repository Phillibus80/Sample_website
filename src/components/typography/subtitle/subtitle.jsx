import PropTypes from 'prop-types';
import {Image} from 'react-bootstrap';

import * as styles from './subtitle.module.scss';
import {toTitleCase} from '../../../utils/utils.js';

/**
 * A component that displays a general use subtitle, with the option to show a
 * honey dipper image.
 *
 * @param {string} titleContent
 * @param {Array<ImageObject>} imageList
 * @param {boolean} [showImage]
 * @param {string} [fontColor]
 *
 * @return {React.ReactNode|null}
 */
const Subtitle = ({titleContent, imageList, showImage = false, fontColor = 'black'}) => {
    if (!titleContent || !imageList || imageList.length < 1) return null;

    const {src: honeyDipperImage} = imageList?.at(0) || {src: ''};

    return (
        <section className={`d-flex justify-content-start g-3 ${styles.subtitle}`}>
            {
                showImage &&
                <Image
                    className={`${styles.subtitle_image}`}
                    src={`${honeyDipperImage}`}
                    fluid
                />
            }
            <div style={{
                'color': `${fontColor}`
            }} className={`${styles.subtitle_text}`}>
                <p>{toTitleCase(titleContent)}</p>
            </div>
        </section>
    );
};

Subtitle.propTypes = {
    imageList: PropTypes.arrayOf(
        PropTypes.shape({
            image_url: PropTypes.string,
            image_alt: PropTypes.string
        })
    ),
    titleContent: PropTypes.string.isRequired,
    showImage: PropTypes.bool,
    fontColor: PropTypes.string
};

export default Subtitle;