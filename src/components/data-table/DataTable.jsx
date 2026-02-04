import {useMemo, useState} from 'react';

import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

import TableCheckbox from './components/TableCheckbox';
import TableFilter from './components/TableFilter';
import TableHeader from './components/TableHeader';
import TablePagination from './components/TablePagination';

/**
 * DataTable - Enhanced React Bootstrap Table component
 *
 * Extends the base React Bootstrap Table with MUI DataGrid-like features:
 * - Sortable columns with visual indicators
 * - Pagination with configurable page size
 * - Filtering with multiple column support
 * - Row selection checkboxes with callbacks
 *
 * All enhanced features are optional and controlled via props.
 *
 * @param {Object} props - Component props
 * @param {Array<Object>} props.data - Array of row data objects
 * @param {Array<ColumnDef>} props.columns - Array of column definitions
 * @param {boolean} [props.sortable=false] - Enable column sorting
 * @param {boolean} [props.paginated=false] - Enable pagination
 * @param {number} [props.pageSize=10] - Number of records per page
 * @param {boolean} [props.filterable=false] - Enable filtering
 * @param {Array<string>} [props.filterColumns] - Column keys available for filtering
 * @param {boolean} [props.selectable=false] - Enable row checkboxes
 * @param {Function} [props.onRowSelect] - Callback when row is selected/deselected
 * @param {boolean} [props.striped] - Bootstrap striped styling
 * @param {boolean} [props.bordered] - Bootstrap bordered styling
 * @param {boolean} [props.borderless] - Bootstrap borderless styling
 * @param {boolean} [props.hover] - Bootstrap hover styling
 * @param {string} [props.variant] - Bootstrap table variant (e.g., 'dark')
 * @param {boolean|string} [props.responsive] - Enable responsive wrapper (true, or breakpoint: 'sm', 'md', 'lg', 'xl', 'xxl')
 * @returns {JSX.Element} Enhanced table component
 */
