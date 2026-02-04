import PropTypes from 'prop-types';

/**
 * TableHeader - Sortable column header component for DataTable
 *
 * Renders table header row with optional sorting indicators.
 * When sortable is enabled, clicking a column header triggers sorting.
 *
 * @param {Object} props - Component props
 * @param {Array<ColumnDef>} props.columns - Array of column definitions
 * @param {boolean} props.sortable - Whether sorting is enabled globally
 * @param {SortConfig|null} props.sortConfig - Current sort configuration
 * @param {Function} props.onSort - Callback function when a column header is clicked
 * @param {boolean} props.selectable - Whether to show checkbox column header
 * @returns {JSX.Element} Table thead element
 */
const TableHeader = ({columns, sortable, sortConfig, onSort, selectable}) => {
    /**
     * Handles column header click for sorting
     *
     * @param {string} columnKey - The key of the column being sorted
     */
    const handleSort = (columnKey) => {
        if (!sortable || !onSort) return;
        onSort(columnKey);
    };

    /**
     * Renders the sort indicator for a column
     *
     * @param {string} columnKey - The key of the column
     * @returns {JSX.Element|null} Sort indicator span or null
     */
    const renderSortIndicator = (columnKey) => {
        if (!sortable) return null;

        const isActive = sortConfig && sortConfig.key === columnKey;
        const direction = isActive ? sortConfig.direction : null;

        return (
            <span
                style={{
                    marginLeft: '8px',
                    opacity: isActive ? 1 : 0.3,
                    fontSize: '0.8em'
                }}
            >
                {direction === 'asc' && '▲'}
                {direction === 'desc' && '▼'}
                {!direction && '▲▼'}
            </span>
        );
    };

    return (
        <thead>
        <tr>
            {selectable && (
                <th style={{width: '50px'}}>
                    {/* Empty header for checkbox column */}
                </th>
            )}
            {columns.map((column) => {
                const isColumnSortable = sortable && column.sortable !== false;

                return (
                    <th
                        key={column.key}
                        onClick={() => isColumnSortable && handleSort(column.key)}
                        style={{
                            cursor: isColumnSortable ? 'pointer' : 'default',
                            userSelect: 'none'
                        }}
                        aria-sort={
                            sortConfig?.key === column.key
                                ? sortConfig.direction === 'asc'
                                    ? 'ascending'
                                    : 'descending'
                                : 'none'
                        }
                    >
                        {column.label}
                        {isColumnSortable && renderSortIndicator(column.key)}
                    </th>
                );
            })}
        </tr>
        </thead>
    );
};

TableHeader.propTypes = {
    /** Array of column definitions with key, label, and optional sortable override */
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            sortable: PropTypes.bool
        })
    ).isRequired,
    /** Whether sorting is enabled globally */
    sortable: PropTypes.bool,
    /** Current sort configuration with key and direction */
    sortConfig: PropTypes.shape({
        key: PropTypes.string.isRequired,
        direction: PropTypes.oneOf(['asc', 'desc']).isRequired
    }),
    /** Callback function when a column header is clicked for sorting */
    onSort: PropTypes.func,
    /** Whether to show checkbox column header */
    selectable: PropTypes.bool
};

TableHeader.defaultProps = {
    sortable: false,
    sortConfig: null,
    onSort: null,
    selectable: false
};

export default TableHeader;
