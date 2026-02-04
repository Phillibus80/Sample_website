import PropTypes from 'prop-types';

import * as styles from './cursive-title.module.scss';
import {toTitleCase} from '../../../utils/utils.js';

/**
 * A component that displays the title text in cursive
 *
 * @param {string} strContent
 * @param {string} titleFontSize
 * @return {React.ReactNode}
 */
const cursiveTitle = ({strContent, titleFontSize}) => {
    const dynamicFontSize = titleFontSize
        ? {
            fontSize: `${titleFontSize}`
        }
        : {};

    return (
        <div style={{...dynamicFontSize}} className={`${styles.textStyle} mt-sm-1`}>
            {toTitleCase(strContent)}
        </div>
    );
};

cursiveTitle.propTypes = {
    strContent: PropTypes.string.isRequired,
    titleFontSize: PropTypes.string
};

export default cursiveTitle;