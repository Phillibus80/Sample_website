import {lazy, Suspense} from 'react';

import PropTypes from 'prop-types';

import GenericPreview from './generic-preview.jsx';
import BenefitsPreview from './previews/benefits-preview.jsx';
import FooterPreview from './previews/footer-preview.jsx';
import HeaderPreview from './previews/header-preview.jsx';
import HeroPreview from './previews/hero-preview.jsx';
import HoneycombGalleryPreview from './previews/honeycomb-gallery-preview.jsx';
import InfoPicturePreview from './previews/info-picture-preview.jsx';
import InfoPreview from './previews/info-preview.jsx';
import SpacedHexGalleryPreview from './previews/spaced-hex-gallery-preview.jsx';
import * as styles from './section-preview.module.scss';
import {componentContentWithEvents} from '../../../../common/commonPropTypes.jsx';
import {SECTIONS} from '../../../../constants/app-constants.js';

// Leaflet (~150KB gz + CSS + marker images) stays out of the admin bundle
// unless a page actually has an Events section.
const EventsPreview = lazy(() => import('./previews/events-preview.jsx'));

/**
 * Dispatches to the correct per-section preview component based on
 * section_name. Forces show_section true on the section object passed down so
 * previews that reuse public-site renderers (which null-out when hidden)
 * always paint — the real hidden state is communicated one level up in
 * SimplifiedSection via a dimmed overlay.
 *
 * The default branch (GenericPreview) catches any future SECTIONS entry that
 * gets added without a matching preview being wired here.
 *
 * @param {Section} section
 * @param {function} onEdit — receives a Component object when a region is clicked
 * @return {React.ReactNode}
 */
const SectionPreview = ({section, onEdit}) => {
    const previewSection = {...section, show_section: true};

    const renderPreview = () => {
        switch (section.section_name) {
            case SECTIONS.HEADER:
                return <HeaderPreview section={previewSection} onEdit={onEdit}/>;
            case SECTIONS.HERO:
                return <HeroPreview section={previewSection} onEdit={onEdit}/>;
            case SECTIONS.INFO:
                return <InfoPreview section={previewSection} onEdit={onEdit}/>;
            case SECTIONS.FOOTER:
                return <FooterPreview section={previewSection} onEdit={onEdit}/>;
            case SECTIONS.BENEFITS:
                return <BenefitsPreview section={previewSection} onEdit={onEdit}/>;
            case SECTIONS.INFO_PICTURE:
            case SECTIONS.INFO_GALLERY:
                return <InfoPicturePreview section={previewSection} onEdit={onEdit}/>;
            case SECTIONS.HEX_PICTURE_GALLERY:
                return <HoneycombGalleryPreview section={previewSection} onEdit={onEdit}/>;
            case SECTIONS.SPACED_HEX_GALLERY:
                return <SpacedHexGalleryPreview section={previewSection} onEdit={onEdit}/>;
            case SECTIONS.EVENTS:
                return (
                    <Suspense fallback={null}>
                        <EventsPreview section={previewSection} onEdit={onEdit}/>
                    </Suspense>
                );
            default:
                return <GenericPreview section={previewSection} onEdit={onEdit}/>;
        }
    };

    return (
        <div className={styles.previewContainer}>
            {renderPreview()}
        </div>
    );
};

SectionPreview.propTypes = {
    section: componentContentWithEvents.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default SectionPreview;
