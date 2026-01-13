import * as styles from './events-list.module.scss';
import {componentContentWithEvents} from '../../common/commonPropTypes.jsx';
import LeafletEvents from '../../components/events/leaflet-events/leaflet-events.jsx';
import SectionStyleWrapper from '../../components/section-style-wrapper/section-style-wrapper.jsx';
import HoneyDipperTitle from '../../components/typography/honey-dipper-title/honey-dipper-title.jsx';
import Subtitle from '../../components/typography/subtitle/subtitle.jsx';
import {COMPONENTS} from '../../constants/app-constants.js';
import {extractComponentsFromSection} from '../../utils/utils.js';

/**
 * The events list section.  This uses the Google Maps API.
 *
 * @param {Section} content
 * @return {React.ReactNode|null}
 */
const EventList = ({content}) => {
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

    const {events: eventContent} = extractComponentsFromSection(content, COMPONENTS.EVENT_LIST, ['events']) ?? {events: []};

    return (
        <SectionStyleWrapper>
            <div className={styles.events}>
                <HoneyDipperTitle
                    titleContent={titleText}
                    imageList={titleImages}
                    titleFontSize={'1.25rem'}
                    showSecondDipper={false}
                />
                <Subtitle titleContent={subtitleText} imageList={titleImages}/>
                <LeafletEvents events={eventContent}/>
            </div>
        </SectionStyleWrapper>
    );
};

EventList.propTypes = componentContentWithEvents;

export default EventList;