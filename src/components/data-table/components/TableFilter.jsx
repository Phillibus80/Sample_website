import {useState} from 'react';

import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

/**
 * TableFilter - Dynamic filter UI component for DataTable
 *
 * Provides a collapsible filter panel with column selection dropdowns and
 * text inputs for filtering table data. Supports multiple filters with
 * priority ordering (left to right).
 *
 * @param {Object} props - Component props
 * @param {Array<ColumnDef>} props.columns - Array of column definitions
 * @param {Array<string>} props.filterColumns - Column keys available for filtering
 * @param {Function} props.onApplyFilters - Callback when filters are applied
 * @param {Function} props.onClearFilters - Callback when filters are cleared
 * @returns {JSX.Element} Filter panel with controls
 */
const TableFilter = ({columns, filterColumns, onApplyFilters, onClearFilters}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [filterRows, setFilterRows] = useState([{column: '', value: ''}]);

    /**
     * Gets the label for a column key
     *
     * @param {string} key - Column key
     * @returns {string} Column label or key if not found
     */
    const getColumnLabel = (key) => {
        const column = columns.find((col) => col.key === key);
        return column ? column.label : key;
    };

    /**
     * Gets available column options for a filter row
     * Disables columns that are already selected in other rows
     *
     * @param {number} currentIndex - Index of the current filter row
     * @returns {Array<{key: string, label: string, disabled: boolean}>} Available options
     */
    const getAvailableColumns = (currentIndex) => {
        const selectedColumns = filterRows
            .map((row, index) => (index !== currentIndex ? row.column : null))
            .filter(Boolean);

        return filterColumns.map((key) => ({
            key,
            label: getColumnLabel(key),
            disabled: selectedColumns.includes(key)
        }));
    };

    /**
     * Handles column selection change for a filter row
     *
     * @param {number} index - Index of the filter row
     * @param {string} column - Selected column key
     */
    const handleColumnChange = (index, column) => {
        const newFilterRows = [...filterRows];
        newFilterRows[index] = {...newFilterRows[index], column};
        setFilterRows(newFilterRows);
    };

    /**
     * Handles value input change for a filter row
     * Auto-applies filters when any filter has 3+ characters
     *
     * @param {number} index - Index of the filter row
     * @param {string} value - Input value
     */
    const handleValueChange = (index, value) => {
        const newFilterRows = [...filterRows];
        newFilterRows[index] = {...newFilterRows[index], value};
        setFilterRows(newFilterRows);

        // Auto-apply filters when 3+ characters are typed
        const autoFilters = newFilterRows
            .filter((row) => row.column && row.value.length >= 3)
            .map((row) => ({column: row.column, value: row.value}));

        onApplyFilters(autoFilters);
    };

    /**
     * Adds a new filter row
     */
    const handleAddFilter = () => {
        if (filterRows.length < filterColumns.length) {
            setFilterRows([...filterRows, {column: '', value: ''}]);
        }
    };

    /**
     * Removes a filter row at the specified index
     *
     * @param {number} index - Index of the filter row to remove
     */
    const handleRemoveFilter = (index) => {
        if (filterRows.length > 1) {
            const newFilterRows = filterRows.filter((_, i) => i !== index);
            setFilterRows(newFilterRows);
        }
    };

    /**
     * Applies the current filters on manual submit
     * Includes all filters with column selected and any value (no minimum)
     */
    const handleSubmit = () => {
        const validFilters = filterRows
            .filter((row) => row.column && row.value.length > 0)
            .map((row) => ({column: row.column, value: row.value}));

        onApplyFilters(validFilters);
        setIsVisible(false);
    };

    /**
     * Clears all filters and resets state
     */
    const handleClear = () => {
        setFilterRows([{column: '', value: ''}]);
        onClearFilters();
    };

    /**
     * Handles key press events for filter value inputs
     * Submits filters when Enter is pressed
     *
     * @param {React.KeyboardEvent} event - Keyboard event
     */
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div style={{marginBottom: '1rem'}}>
            <Button
                variant='outline-secondary'
                size='sm'
                onClick={() => setIsVisible(!isVisible)}
                aria-expanded={isVisible}
                aria-controls='filter-panel'
            >
                Filter
            </Button>

            {isVisible && (
                <div
                    id='filter-panel'
                    style={{
                        marginTop: '0.5rem',
                        padding: '1rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '0.375rem',
                        backgroundColor: '#f8f9fa'
                    }}
                >
                    {filterRows.map((row, index) => (
                        <InputGroup key={index} className='mb-2'>
                            <Form.Select
                                value={row.column}
                                onChange={(e) => handleColumnChange(index, e.target.value)}
                                style={{maxWidth: '200px'}}
                                aria-label={`Select column for filter ${index + 1}`}
                            >
                                <option value=''>Select column...</option>
                                {getAvailableColumns(index).map((option) => (
                                    <option
                                        key={option.key}
                                        value={option.key}
                                        disabled={option.disabled}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Select>

                            <Form.Control
                                type='text'
                                placeholder='Filter value...'
                                value={row.value}
                                onChange={(e) => handleValueChange(index, e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={!row.column}
                                aria-label={`Filter value for ${row.column || 'column'}`}
                            />

                            {filterRows.length > 1 && (
                                <Button
                                    variant='outline-danger'
                                    onClick={() => handleRemoveFilter(index)}
                                    aria-label={`Remove filter ${index + 1}`}
                                >
                                    &times;
                                </Button>
                            )}
                        </InputGroup>
                    ))}

                    <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
                        {filterRows.length < filterColumns.length && (
                            <Button
                                variant='outline-primary'
                                size='sm'
                                onClick={handleAddFilter}
                                aria-label='Add another filter'
                            >
                                + Add
                            </Button>
                        )}

                        <Button
                            variant='primary'
                            size='sm'
                            onClick={handleSubmit}
                        >
                            Submit
                        </Button>

                        <Button
                            variant='outline-secondary'
                            size='sm'
                            onClick={handleClear}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

TableFilter.propTypes = {
    /** Array of column definitions with key and label */
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    ).isRequired,
    /** Column keys available for filtering */
    filterColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    /** Callback when filters are applied, receives array of FilterConfig objects */
    onApplyFilters: PropTypes.func.isRequired,
    /** Callback when filters are cleared */
    onClearFilters: PropTypes.func.isRequired
};

export default TableFilter;
