import {useMemo, useRef, useState} from 'react';

import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';

import * as styles from './line-chart.module.scss';
import {LOG_CHART_TIME_UNITS, LOG_LEVELS} from '../../constants/constants.js';

/** SVG coordinate-space dimensions. */
const VIEWBOX_WIDTH = 800;
const VIEWBOX_HEIGHT = 300;

/** Inner chart area padding (in SVG units). */
const CHART_PADDING = {top: 20, right: 20, bottom: 70, left: 50};
const CHART_AREA_WIDTH = VIEWBOX_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
const CHART_AREA_HEIGHT = VIEWBOX_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

/** Number of horizontal grid / Y-axis ticks. */
const Y_TICK_COUNT = 5;

/** Maximum X-axis labels before thinning begins. */
const MAX_X_LABELS = 10;

/** Hover tooltip geometry constants (SVG units). */
const TOOLTIP_WIDTH = 145;
const TOOLTIP_LINE_HEIGHT = 20;
const TOOLTIP_PADDING = 10;

/** Dropdown options for the time-grouping selector. */
const TIME_UNIT_OPTIONS = [
    {value: LOG_CHART_TIME_UNITS.DAY, label: 'By Day'},
    {value: LOG_CHART_TIME_UNITS.WEEK, label: 'Past 7 Days'},
    {value: LOG_CHART_TIME_UNITS.MONTH, label: 'By Month'}
];

/**
 * Returns a YYYY-MM-DD date string for N days before today,
 * using the local calendar (not UTC) to avoid off-by-one timezone errors.
 *
 * @param {number} daysAgo
 * @returns {string}
 */
const getLocalDateNDaysAgo = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Derives a sortable bucket key from a "YYYY-MM-DD HH:mm:ss" date string.
 *
 * @param {string} dateStr
 * @param {'day'|'week'|'month'} timeUnit
 * @returns {string}
 */
const toBucketKey = (dateStr, timeUnit) => {
    const datePart = dateStr.split(' ')[0]; // "YYYY-MM-DD"
    return timeUnit === LOG_CHART_TIME_UNITS.MONTH ? datePart.slice(0, 7) : datePart;
};

/**
 * Formats a bucket key into a human-readable label.
 * For day/week views the year is omitted by default; pass includeYear = true
 * to append it (used on the first axis tick, on year-boundary ticks, and in
 * the hover tooltip).  Month view always embeds the year.
 *
 * @param {string}              key
 * @param {'day'|'week'|'month'} timeUnit
 * @param {boolean}             [includeYear=false]
 * @returns {string}
 */
const formatBucketLabel = (key, timeUnit, includeYear = false) => {
    if (timeUnit === LOG_CHART_TIME_UNITS.MONTH) {
        const [year, month] = key.split('-').map(Number);
        return new Date(year, month - 1, 1).toLocaleString('default', {
            month: 'short',
            year: 'numeric'
        });
    }
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleString('default', {
        month: 'short',
        day: 'numeric',
        ...(includeYear ? {year: 'numeric'} : {})
    });
};

/**
 * Fills in every calendar day between the first and last key in agg so that
 * gaps in log activity are represented as zero-count points rather than being
 * absent from the chart entirely.
 *
 * @param {Object<string, {success: number, warning: number, critical: number}>} agg
 */
