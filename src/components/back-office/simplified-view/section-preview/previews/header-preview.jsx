import PropTypes from 'prop-types';

import {componentContentWithEvents} from '../../../../../common/commonPropTypes.jsx';
import Navi from '../../../../../components/navi/navi.jsx';
import {COMPONENTS} from '../../../../../constants/app-constants.js';
import EditableOverlay from '../../editable-overlay/editable-overlay.jsx';
import OrphanStrip from '../orphan-strip.jsx';
import {findComponent} from '../utils.js';

const HANDLED = [COMPONENTS.MENU];

/**
 * Mirrors src/components/navi/navi.jsx. The public Header section
 * (header.jsx) fetches its own page content via useGetPageContent and ignores
 * props, so it can't be reused here — Navi is the pure-render layer beneath
 * it and takes the section directly.
 *
 * Menu is a single component carrying logo image + link, title text, and nav
 * links together, so the whole navbar sits under one overlay. Nav.Link hrefs
 * inside are neutralised by the overlay's capture-phase click handler.
 *
 * @param {Section} section
 * @param {function} onEdit
 * @return {React.ReactNode}
 */
const HeaderPreview = ({section, onEdit}) => {
    const menu = findComponent(section, COMPONENTS.MENU);

    return (
        <>
            <EditableOverlay component={menu} onClick={onEdit}>
                <Navi headerContent={section}/>
            </EditableOverlay>

            <OrphanStrip section={section} handledNames={HANDLED} onEdit={onEdit}/>
        </>
    );
};

HeaderPreview.propTypes = {
    section: componentContentWithEvents.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default HeaderPreview;
