import PropTypes from 'prop-types';

import GenericPreview from './generic-preview.jsx';
import * as styles from './section-preview.module.scss';
import {getOrphans} from './utils.js';
import {componentContentWithEvents} from '../../../../common/commonPropTypes.jsx';

/**
 * Renders any editable components the parent preview didn't explicitly
 * handle, as a generic card strip below the faithful layout. Catches
 * dev-drift (preview forgot a component) and DB orphans (content attached
 * to an unexpected component). Silent when there's nothing to show.
 *
 * @param {Section} section
 * @param {Array<string>} handledNames — component_name values the preview rendered
 * @param {function} onEdit
 * @return {React.ReactNode|null}
 */
const OrphanStrip = ({section, handledNames, onEdit}) => {
    const orphans = getOrphans(section, handledNames);

    if (orphans.length === 0) return null;

    return (
        <div className={styles.orphanStrip}>
            <div className={styles.orphanStripLabel}>Other components</div>
            <GenericPreview section={{...section, components: orphans}} onEdit={onEdit}/>
        </div>
    );
};

OrphanStrip.propTypes = {
    section: componentContentWithEvents.isRequired,
    handledNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onEdit: PropTypes.func.isRequired
};

export default OrphanStrip;
