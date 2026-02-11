import {useState} from 'react';

import PropTypes from 'prop-types';

import * as styles from './pie-chart.module.scss';
import {capitalize} from '../../utils/utils.js';

const CX = 100;
const CY = 100;
const RADIUS = 75;


/**
 * Converts polar coordinates (angle in degrees) to Cartesian x/y.
 *
 * @param {number} angleDeg
 * @return {{x: number, y: number}}
 */
const polarToCartesian = (angleDeg) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
        x: CX + RADIUS * Math.cos(rad),
        y: CY + RADIUS * Math.sin(rad)
    };
};

/**
 * Builds an SVG path string for a pie slice.
 *
 * @param {number} startAngle
 * @param {number} endAngle
 * @return {string}
 */
const buildSlicePath = (startAngle, endAngle) => {
    if (endAngle - startAngle >= 359.999) {
        return [
            `M ${CX + RADIUS} ${CY}`,
            `A ${RADIUS} ${RADIUS} 0 1 1 ${CX - RADIUS} ${CY}`,
            `A ${RADIUS} ${RADIUS} 0 1 1 ${CX + RADIUS} ${CY}`,
            'Z'
        ].join(' ');
    }

    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
        `M ${CX} ${CY}`,
        `L ${start.x} ${start.y}`,
        `A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`,
        'Z'
    ].join(' ');
};

/**
 * A responsive SVG pie chart component.
 *
 * @param {Array<{label: string, value: number}>} series - Aggregated data items to display.
 * @param {string} title - Label displayed above the chart.
 *
 * @return {React.JSX.Element}
 */
const PieChart = ({series, title}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const total = series.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
        return (
            <div className={styles.container}>
                {title && <h5 className={styles.title}>{title}</h5>}
                <p className={styles.empty}>No data available</p>
            </div>
        );
    }

    const slices = series.map((item, index) => {
        const precedingTotal = series
            .slice(0, index)
            .reduce((sum, s) => sum + s.value, 0);
        const startAngle = -90 + (precedingTotal / total) * 360;
        const sweepAngle = (item.value / total) * 360;
        const endAngle = startAngle + sweepAngle;

        return {
            ...item,
            index,
            startAngle,
            endAngle,
            percentage: (item.value / total) * 100
        };
    });

    const hovered = hoveredIndex !== null ? slices[hoveredIndex] : null;

    return (
        <div className={styles.container}>
            {title && <h5 className={styles.title}>{title}</h5>}
            <svg
                viewBox='0 0 200 200'
                className={styles.svg}
                role='img'
                aria-label={title}
            >
                {slices.map((slice) => (
                    <path
                        key={slice.label}
                        d={buildSlicePath(slice.startAngle, slice.endAngle)}
                        className={`${styles.slice} ${styles[`slice${capitalize(slice.label)}`]}`}
                        onMouseEnter={() => setHoveredIndex(slice.index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    />
                ))}
                {hovered && (
                    <>
                        <text
                            x={CX}
                            y={CY - 8}
                            textAnchor='middle'
                            dominantBaseline='middle'
                            className={styles.tooltipLabel}
                        >
                            {hovered.label}
                        </text>
                        <text
                            x={CX}
                            y={CY + 10}
                            textAnchor='middle'
                            dominantBaseline='middle'
                            className={styles.tooltipPercent}
                        >
                            {`${hovered.percentage.toFixed(1)}%`}
                        </text>
                    </>
                )}
            </svg>
            <div className={styles.legend}>
                {slices.map((slice) => (
                    <div key={slice.label} className={styles.legendItem}>
                        <span
                            className={`${styles.legendColor} ${styles[`legend${capitalize(slice.label)}`]}`}
                        />
                        <span className={styles.legendLabel}>{slice.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

PieChart.propTypes = {
    series: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.number.isRequired
        })
    ).isRequired,
    title: PropTypes.string
};

PieChart.defaultProps = {
    title: ''
};

export default PieChart;
