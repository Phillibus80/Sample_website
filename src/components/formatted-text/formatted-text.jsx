import PropTypes from 'prop-types';

import {markupToReact} from '../../utils/markup-utils.js';

/**
 * Renders lightweight markup (**bold**, *italic*, - bullets, etc.) as
 * formatted React elements. Never uses dangerouslySetInnerHTML —
 * output is structurally XSS-safe.
 *
 * Plain text with no markers renders as plain text with line breaks
 * preserved, so existing DB content displays unchanged.
 *
 * @param {string} text - markup string from TEXT_CONTENT.TXT
 * @param {string} [className]
 * @return {React.ReactNode}
 */
const FormattedText = ({text, className = ''}) => {
    if (!text) return null;

    return (
        <div className={className}>
            {markupToReact(text)}
        </div>
    );
};

FormattedText.propTypes = {
    text: PropTypes.string,
    className: PropTypes.string
};

export default FormattedText;
