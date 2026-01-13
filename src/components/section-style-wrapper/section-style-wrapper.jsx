import PropTypes from 'prop-types';

import * as styles from './section-style-wrapper.module.scss';

/**
 * A hoc that wraps the sections in a consistent styling
 *
 * @param {string} backgroundColor
 * @param {React.ReactNode} children
 */
const SectionStyleWrapper = ({backgroundColor = '#FFFFFF', children}) => {
    return (
        <section
            style={{backgroundColor: `${backgroundColor}`}}
            className={`mt-3 border shadow-sm overflow-hidden ${styles.section_wrapper}`}
        >
            {children}
        </section>
    );
};

SectionStyleWrapper.propTypes = {
    backgroundColor: PropTypes.string,
    children: PropTypes.node.isRequired
};

export default SectionStyleWrapper;