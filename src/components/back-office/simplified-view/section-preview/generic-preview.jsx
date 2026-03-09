import PropTypes from 'prop-types';

import GenericCardBody from './generic-card-body.jsx';
import * as styles from './section-preview.module.scss';
import {hasEditableContent} from './utils.js';
import {componentContentWithEvents} from '../../../../common/commonPropTypes.jsx';
import EditableOverlay from '../editable-overlay/editable-overlay.jsx';

/**
 * Fallback preview for section types the dispatcher doesn't recognise, and
 * the body of the orphan-catcher strip. Renders each editable component as a
 * compact card inside an EditableOverlay; clicking any card opens its editor.
 *
 * Components with no editable content (structural markers like Email Field)
 * are filtered out — there is nothing for a non-SUPER role to act on.
 *
 * @param {Section} section
 * @param {function} onEdit — receives the clicked Component object
 * @return {React.ReactNode|null}
 */
const GenericPreview = ({section, onEdit}) => {
    const editable = section?.components?.filter(hasEditableContent) ?? [];

    if (editable.length === 0) return null;

    return (
        <div className={styles.genericGrid}>
            {editable.map((component, index) => (
                <EditableOverlay
                    key={`${component.component_name}_${index}`}
                    component={component}
                    onClick={onEdit}
                >
                    <div className={styles.genericCard}>
                        <GenericCardBody component={component}/>
                    </div>
                </EditableOverlay>
            ))}
        </div>
    );
};

GenericPreview.propTypes = {
    section: componentContentWithEvents.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default GenericPreview;
