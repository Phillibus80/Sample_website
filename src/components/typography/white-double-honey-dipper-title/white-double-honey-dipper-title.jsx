import PropTypes from 'prop-types';
import {Image} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';

import * as styles from './white-double-honey-dipper-title.module.scss';
import {toTitleCase} from '../../../utils/utils.js';

/**
 * The title with two honey dipper images in white.
 * @param {string} titleContent
 * @param {Array<ImageObject>} imageList
 * @param {string} titleFontSize
 * @param {boolean} showSecondDipper
 * @return {React.ReactNode|null}
 */
const whiteDoubleHoneyDipperTitle = ({titleContent, imageList, titleFontSize, showSecondDipper = false}) => {
    if (!titleContent || !imageList || imageList.length < 1) return null;

    const dynamicFontSize = titleFontSize
        ? {
            fontSize: `${titleFontSize}`
        }
        : {};

    const {src: honeyDipperImage} = imageList?.at(0) ?? {src: ''};

    return (
        <Container className='d-flex justify-content-center align-items-start'>
            <div className={`${styles.title_image} pe-2`}>
                <Image
                    src={`${honeyDipperImage}`}
                    fluid
                />
            </div>
            <span style={{...dynamicFontSize}} className={`${styles.title_text} pe-2`}>
                {toTitleCase(titleContent)}
            </span>
            {
                showSecondDipper
                && <div className={`${styles.title_image} ${styles.title_image_flipped}`}>
                    <Image
                        className={`title_image_flipped`}
                        src={`${honeyDipperImage}`}
                        fluid
                    />
                </div>
            }
        </Container>
    );
};

whiteDoubleHoneyDipperTitle.propTypes = {
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

export default whiteDoubleHoneyDipperTitle;