const fillDayGaps = (agg) => {
    const keys = Object.keys(agg).sort();
    if (keys.length < 2) return;

    const [sy, sm, sd] = keys[0].split('-').map(Number);
    const [ey, em, ed] = keys[keys.length - 1].split('-').map(Number);
    const cursor = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    while (cursor <= end) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, '0');
        const d = String(cursor.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${d}`;
        if (!agg[key]) {
            agg[key] = {success: 0, warning: 0, critical: 0};
        }
        cursor.setDate(cursor.getDate() + 1);
    }
};

/**
 * Fills in every calendar month between the first and last key in agg.
 *
 * @param {Object<string, {success: number, warning: number, critical: number}>} agg
 */
const fillMonthGaps = (agg) => {
    const keys = Object.keys(agg).sort();
    if (keys.length < 2) return;

    const [sy, sm] = keys[0].split('-').map(Number);
    const [ey, em] = keys[keys.length - 1].split('-').map(Number);

    let y = sy;
    let m = sm;

    while (y < ey || (y === ey && m <= em)) {
        const key = `${y}-${String(m).padStart(2, '0')}`;
        if (!agg[key]) {
            agg[key] = {success: 0, warning: 0, critical: 0};
        }
        m += 1;
        if (m > 12) {
            m = 1;
            y += 1;
        }
    }
};

/**
 * Aggregates raw log entries into time-bucketed counts per severity level.
 * For "day" and "month" views, gaps between active dates are filled with
 * zero-count buckets so the chart accurately shows quiet periods.
 *
 * @param {Array} logs
 * @param {'day'|'week'|'month'} timeUnit
 * @returns {{buckets: string[], series: Object<string, number[]>}}
 */
const aggregateLogs = (logs, timeUnit) => {
    let filtered = logs;

    if (timeUnit === LOG_CHART_TIME_UNITS.WEEK) {
        const cutoff = getLocalDateNDaysAgo(6);
        filtered = logs.filter((log) => {
            const datePart = log.created_on?.split(' ')[0];
            return datePart != null && datePart >= cutoff;
        });
    }

    /** @type {Object<string, {success: number, warning: number, critical: number}>} */
    const agg = {};

    for (const log of filtered) {
        if (!log.created_on) continue;
        const key = toBucketKey(log.created_on, timeUnit);
        if (!agg[key]) {
            agg[key] = {success: 0, warning: 0, critical: 0};
        }
        if (log.level in agg[key]) {
            agg[key][log.level] += 1;
        }
    }

    // Fill calendar gaps between the earliest and latest active bucket.
    if (timeUnit === LOG_CHART_TIME_UNITS.DAY) {
        fillDayGaps(agg);
    } else if (timeUnit === LOG_CHART_TIME_UNITS.MONTH) {
        fillMonthGaps(agg);
    }

    const buckets = Object.keys(agg).sort();
    const series = Object.values(LOG_LEVELS).reduce((acc, level) => {
        acc[level] = buckets.map((key) => agg[key][level]);
        return acc;
    }, {});

    return {buckets, series};
};

/**
 * A responsive SVG line chart that displays success, warning, and critical
 * log counts over time. Supports three time-grouping views via a dropdown:
 * "By Day" (default), "Past 7 Days", and "By Month".
 *
 * The SVG uses a fixed viewBox so it scales naturally with its container.
 * Line colours are fully configurable via the `colors` prop.
 *
 * @param {Array}              logs   - Raw log objects from the admin context.
 * @param {Object<string,string>} colors - Map of severity level → CSS colour.
 * @param {string}             [title] - Optional chart title.
 * @returns {JSX.Element}
 */
const LineChart = ({logs, colors, title}) => {
    const [timeUnit, setTimeUnit] = useState(LOG_CHART_TIME_UNITS.DAY);
    const [hoveredBucket, setHoveredBucket] = useState(null);
    const svgRef = useRef(null);

    const {buckets, series} = useMemo(
        () => aggregateLogs(logs, timeUnit),
        [logs, timeUnit]
    );

    const n = buckets.length;

    const maxCount = useMemo(() => {
        const allValues = Object.values(LOG_LEVELS).flatMap((level) => series[level]);
        return Math.max(...allValues, 1); // at least 1 avoids division by zero
    }, [series]);

    const hasSeriesData = useMemo(
        () =>
            Object.values(LOG_LEVELS).some((level) =>
                series[level].some((count) => count > 0)
            ),
        [series]
    );

    const getX = (index) => {
        if (n <= 1) return CHART_PADDING.left;
        return CHART_PADDING.left + (index / (n - 1)) * CHART_AREA_WIDTH;
    };

    const getY = (count) =>
        CHART_PADDING.top + CHART_AREA_HEIGHT - (count / maxCount) * CHART_AREA_HEIGHT;

    const yTicks = useMemo(
        () =>
            Array.from({length: Y_TICK_COUNT + 1}, (_, i) =>
                Math.round((i / Y_TICK_COUNT) * maxCount)
            ),
        [maxCount]
    );

    const xTickIndices = useMemo(() => {
        const step = n <= MAX_X_LABELS ? 1 : Math.ceil(n / MAX_X_LABELS);
        return Array.from({length: n}, (_, i) => i).filter(
            (i) => i % step === 0 || i === n - 1
        );
    }, [n]);

    const xLabels = useMemo(() => {
        const result = {};
        xTickIndices.forEach((i, pos) => {
            if (timeUnit === LOG_CHART_TIME_UNITS.MONTH) {
                result[i] = formatBucketLabel(buckets[i], timeUnit);
                return;
            }
            const year = buckets[i].slice(0, 4);
            const prevTickIdx = pos > 0 ? xTickIndices[pos - 1] : null;
            const prevYear = prevTickIdx !== null ? buckets[prevTickIdx].slice(0, 4) : null;
            const showYear = pos === 0 || year !== prevYear;
            result[i] = formatBucketLabel(buckets[i], timeUnit, showYear);
        });
        return result;
    }, [buckets, timeUnit, xTickIndices]);

    const handleMouseMove = (e) => {
        if (!svgRef.current || n === 0) return;
        const rect = svgRef.current.getBoundingClientRect();
        const scaleX = VIEWBOX_WIDTH / rect.width;
        const mouseX = (e.clientX - rect.left) * scaleX;

        let closest = 0;
        let minDist = Infinity;
        for (let i = 0; i < n; i++) {
            const dist = Math.abs(getX(i) - mouseX);
            if (dist < minDist) {
                minDist = dist;
                closest = i;
            }
        }
        setHoveredBucket(closest);
    };

    const handleMouseLeave = () => setHoveredBucket(null);

    let tooltip = null;
    if (hoveredBucket !== null && hoveredBucket < n && n > 0) {
        const TH =
            TOOLTIP_PADDING * 2 + (Object.values(LOG_LEVELS).length + 1) * TOOLTIP_LINE_HEIGHT;
        const TY = CHART_PADDING.top + 10;
        const TX_raw = getX(hoveredBucket);
        const TX =
            TX_raw + 12 + TOOLTIP_WIDTH > VIEWBOX_WIDTH - CHART_PADDING.right
                ? TX_raw - TOOLTIP_WIDTH - 12
                : TX_raw + 12;
        tooltip = {TH, TY, TX, TX_raw};
    }

    const timeUnitControl = (
        <div className={styles.controls}>
            <Form.Select
                size='sm'
                value={timeUnit}
                onChange={(e) => {
                    setTimeUnit(e.target.value);
                    setHoveredBucket(null);
                }}
                className={styles.select}
                aria-label='Select time grouping'
            >
                {TIME_UNIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </Form.Select>
        </div>
    );

    if (logs.length === 0) {
        return (
            <div className={styles.wrapper}>
                {title && <h5 className={styles.title}>{title}</h5>}
                {timeUnitControl}
                <p className={styles.empty}>No logs available.</p>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            {title && <h5 className={styles.title}>{title}</h5>}
            {timeUnitControl}

            <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
                className={styles.svg}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                role='img'
                aria-label={title || 'Log activity line chart'}
            >
                {yTicks.map((tick) => (
                    <line
                        key={`grid-${tick}`}
                        x1={CHART_PADDING.left}
                        y1={getY(tick)}
                        x2={VIEWBOX_WIDTH - CHART_PADDING.right}
                        y2={getY(tick)}
                        className={styles.gridLine}
                    />
                ))}

                {yTicks.map((tick) => (
                    <text
                        key={`ylabel-${tick}`}
                        x={CHART_PADDING.left - 6}
                        y={getY(tick)}
                        textAnchor='end'
                        dominantBaseline='middle'
                        className={styles.axisLabel}
                    >
                        {tick}
                    </text>
                ))}

                {xTickIndices.map((i) => {
                    const lx = getX(i);
                    const ly = CHART_PADDING.top + CHART_AREA_HEIGHT + 16;
                    return (
                        <text
                            key={`xlabel-${buckets[i]}`}
                            x={lx}
                            y={ly}
                            textAnchor='end'
                            className={styles.axisLabel}
                            transform={`rotate(-35,${lx},${ly})`}
                        >
                            {xLabels[i]}
                        </text>
                    );
                })}

                <line
                    x1={CHART_PADDING.left}
                    y1={CHART_PADDING.top}
                    x2={CHART_PADDING.left}
                    y2={CHART_PADDING.top + CHART_AREA_HEIGHT}
                    className={styles.axis}
                />
                <line
                    x1={CHART_PADDING.left}
                    y1={CHART_PADDING.top + CHART_AREA_HEIGHT}
                    x2={VIEWBOX_WIDTH - CHART_PADDING.right}
                    y2={CHART_PADDING.top + CHART_AREA_HEIGHT}
                    className={styles.axis}
                />

                {hasSeriesData ? (
                    <>
                        {Object.values(LOG_LEVELS).map((level) => (
                            <polyline
                                key={`line-${level}`}
                                points={series[level]
                                    .map((count, i) => `${getX(i)},${getY(count)}`)
                                    .join(' ')}
                                fill='none'
                                stroke={colors[level] ?? 'var(--chart-fallback)'}
                                strokeWidth='2'
                                strokeLinejoin='round'
                                strokeLinecap='round'
                                className={styles.line}
                            />
                        ))}

                        {Object.values(LOG_LEVELS).map((level) =>
                            series[level].map((count, i) => (
                                <circle
                                    key={`dot-${level}-${i}`}
                                    cx={getX(i)}
                                    cy={getY(count)}
                                    r='3.5'
                                    fill={colors[level] ?? 'var(--chart-fallback)'}
                                    className={styles.dot}
                                />
                            ))
                        )}
                    </>
                ) : (
                    <text
                        x={VIEWBOX_WIDTH / 2}
                        y={CHART_PADDING.top + CHART_AREA_HEIGHT / 2}
                        textAnchor='middle'
                        dominantBaseline='middle'
                        className={styles.emptyChart}
                    >
                        No logs in this period.
                    </text>
                )}

                {tooltip !== null && (
                    <g>
                        <line
                            x1={tooltip.TX_raw}
                            y1={CHART_PADDING.top}
                            x2={tooltip.TX_raw}
                            y2={CHART_PADDING.top + CHART_AREA_HEIGHT}
                            className={styles.crosshair}
                        />

                        <rect
                            x={tooltip.TX}
                            y={tooltip.TY}
                            width={TOOLTIP_WIDTH}
                            height={tooltip.TH}
                            rx={4}
                            className={styles.tooltipBox}
                        />

                        <text
                            x={tooltip.TX + TOOLTIP_PADDING}
                            y={tooltip.TY + TOOLTIP_PADDING + TOOLTIP_LINE_HEIGHT * 0.75}
                            className={styles.tooltipDate}
                        >
                            {formatBucketLabel(
                                buckets[hoveredBucket],
                                timeUnit,
                                timeUnit !== LOG_CHART_TIME_UNITS.MONTH
                            )}
                        </text>

                        {Object.values(LOG_LEVELS).map((level, li) => (
                            <g key={`tip-${level}`}>
                                <rect
                                    x={tooltip.TX + TOOLTIP_PADDING}
                                    y={
                                        tooltip.TY +
                                        TOOLTIP_PADDING +
                                        TOOLTIP_LINE_HEIGHT * (li + 1) +
                                        4
                                    }
                                    width={10}
                                    height={10}
                                    rx={2}
                                    fill={colors[level] ?? '#ccc'}
                                />
                                <text
                                    x={tooltip.TX + TOOLTIP_PADDING + 16}
                                    y={
                                        tooltip.TY +
                                        TOOLTIP_PADDING +
                                        TOOLTIP_LINE_HEIGHT * (li + 2) -
                                        4
                                    }
                                    className={styles.tooltipValue}
                                >
                                    {`${level}: ${series[level][hoveredBucket] ?? 0}`}
                                </text>
                            </g>
                        ))}
                    </g>
                )}
            </svg>

            <div className={styles.legend}>
                {Object.values(LOG_LEVELS).map((level) => (
                    <div key={`legend-${level}`} className={styles.legendItem}>
                        <span
                            className={styles.legendColor}
                            style={{backgroundColor: colors[level] ?? '#ccc'}}
                        />
                        <span className={styles.legendLabel}>{level}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

LineChart.propTypes = {
    /** Raw log objects from the admin context. */
    logs: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            endpoint: PropTypes.string,
            level: PropTypes.string,
            username: PropTypes.string,
            message: PropTypes.string,
            created_on: PropTypes.string
        })
    ).isRequired,
    /** Map of severity level name to a CSS colour string. */
    colors: PropTypes.objectOf(PropTypes.string),
    /** Optional title displayed above the chart. */
    title: PropTypes.string
};

LineChart.defaultProps = {
    colors: {},
    title: ''
};

export default LineChart;
