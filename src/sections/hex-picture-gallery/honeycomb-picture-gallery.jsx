import {sectionContentPropType} from '../../common/commonPropTypes.jsx';
import HoneycombGallery from '../../components/galleries/honeycombo-gallery/honeycomb-gallery.jsx';
import InfoContent from '../../components/info-content/info-content.jsx';
import SectionStyleWrapper from '../../components/section-style-wrapper/section-style-wrapper.jsx';
import CursiveTitle from '../../components/typography/cursive-title/cursive-title.jsx';
import {COMPONENTS} from '../../constants/app-constants.js';
import {extractComponentsFromSection} from '../../utils/utils.js';

/**
 * A composed Section made up of a Hex Image Gallery and an Info Section
 *
 * @param  {Section} content - the section content returned from the api
 * @return {React.ReactNode | null}
 */
const HoneycombPictureGallery = ({content}) => {
    if (!content || !content?.show_section) return null;

    /**
     * This About Us Hex Gallery is a composed Section consisting of
     * both a Hex Gallery and an Info Section.  Being as such, this splits
     * the components into their respective Sections.
     *
     * @return{{hexGalleryContent: Array<Component>, infoContent: Array<Component>}}
     */
    const splitContent = content?.components?.reduce(
        (accum, current) => {
            switch (current?.component_name) {
                case COMPONENTS.HEX_IMAGE_GROUP:
                    accum.hexGalleryContent.push(current);
                    break;
                case COMPONENTS.TITLE:
                    accum.hexGalleryContent.push(current);
                    break;
                case COMPONENTS.SECONDARY_TITLE:
                    accum.infoContent.push(current);
                    break;
                default:
                    accum.infoContent.push(current);
                    break;
            }

            return accum;
        }, {
            hexGalleryContent: [],
            infoContent: []
        });

    /**
     * Reconfigured the content to be a Hex Gallery Section specific type
     * @type {Section}
     */
    const hexGalleryContent = {
        ...content,
        components: splitContent.hexGalleryContent
    };

    /**
     * Reconfigured the content to an Info Section specific type
     * @type {Section}
     */
    const infoContent = {
        ...content,
        components: splitContent.infoContent
    };

    const {textContent} = extractComponentsFromSection(hexGalleryContent, COMPONENTS.TITLE, ['textContent']) || {textContent: []};
    const {text: txtContent} = textContent?.at(0) || '';

    const {images} = extractComponentsFromSection(hexGalleryContent, COMPONENTS.HEX_IMAGE_GROUP, ['images', 'links']) || {images: []};

    return (
        <SectionStyleWrapper>
            <CursiveTitle strContent={txtContent} titleFontSize={'3rem'}/>
            <HoneycombGallery imageList={images}/>
            <InfoContent content={infoContent} componentTitleType={COMPONENTS.SECONDARY_TITLE}/>
        </SectionStyleWrapper>
    );
};

HoneycombPictureGallery.propTypes = sectionContentPropType;

export default HoneycombPictureGallery;