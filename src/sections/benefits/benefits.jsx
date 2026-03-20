import {useEffect, useRef, useState} from 'react';

import Container from 'react-bootstrap/Container';

import * as styles from './benefits.module.scss';
import {sectionContentPropType} from '../../common/commonPropTypes.jsx';
import HoneycombImage from '../../components/galleries/honeycomb-image/honeycomb-image.jsx';
import SectionStyleWrapper from '../../components/section-style-wrapper/section-style-wrapper.jsx';
import Subtitle from '../../components/typography/subtitle/subtitle.jsx';
import WhiteDoubleHoneyDipperTitle
    from '../../components/typography/white-double-honey-dipper-title/white-double-honey-dipper-title.jsx';
import {COMPONENTS} from '../../constants/app-constants.js';
import {extractComponentsFromSection} from '../../utils/utils.js';

/**
 * The Benefits section that displays the white title, a honeycomb main image, and a highlighted list.
 *
 * @param {Section} content
 * @return {React.ReactNode|null}
 */
const Benefits = ({content}) => {
    const listItemRefs = useRef(new Map());
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        if (listItemRefs.current.size >= 1) {
            const highlightInterval = setInterval(() => {
                setCounter(prev => ((prev + 1) >= listItemRefs.current.size) ? 0 : prev + 1);
            }, 5000);
            return () => clearInterval(highlightInterval);
        }
    }, [counter]);

    if (!content || !content?.show_section) return null;

    const {
        textContent,
        images: titleImages
    } = extractComponentsFromSection(content, COMPONENTS.TITLE, ['textContent', 'images']) ?? {
        textContent: [],
        images: []
    };
    const {text: titleText} = textContent?.at(0) ?? {text: ''};

    const {textContent: subtitleTextArray} = extractComponentsFromSection(content, COMPONENTS.SUBTITLE, ['textContent']) ?? {textContent: []};
    const {text: subtitleText} = subtitleTextArray?.at(0) ?? {text: ''};

    const {images: hexImages} = extractComponentsFromSection(content, COMPONENTS.HEX_IMAGE, ['images']) ?? {images: []};
    const {src: hexImage, alt} = hexImages?.at(0) ?? {src: ''};

    const {textContent: benefitsTextContent} = extractComponentsFromSection(content, COMPONENTS.BENEFITS_LIST, ['textContent']) ?? {textContent: []};

    /**
     * A function used to generate the Benefits list items
     * @param {Array<TextContentObject>} benefitsTextContent
     * @return {Array<React.ReactNode>}
     */
    const generateBenefits = benefitsTextContent => benefitsTextContent?.map((benefit, index) => (
            <div
                ref={currentItem => {
                    listItemRefs.current.set(index, currentItem);
                }}
                key={benefit?.text}
                className={
                    `${styles.benefits_list_item}  
                    ${counter === index && styles.benefits_list_item_highlight}                         
                    text-start 
                    rounded-4
                    pt-4 
                    pb-3
                    ps-2
                    pe-2
                    `}
            >
                <p>{benefit?.text}</p>
            </div>
        )
    );

    return (
        <SectionStyleWrapper backgroundColor='#ffb508'>
            <WhiteDoubleHoneyDipperTitle
                titleContent={titleText}
                imageList={titleImages}
                titleFontSize={'2rem'}
                showSecondDipper={true}
            />
            <Subtitle titleContent={subtitleText} imageList={titleImages} fontColor='white'/>

            <div className={`${styles.benefits_image} justify-content-center`}>
                <HoneycombImage image_src={`${hexImage}`} image_alt={alt}/>
            </div>

            <Container>
                {generateBenefits(benefitsTextContent)}
            </Container>
        </SectionStyleWrapper>
    );
};

Benefits.propTypes = sectionContentPropType;

export default Benefits;