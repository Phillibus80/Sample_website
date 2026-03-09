import {Image} from 'react-bootstrap';

import * as styles from './section-preview.module.scss';
import {componentCommonPropType} from '../../../../common/commonPropTypes.jsx';

/**
 * Compact visual summary for a component inside the generic card grid.
 * Prefers a thumbnail, falls back to a text snippet, then a count.
 *
 * @param {Component} component
 * @return {React.ReactNode|null}
 */
const GenericCardBody = ({component}) => {
    if (component.images?.length) {
        const {src, alt} = component.images[0];
        return <Image src={src} alt={alt} className={`w-100 ${styles.genericCardThumb}`} fluid/>;
    }
    if (component.textContent?.length) {
        return <p className={`mb-0 ${styles.genericCardText}`}>{component.textContent[0].text}</p>;
    }
    if (component.links?.length) {
        return <span className={styles.genericCardCount}>{component.links.length} link(s)</span>;
    }
    if (component.events?.length) {
        return <span className={styles.genericCardCount}>{component.events.length} event(s)</span>;
    }
    return null;
};

GenericCardBody.propTypes = {
    component: componentCommonPropType
};

export default GenericCardBody;
