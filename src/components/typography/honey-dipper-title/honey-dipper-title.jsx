import PropTypes from 'prop-types';
import {Image} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';

import * as styles from './honey-dipper-title.module.scss';
import {toTitleCase} from '../../../utils/utils.js';

/**
 * The title with two honey dipper images in black.
 * @param {string} titleContent
 * @param {Array<ImageObject>} imageList
 * @param {string} titleFontSize
 * @param {boolean} showSecondDipper
 * @return {React.ReactNode|null}
 */
const honeyDipperTitle = ({titleContent, imageList, titleFontSize, showSecondDipper = false}) => {
    if (!titleContent) return null;

    const dynamicFontSize = titleFontSize
        ? {
            fontSize: `${titleFontSize}`
        }
        : '';

    const {src: honeyDipperImage} = imageList.at(0);

    return (
        <Container className={`
                    d-flex 
                    justify-content-start 
                    align-items-start
                    ${styles.title}
                   `}>
            <div className={`${styles.title_image} pe-2`}>
                <Image
                    src={`${honeyDipperImage}`}
                    fluid
                />
            </div>
            <span style={{...dynamicFontSize}} className={styles.title_text}>
                {toTitleCase(titleContent)}
            </span>
            {showSecondDipper && <Image
                className={styles.title_image}
                src={`${honeyDipperImage}`}
                fluid
            />}
        </Container>
    );
};

honeyDipperTitle.propTypes = {
    images: PropTypes.shape({
        image_list: PropTypes.arrayOf(
            PropTypes.shape({
                image_url: PropTypes.string,
                image_alt: PropTypes.string
            })
        )
    }),
    showSecondDipper: PropTypes.bool,
    titleContent: PropTypes.string.isRequired,
    titleFontSize: PropTypes.string
};

export default honeyDipperTitle;