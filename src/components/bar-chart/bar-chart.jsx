import {useEffect, useMemo, useRef, useState} from 'react';

import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';

import * as styles from './bar-chart.module.scss';
import {LOG_CHART_TIME_UNITS, LOG_LEVELS} from '../../constants/constants.js';
import {
    capitalize,
    extractBaseRoute,
    filterLogsByWindow,
    formatBaseRoute,
    LOG_CHART_TIME_UNIT_OPTIONS,
} from '../../utils/utils.js';

/** SVG geometry constants. */
const GROUP_WIDTH = 80;        // SVG units per route group
const BAR_WIDTH = 18;          // SVG units per bar
const BAR_GAP = 4;             // gap between bars within a group
const CHART_PADDING = {top: 20, right: 20, bottom: 80, left: 50};
const CHART_HEIGHT = 320;
const CHART_AREA_HEIGHT = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
const Y_TICK_COUNT = 5;
const MIN_SVG_WIDTH = 400;

/** Tooltip geometry constants (SVG units). */
const TOOLTIP_WIDTH = 150;
const TOOLTIP_LINE_HEIGHT = 20;
const TOOLTIP_PADDING = 10;

/** Ordered log level array. */
const LEVELS = Object.values(LOG_LEVELS); // ['success', 'warning', 'critical']

/**
 * X-offsets (from group start) for each bar, centering the three bars in GROUP_WIDTH.
 * Total bars span = 3 * BAR_WIDTH + 2 * BAR_GAP.
 */
const TOTAL_BARS_SPAN = 3 * BAR_WIDTH + 2 * BAR_GAP;
const BAR_OFFSETS = [
    GROUP_WIDTH / 2 - TOTAL_BARS_SPAN / 2,
    GROUP_WIDTH / 2 - TOTAL_BARS_SPAN / 2 + BAR_WIDTH + BAR_GAP,
    GROUP_WIDTH / 2 - TOTAL_BARS_SPAN / 2 + 2 * (BAR_WIDTH + BAR_GAP),
];


/**
 * A grouped SVG bar chart that displays success/warning/critical log counts
 * per base route over a selected time window.
 *
 * @param {Array}  logs  - Raw log objects from the admin context.
 * @param {string} [title] - Optional chart title.
 * @returns {JSX.Element}
 */
