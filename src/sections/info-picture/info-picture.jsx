import {Image} from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';

import * as styles from './info-picture.module.scss';
import {componentContentWithEvents} from '../../common/commonPropTypes.jsx';
import InfoContent from '../../components/info-content/info-content.jsx';
import {COMPONENTS} from '../../constants/app-constants.js';
import {extractComponentsFromSection} from '../../utils/utils.js';

/**
 * A reusable component section that contains either a single picture or picture gallery
 * based on the number of images.
 *
 * @param {Section} content
 * @return {React.ReactNode|null}
 */
const InfoPicture = ({content}) => {
    if (!content || !content?.show_section) return null;

    const imageType = content.components.find(
        component =>
            component.component_name === COMPONENTS.IMAGE
            || component.component_name === COMPONENTS.IMAGE_GALLERY
            || component.component_name === COMPONENTS.IMAGE_LOADER
    ) || null;

    const imageContent = extractComponentsFromSection(
        content,
        imageType.component_name,
        ['images']
    );
    const images = imageContent?.images || [];

    const infoContent = {
        ...content,
        components: content.components.filter(
            component =>
                component.component_name !== COMPONENTS.IMAGE
                && component.component_name !== COMPONENTS.IMAGE_GALLERY)
    };

    /**
     * A utility function that will generate the carousel items with the image backings.
     *
     * @param {Array<ImageObject>} images
     * @return {Array<React.ReactNode>}
     */
    const generateItems = (images) => {
        return images.map(image =>
            <Carousel.Item key={image.src}>
                <Image
                    className={`object-fit-cover ${styles.item_picture}`}
                    src={`${image.src}`}
                    alt={`${image.alt}`}
                    fluid
                />
                <Carousel.Caption>
                    <p>{image.image_text}</p>
                </Carousel.Caption>
            </Carousel.Item>
        );
    };

    return (
        <section className='mt-3 border shadow-sm'>
            <Carousel fade>
                {generateItems(images)}
            </Carousel>

            <div className='p-1 p-md-3 p-lg-5'>
                <InfoContent content={infoContent}/>
            </div>
        </section>
    );
};

InfoPicture.propTypes = componentContentWithEvents;

export default InfoPicture;