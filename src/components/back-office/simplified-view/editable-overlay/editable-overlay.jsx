import PropTypes from 'prop-types';

import * as styles from './editable-overlay.module.scss';
import {hasEditableContent} from '../section-preview/utils.js';

/**
 * Wraps a visual region of a section preview and marks it as clickable.
 * Clicking anywhere inside fires onClick with the full Component object so
 * the caller can open the editor modal for it.
 *
 * Renders nothing when `component` is absent — lets previews map optional
 * components without guards. When the component is present but empty (all
 * content arrays drained) a greyed placeholder is shown instead of children
 * so the click target never collapses.
 *
 * @param {Component} component — the raw component object (handed to onClick)
 * @param {string} [label] — badge text; defaults to component.component_name
 * @param {boolean} [contrast] — flip border + badge to dark; use when the
 *     surrounding section background clashes with the default yellow
 * @param {function} onClick — receives (component) when the region is clicked
 * @param {React.ReactNode} children — the visual preview of this component
 * @return {React.ReactNode|null}
 */
const EditableOverlay = ({component, label, contrast = false, onClick, children}) => {
    if (!component) return null;

    const isEmpty = !hasEditableContent(component);
    const badgeText = label ?? component.component_name;

    const overlayClasses = [
        styles.overlay,
        isEmpty && styles.overlayEmpty,
        contrast && styles.overlayContrast
    ].filter(Boolean).join(' ');

    return (
        <div
            className={overlayClasses}
            onClickCapture={(e) => {
                // Wrapped public-site components contain live <a href> and
                // <button> elements. Intercept in capture phase so clicking
                // a nav link inside a preview opens the editor instead of
                // navigating away.
                e.preventDefault();
                e.stopPropagation();
                onClick(component);
            }}
        >
            <span className={styles.badge}>{badgeText}</span>

            {isEmpty
                ? (
                    <div className={styles.placeholder}>
                        <span>No content</span>
                        <span className={styles.placeholderHint}>Click to edit</span>
                    </div>
                )
                : children}
        </div>
    );
};

EditableOverlay.propTypes = {
    component: PropTypes.shape({
        component_name: PropTypes.string.isRequired
    }),
    label: PropTypes.string,
    contrast: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node
};

export default EditableOverlay;
