import Container from 'react-bootstrap/Container';

import {sectionContentPropType} from '../../common/commonPropTypes.jsx';
import LinearHoneycombGrid from '../../components/galleries/linear-honeycomb-grid/linear-honeycomb-grid.jsx';
import SectionStyleWrapper from '../../components/section-style-wrapper/section-style-wrapper.jsx';
import HoneyDipperTitle from '../../components/typography/honey-dipper-title/honey-dipper-title.jsx';
import Subtitle from '../../components/typography/subtitle/subtitle.jsx';
import {COMPONENTS} from '../../constants/app-constants.js';
import {extractComponentsFromSection} from '../../utils/utils.js';

/**
 * An image gallery that takes the images and use a hexagon css mask.  While on large screens it aligns
 * horizontally, on smaller screens the images align vertically.
 *
 * @param {Section} content
 * @return {React.ReactNode|null}
 */
const hexPictureGallery = ({content}) => {
    if (!content || !content?.show_section) return null;

    const {
        textContent,
        images: titleImages
    } = extractComponentsFromSection(content, COMPONENTS.TITLE, ['textContent', 'images']) ?? {
        textContent: [],
        images: []
    };

    const {textContent: subTitleTextContent} = extractComponentsFromSection(content, COMPONENTS.SUBTITLE, ['textContent']) ?? {textContent: []};

    const {images} = extractComponentsFromSection(content, COMPONENTS.STACKABLE_HEX_GALLERY, ['images', 'links']) ?? {
        images: [],
        links: []
    };

    return (
        <SectionStyleWrapper>
            <Container className='pb-5 mt-5'>
                <HoneyDipperTitle
                    titleContent={textContent.at(0).text}
                    imageList={titleImages}
                    titleFontSize={'1.25rem'}
                    showSecondDipper={false}
                />
                <Subtitle titleContent={subTitleTextContent.at(0).text} imageList={titleImages}/>

                <LinearHoneycombGrid imageList={images}/>
            </Container>
        </SectionStyleWrapper>
    );
};

hexPictureGallery.propTypes = sectionContentPropType;

export default hexPictureGallery;