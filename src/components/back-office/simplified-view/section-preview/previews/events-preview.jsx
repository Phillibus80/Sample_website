import PropTypes from 'prop-types';

import {componentContentWithEvents} from '../../../../../common/commonPropTypes.jsx';
import LeafletEvents from '../../../../../components/events/leaflet-events/leaflet-events.jsx';
import SectionStyleWrapper from '../../../../../components/section-style-wrapper/section-style-wrapper.jsx';
import HoneyDipperTitle from '../../../../../components/typography/honey-dipper-title/honey-dipper-title.jsx';
import Subtitle from '../../../../../components/typography/subtitle/subtitle.jsx';
import {COMPONENTS} from '../../../../../constants/app-constants.js';
import EditableOverlay from '../../editable-overlay/editable-overlay.jsx';
import OrphanStrip from '../orphan-strip.jsx';
import {findComponent} from '../utils.js';

const HANDLED = [COMPONENTS.TITLE, COMPONENTS.SUBTITLE, COMPONENTS.EVENT_LIST];

/**
 * Mirrors src/sections/events-list/events-list.jsx. LeafletEvents is reused
 * as-is — the overlay's capture-phase click handler neutralises pan/zoom/
 * marker clicks so interacting with the map opens the editor instead.
 *
 * LeafletEvents filters out events with placeholder titles (leaflet-events.jsx:42),
 * so a freshly-seeded event won't paint here until its title is changed. The
 * overlay still renders (events array is non-empty → hasEditableContent true)
 * giving a min-height 60px click target with just the badge.
 *
 * If Leaflet's tabbed-container sizing bug surfaces (map tiles render at 0×0
 * when the Pages tab was hidden on mount), swap this for a static card list.
 *
 * @param {Section} section
 * @param {function} onEdit
 * @return {React.ReactNode}
 */
const EventsPreview = ({section, onEdit}) => {
    const title = findComponent(section, COMPONENTS.TITLE);
    const subtitle = findComponent(section, COMPONENTS.SUBTITLE);
    const eventList = findComponent(section, COMPONENTS.EVENT_LIST);

    const titleText = title?.textContent?.at(0)?.text ?? '';
    const titleImages = title?.images ?? [];
    const subtitleText = subtitle?.textContent?.at(0)?.text ?? '';
    const events = eventList?.events ?? [];

    return (
        <>
            <SectionStyleWrapper>
                <div>
                    <EditableOverlay component={title} onClick={onEdit}>
                        <HoneyDipperTitle
                            titleContent={titleText}
                            imageList={titleImages}
                            titleFontSize={'1.25rem'}
                            showSecondDipper={false}
                        />
                    </EditableOverlay>

                    <EditableOverlay component={subtitle} onClick={onEdit}>
                        <Subtitle titleContent={subtitleText} imageList={titleImages}/>
                    </EditableOverlay>

                    <EditableOverlay component={eventList} onClick={onEdit}>
                        <LeafletEvents events={events}/>
                    </EditableOverlay>
                </div>
            </SectionStyleWrapper>

            <OrphanStrip section={section} handledNames={HANDLED} onEdit={onEdit}/>
        </>
    );
};

EventsPreview.propTypes = {
    section: componentContentWithEvents.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default EventsPreview;