const DataTable = ({
                       data,
                       columns,
                       sortable,
                       paginated,
                       pageSize = 10,
                       filterable,
                       filterColumns,
                       selectable,
                       onRowSelect,
                       striped,
                       bordered,
                       borderless,
                       hover,
                       variant,
                       responsive
                   }) => {
    // Sort state
    const [sortConfig, setSortConfig] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Filter state
    const [activeFilters, setActiveFilters] = useState([]);

    // Selected rows state (stores row data objects)
    const [selectedRows, setSelectedRows] = useState([]);

    /**
     * Handles column sort toggle
     * Cycles through: ascending -> descending -> no sort
     *
     * @param {string} columnKey - Key of the column to sort
     */
    const handleSort = (columnKey) => {
        setSortConfig((prevConfig) => {
            if (!prevConfig || prevConfig.key !== columnKey) {
                return {key: columnKey, direction: 'asc'};
            }
            if (prevConfig.direction === 'asc') {
                return {key: columnKey, direction: 'desc'};
            }
            return null;
        });
        // Reset to first page when sorting changes
        setCurrentPage(1);
    };

    /**
     * Handles filter application
     *
     * @param {Array<FilterConfig>} filters - Array of filter configurations
     */
    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
        // Reset to first page when filters change
        setCurrentPage(1);
    };

    /**
     * Handles filter clearing
     */
    const handleClearFilters = () => {
        setActiveFilters([]);
        setCurrentPage(1);
    };

    /**
     * Handles page change
     *
     * @param {number} pageNumber - New page number
     */
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    /**
     * Processes data through filtering and sorting
     * Memoized to prevent unnecessary recalculations
     */
    const processedData = useMemo(() => {
        let result = [...data];

        // Apply filters (left-to-right priority order)
        if (activeFilters.length > 0) {
            activeFilters.forEach((filter) => {
                result = result.filter((row) => {
                    const cellValue = String(row[filter.column] ?? '').toLowerCase();
                    const filterValue = filter.value.toLowerCase();
                    return cellValue.includes(filterValue);
                });
            });
        }

        // Apply sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Handle null/undefined values
                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return 1;
                if (bValue == null) return -1;

                // Compare values
                let comparison = 0;
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    comparison = aValue - bValue;
                } else {
                    comparison = String(aValue).localeCompare(String(bValue));
                }

                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [data, activeFilters, sortConfig]);

    /**
     * Checks if a row is currently selected
     *
     * @param {Object} row - Row data to check
     * @returns {boolean} True if the row is selected
     */
    const isRowSelected = (row) => {
        return selectedRows.some(
            (selectedRow) => JSON.stringify(selectedRow) === JSON.stringify(row)
        );
    };

    /**
     * Checks if all processed rows are currently selected
     *
     * @returns {boolean} True if all rows are selected
     */
    const areAllRowsSelected = () => {
        if (processedData.length === 0) return false;
        return processedData.every((row) => isRowSelected(row));
    };

    /**
     * Handles select all button click
     * Toggles between selecting all rows and deselecting all rows
     */
    const handleSelectAll = () => {
        let newSelectedRows;

        if (areAllRowsSelected()) {
            // All rows are selected, so deselect all
            newSelectedRows = [];
        } else {
            // Not all rows are selected, so select all (keeping existing selections and adding missing ones)
            const currentSelectedSet = new Set(selectedRows.map((r) => JSON.stringify(r)));
            newSelectedRows = [...selectedRows];

            processedData.forEach((row) => {
                const rowKey = JSON.stringify(row);
                if (!currentSelectedSet.has(rowKey)) {
                    newSelectedRows.push(row);
                }
            });
        }

        setSelectedRows(newSelectedRows);

        if (onRowSelect) {
            onRowSelect(newSelectedRows);
        }
    };

    /**
     * Handles individual checkbox change
     *
     * @param {Object} rowData - The row data
     * @param {boolean} isChecked - Whether the checkbox is now checked
     */
    const handleCheckboxChange = (rowData, isChecked) => {
        let newSelectedRows;

        if (isChecked) {
            // Add row to selection
            newSelectedRows = [...selectedRows, rowData];
        } else {
            // Remove row from selection
            newSelectedRows = selectedRows.filter(
                (row) => JSON.stringify(row) !== JSON.stringify(rowData)
            );
        }

        setSelectedRows(newSelectedRows);

        if (onRowSelect) {
            onRowSelect(newSelectedRows);
        }
    };

    /**
     * Gets paginated data for current page
     * Memoized to prevent unnecessary recalculations
     */
    const paginatedData = useMemo(() => {
        if (!paginated) {
            return processedData;
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return processedData.slice(startIndex, endIndex);
    }, [processedData, paginated, currentPage, pageSize]);

    // Determine which columns can be filtered
    const effectiveFilterColumns = filterColumns || columns.map((col) => col.key);

    return (
        <div>
            {/* Filter component */}
            {filterable && (
                <TableFilter
                    columns={columns}
                    filterColumns={effectiveFilterColumns}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={handleClearFilters}
                />
            )}

            {/* Select All button */}
            {selectable && (
                <div style={{display: 'flex', justifyContent: 'flex-start', marginBottom: '0.5rem'}}>
                    <Button
                        variant='outline-primary'
                        size='sm'
                        className='ms-3'
                        onClick={handleSelectAll}
                    >
                        Select All
                    </Button>
                </div>
            )}

            {/* Main table */}
            <Table
                striped={striped}
                bordered={bordered}
                borderless={borderless}
                hover={hover}
                variant={variant}
                responsive={responsive}
            >
                <TableHeader
                    columns={columns}
                    sortable={sortable}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    selectable={selectable}
                />

                <tbody>
                {paginatedData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {selectable && (
                            <td>
                                <TableCheckbox
                                    rowData={row}
                                    onSelect={handleCheckboxChange}
                                    rowIndex={rowIndex}
                                    isChecked={isRowSelected(row)}
                                />
                            </td>
                        )}
                        {columns.map((column) => (
                            <td key={column.key}>
                                {row[column.key]}
                            </td>
                        ))}
                    </tr>
                ))}

                {paginatedData.length === 0 && (
                    <tr>
                        <td
                            colSpan={columns.length + (selectable ? 1 : 0)}
                            style={{textAlign: 'center', fontStyle: 'italic'}}
                        >
                            No data available
                        </td>
                    </tr>
                )}
                </tbody>
            </Table>

            {/* Pagination component */}
            {paginated && (
                <TablePagination
                    totalRecords={processedData.length}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

DataTable.propTypes = {
    /** Array of row data objects */
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    /** Array of column definitions with key, label, and optional sortable override */
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            sortable: PropTypes.bool
        })
    ).isRequired,
    /** Enable column sorting */
    sortable: PropTypes.bool,
    /** Enable pagination */
    paginated: PropTypes.bool,
    /** Number of records per page (default: 10) */
    pageSize: PropTypes.number,
    /** Enable filtering */
    filterable: PropTypes.bool,
    /** Column keys available for filtering. If not provided, all columns are filterable */
    filterColumns: PropTypes.arrayOf(PropTypes.string),
    /** Enable row checkboxes */
    selectable: PropTypes.bool,
    /** Callback when row is selected/deselected. Receives row data or null */
    onRowSelect: PropTypes.func,
    /** Bootstrap striped styling */
    striped: PropTypes.bool,
    /** Bootstrap bordered styling */
    bordered: PropTypes.bool,
    /** Bootstrap borderless styling */
    borderless: PropTypes.bool,
    /** Bootstrap hover styling */
    hover: PropTypes.bool,
    /** Bootstrap table variant (e.g., 'dark') */
    variant: PropTypes.string,
    /** Enable responsive wrapper (true, or breakpoint: 'sm', 'md', 'lg', 'xl', 'xxl') */
    responsive: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'xxl'])
    ])
};

export default DataTable;
