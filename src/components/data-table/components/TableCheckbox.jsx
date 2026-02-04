import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';

/**
 * TableCheckbox - Individual row checkbox component for DataTable
 *
 * Renders a controlled checkbox that reflects the selected state passed from
 * the parent component and calls onSelect when toggled.
 *
 * @param {Object} props - Component props
 * @param {Object} props.rowData - The entire row's data object
 * @param {Function} props.onSelect - Callback function when checkbox is toggled
 * @param {number} props.rowIndex - Row identifier for accessibility
 * @param {boolean} props.isChecked - Controlled checked state from parent
 * @returns {JSX.Element} Form.Check checkbox element
 */
const TableCheckbox = ({rowData, onSelect, rowIndex, isChecked}) => {
    /**
     * Handles checkbox change event
     * Calls onSelect with row data and new checked state
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event - Change event
     */
    const handleChange = (event) => {
        const checked = event.target.checked;

        if (onSelect) {
            onSelect(rowData, checked);
        }
    };

    return (
        <Form.Check
            type='checkbox'
            checked={isChecked}
            onChange={handleChange}
            aria-label={`Select row ${rowIndex + 1}`}
            id={`table-checkbox-row-${rowIndex}`}
        />
    );
};

TableCheckbox.propTypes = {
    /** The entire row's data object */
    rowData: PropTypes.object.isRequired,
    /** Callback function when checkbox is toggled */
    onSelect: PropTypes.func.isRequired,
    /** Row identifier for accessibility */
    rowIndex: PropTypes.number.isRequired,
    /** Controlled checked state from parent */
    isChecked: PropTypes.bool.isRequired
};

export default TableCheckbox;