const BarChart = ({logs, title}) => {
    const [timeUnit, setTimeUnit] = useState(LOG_CHART_TIME_UNITS.PAST_7);
    const [hoveredRoute, setHoveredRoute] = useState(null);
    const [showFade, setShowFade] = useState(false);
    const scrollRef = useRef(null);
    const containerWidthRef = useRef(MIN_SVG_WIDTH);

    // Aggregate logs → route data
    const routeData = useMemo(() => {
        const filtered = filterLogsByWindow(logs, timeUnit);
        const agg = {};
        for (const log of filtered) {
            if (!log.endpoint || !log.level) continue;
            const route = extractBaseRoute(log.endpoint);
            if (!agg[route]) {
                agg[route] = {success: 0, warning: 0, critical: 0};
            }
            if (log.level in agg[route]) {
                agg[route][log.level] += 1;
            }
        }
        return Object.entries(agg)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([route, counts]) => ({route, ...counts}));
    }, [logs, timeUnit]);

    const numRoutes = routeData.length;

    const dynamicWidth = Math.max(
        MIN_SVG_WIDTH,
        numRoutes * GROUP_WIDTH + CHART_PADDING.left + CHART_PADDING.right
    );

    const maxCount = useMemo(() => {
        const all = routeData.flatMap(({success, warning, critical}) => [
            success,
            warning,
            critical,
        ]);
        return Math.max(...all, 1);
    }, [routeData]);

    const yTicks = useMemo(
        () =>
            Array.from({length: Y_TICK_COUNT + 1}, (_, i) =>
                Math.round((i / Y_TICK_COUNT) * maxCount)
            ),
        [maxCount]
    );

    const getY = (count) =>
        CHART_PADDING.top + CHART_AREA_HEIGHT - (count / maxCount) * CHART_AREA_HEIGHT;

    // Scroll container: track width + scroll fade visibility
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const observer = new ResizeObserver(([entry]) => {
            containerWidthRef.current = entry.contentRect.width;
            setShowFade(el.scrollWidth > el.clientWidth);
        });
        observer.observe(el);

        const handleScroll = () => {
            setShowFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
        };
        el.addEventListener('scroll', handleScroll, {passive: true});

        return () => {
            observer.disconnect();
            el.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Re-evaluate fade when route data changes
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        setShowFade(el.scrollWidth > el.clientWidth);
    }, [dynamicWidth]);

    const timeUnitControl = (
        <div className={styles.controls}>
            <Form.Select
                size='sm'
                value={timeUnit}
                onChange={(e) => {
                    setTimeUnit(e.target.value);
                    setHoveredRoute(null);
                }}
                className={styles.select}
                aria-label='Select time window'
            >
                {LOG_CHART_TIME_UNIT_OPTIONS.map((opt) => (
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

    // Compute tooltip geometry when a route is hovered
    let tooltip = null;
    if (hoveredRoute !== null && hoveredRoute < numRoutes) {
        const data = routeData[hoveredRoute];
        const groupCenterX =
            CHART_PADDING.left + hoveredRoute * GROUP_WIDTH + GROUP_WIDTH / 2;
        const TH =
            TOOLTIP_PADDING * 2 + (LEVELS.length + 1) * TOOLTIP_LINE_HEIGHT;
        const TY = CHART_PADDING.top + 5;
        const TX =
            groupCenterX + 12 + TOOLTIP_WIDTH > dynamicWidth - CHART_PADDING.right
                ? groupCenterX - TOOLTIP_WIDTH - 12
                : groupCenterX + 12;
        tooltip = {data, groupCenterX, TX, TY, TH};
    }

    return (
        <div className={styles.wrapper}>
            {title && <h5 className={styles.title}>{title}</h5>}
            {timeUnitControl}

            <div ref={scrollRef} className={styles.scrollContainer}>
                <svg
                    viewBox={`0 0 ${dynamicWidth} ${CHART_HEIGHT}`}
                    width={dynamicWidth}
                    height={CHART_HEIGHT}
                    className={styles.svg}
                    role='img'
                    aria-label={title || 'Log counts bar chart'}
                >
                    {/* Horizontal grid lines + Y labels */}
                    {yTicks.map((tick) => (
                        <line
                            key={`grid-${tick}`}
                            x1={CHART_PADDING.left}
                            y1={getY(tick)}
                            x2={dynamicWidth - CHART_PADDING.right}
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

                    {/* Axes */}
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
                        x2={dynamicWidth - CHART_PADDING.right}
                        y2={CHART_PADDING.top + CHART_AREA_HEIGHT}
                        className={styles.axis}
                    />

                    {numRoutes === 0 ? (
                        <text
                            x={dynamicWidth / 2}
                            y={CHART_PADDING.top + CHART_AREA_HEIGHT / 2}
                            textAnchor='middle'
                            dominantBaseline='middle'
                            className={styles.emptyChart}
                        >
                            No logs in this period.
                        </text>
                    ) : (
                        <>
                            {/* Bar groups + X labels */}
                            {routeData.map(({route, success, warning, critical}, i) => {
                                const groupX = CHART_PADDING.left + i * GROUP_WIDTH;
                                const groupCenterX = groupX + GROUP_WIDTH / 2;
                                const counts = [success, warning, critical];
                                const lx = groupCenterX;
                                const ly = CHART_PADDING.top + CHART_AREA_HEIGHT + 16;

                                return (
                                    <g
                                        key={route}
                                        onMouseEnter={() => setHoveredRoute(i)}
                                        onMouseLeave={() => setHoveredRoute(null)}
                                        style={{cursor: 'default'}}
                                    >
                                        {LEVELS.map((level, li) => {
                                            const count = counts[li];
                                            const barX = groupX + BAR_OFFSETS[li];
                                            const barHeight =
                                                (count / maxCount) * CHART_AREA_HEIGHT;
                                            const barY = getY(count);
                                            return (
                                                <rect
                                                    key={level}
                                                    x={barX}
                                                    y={barY}
                                                    width={BAR_WIDTH}
                                                    height={barHeight}
                                                    className={`${styles.bar} ${styles[`bar${capitalize(level)}`]}`}
                                                />
                                            );
                                        })}

                                        <text
                                            x={lx}
                                            y={ly}
                                            textAnchor='end'
                                            className={styles.axisLabel}
                                            transform={`rotate(-35,${lx},${ly})`}
                                        >
                                            {formatBaseRoute(route)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Hover crosshair */}
                            {hoveredRoute !== null && (
                                <line
                                    x1={
                                        CHART_PADDING.left +
                                        hoveredRoute * GROUP_WIDTH +
                                        GROUP_WIDTH / 2
                                    }
                                    y1={CHART_PADDING.top}
                                    x2={
                                        CHART_PADDING.left +
                                        hoveredRoute * GROUP_WIDTH +
                                        GROUP_WIDTH / 2
                                    }
                                    y2={CHART_PADDING.top + CHART_AREA_HEIGHT}
                                    className={styles.crosshair}
                                />
                            )}

                            {/* Tooltip */}
                            {tooltip !== null && (
                                <g style={{pointerEvents: 'none'}}>
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
                                        y={
                                            tooltip.TY +
                                            TOOLTIP_PADDING +
                                            TOOLTIP_LINE_HEIGHT * 0.75
                                        }
                                        className={styles.tooltipDate}
                                    >
                                        {formatBaseRoute(tooltip.data.route)}
                                    </text>
                                    {LEVELS.map((level, li) => (
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
                                                className={styles[`tip${capitalize(level)}`]}
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
                                                {`${level}: ${tooltip.data[level]}`}
                                            </text>
                                        </g>
                                    ))}
                                </g>
                            )}
                        </>
                    )}
                </svg>

                {/* Right-edge fade mask — hidden when scrolled to end */}
                {showFade && <div className={styles.fadeMask} />}
            </div>

            <div className={styles.legend}>
                {LEVELS.map((level) => (
                    <div key={level} className={styles.legendItem}>
                        <span
                            className={`${styles.legendColor} ${styles[`legend${capitalize(level)}`]}`}
                        />
                        <span className={styles.legendLabel}>{level}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

BarChart.propTypes = {
    /** Raw log objects from the admin context. */
    logs: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            endpoint: PropTypes.string,
            level: PropTypes.string,
            username: PropTypes.string,
            message: PropTypes.string,
            created_on: PropTypes.string,
        })
    ).isRequired,
    /** Optional title displayed above the chart. */
    title: PropTypes.string,
};

BarChart.defaultProps = {
    title: '',
};

export default BarChart;
