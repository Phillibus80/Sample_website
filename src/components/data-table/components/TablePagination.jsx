import PropTypes from 'prop-types';
import Pagination from 'react-bootstrap/Pagination';

/**
 * TablePagination - Pagination controls component for DataTable
 *
 * Renders pagination controls below the table with page numbers,
 * previous/next buttons, and a summary of displayed records.
 *
 * @param {Object} props - Component props
 * @param {number} props.totalRecords - Total number of records in the data set
 * @param {number} props.pageSize - Number of records displayed per page
 * @param {number} props.currentPage - Currently active page (1-indexed)
 * @param {Function} props.onPageChange - Callback function when page changes
 * @returns {JSX.Element} Pagination component with controls
 */
const TablePagination = ({totalRecords, pageSize, currentPage, onPageChange}) => {
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Calculate display range
    const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalRecords);

    /**
     * Handles page change events
     *
     * @param {number} pageNumber - The page number to navigate to
     */
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
            onPageChange(pageNumber);
        }
    };

    /**
     * Generates array of page numbers to display with ellipsis handling
     *
     * @returns {Array<number|string>} Array of page numbers and ellipsis markers
     */
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('ellipsis-start');
            }

            // Calculate range around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis-end');
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const recordsText = (
        <span className='text-muted me-3'>
            Showing {startRecord}-{endRecord} of {totalRecords} records
        </span>
    );

    // When only 1 page or no pages, show only the record count on the right
    if (totalPages <= 1) {
        return (
            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
                {recordsText}
            </div>
        );
    }

    const pageNumbers = getPageNumbers();

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '1rem'}}>
            <Pagination className='mb-1'>
                <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label='Previous page'
                />

                {pageNumbers.map((page, index) => {
                    if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                        return <Pagination.Ellipsis key={page} disabled/>;
                    }

                    return (
                        <Pagination.Item
                            key={index}
                            active={page === currentPage}
                            onClick={() => handlePageChange(page)}
                            aria-label={`Page ${page}`}
                            aria-current={page === currentPage ? 'page' : undefined}
                        >
                            {page}
                        </Pagination.Item>
                    );
                })}

                <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label='Next page'
                />
            </Pagination>

            {recordsText}
        </div>
    );
};

TablePagination.propTypes = {
    /** Total number of records in the data set */
    totalRecords: PropTypes.number.isRequired,
    /** Number of records displayed per page */
    pageSize: PropTypes.number.isRequired,
    /** Currently active page (1-indexed) */
    currentPage: PropTypes.number.isRequired,
    /** Callback function when page changes */
    onPageChange: PropTypes.func.isRequired
};

export default TablePagination;
