import PropTypes from 'prop-types';

import * as styles from './hex-pattern.module.scss';

/**
 * A compound used to generate a visual honeycomb pattern
 * @param {number} rows
 * @return {React.ReactNode|null}
 */
const HexPattern = ({rows}) => {
    const generateElements = () => {
        let currentRow = 0;

        /**
         * @type {Array<React.ReactNode>}
         */
        const elementContainer = [];

        while ((currentRow <= (rows - 1)) && currentRow >= 0) {
            const currentElement =
                <div key={currentRow}>
                    <div className={`${styles.hexRow} ${styles.even}`}>
                        <div className={`${styles.hex}`}>
                            <div className={`${styles.top}`}></div>
                            <div className={`${styles.middle}`}></div>
                            <div className={`${styles.bottom}`}></div>
                        </div>

                        <div className={`${styles.hex}`}>
                            <div className={`${styles.top}`}></div>
                            <div className={`${styles.middle}`}></div>
                            <div className={`${styles.bottom}`}></div>
                        </div>

                        <div className={`${styles.hex} ${styles.hide} ${styles.sm_hide}`}>
                            <div className={`${styles.top}`}></div>
                            <div className={`${styles.middle}`}></div>
                            <div className={`${styles.bottom}`}></div>
                        </div>
                    </div>

                    <div className={`${styles.hexRow}`}>
                        <div className={`${styles.hex}`}>
                            <div className={`${styles.top}`}></div>
                            <div className={`${styles.middle}`}></div>
                            <div className={`${styles.bottom}`}></div>
                        </div>

                        <div className={`${styles.hex} ${styles.hide}`}>
                            <div className={`${styles.top}`}></div>
                            <div className={`${styles.middle}`}></div>
                            <div className={`${styles.bottom}`}></div>
                        </div>

                        <div className={`${styles.hex} ${styles.sm_hide}`}>
                            <div className={`${styles.top}`}></div>
                            <div className={`${styles.middle}`}></div>
                            <div className={`${styles.bottom}`}></div>
                        </div>

                        <div className={`${styles.hex}`}>
                            <div className={`${styles.top}`}></div>
                            <div className={`${styles.middle}`}></div>
                            <div className={`${styles.bottom}`}></div>
                        </div>
                    </div>
                </div>;

            elementContainer.push(currentElement);
            currentRow++;
        }

        return elementContainer;
    };

    return (
        <section role='presentation'>
            {
                generateElements().map(element => element)
            }
        </section>
    );
};

HexPattern.propTypes = {
    rows: PropTypes.number.isRequired
};

export default HexPattern;