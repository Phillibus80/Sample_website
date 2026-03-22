import Container from 'react-bootstrap/Container';

import {sectionContentPropType} from '../../common/commonPropTypes.jsx';
import {COMPONENTS} from '../../constants/app-constants.js';
import * as styles from '../../sections/info/info.module.scss';
import {extractComponentsFromSection} from '../../utils/utils.js';
import FormattedText from '../formatted-text/formatted-text.jsx';
import HoneyDipperTitle from '../typography/honey-dipper-title/honey-dipper-title.jsx';
import Subtitle from '../typography/subtitle/subtitle.jsx';

/**
 * A base-level component of the Info Section
 *
 * @param {Section} content
 * @param {'Title' | 'Secondary Title'} componentTitleType
 * @return {React.ReactNode}
 */
const InfoContent = ({content, componentTitleType = COMPONENTS.TITLE}) => {
    const {
        textContent,
        images: titleImages
    } = extractComponentsFromSection(content, componentTitleType, ['textContent', 'images']) ?? {
        textContent: [],
        images: []
    };
    const {text: titleText} = textContent?.at(0) || '';

    const {textContent: subtitleTextArray} = extractComponentsFromSection(content, COMPONENTS.SUBTITLE, ['textContent']) ?? {textContent: []};
    const {text: subtitleText} = subtitleTextArray?.at(0) || '';

    const {textContent: mainBodyTextArray} = extractComponentsFromSection(content, COMPONENTS.TEXT_CONTAINER, ['textContent']) ?? {textContent: []};
    const {text: mainBodyText} = mainBodyTextArray?.at(0) || '';

    return (
        <Container className='info pb-5 mt-5'>
            <HoneyDipperTitle
                titleContent={titleText}
                imageList={titleImages}
                titleFontSize={'1.25rem'}
                showSecondDipper={false}
            />
            <Subtitle titleContent={subtitleText} imageList={titleImages}/>
            <FormattedText text={mainBodyText} className={`text-start ${styles.info_text}`}/>
        </Container>
    );
};

InfoContent.propTypes = sectionContentPropType;

export default InfoContent;