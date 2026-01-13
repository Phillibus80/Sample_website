import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import {CiCalendarDate} from 'react-icons/ci';

import * as styles from './calendar.module.scss';

/**
 * A composite component that wraps the DatePicker with specific styling, and configuration.
 *
 * @param {string} name - the formik form field name
 *
 * @return {React.ReactNode}
 */
const Calendar = ({name}) => {
    const {
        values,
        setFieldValue,
        handleChange,
        handleBlur
    } = useFormikContext();

    return (
        <DatePicker
            name={name}
            id={name}
            className={`${styles.picker} flex-grow-1 d-flex flex-column w-100 rounded bg-white`}
            showIcon
            showTimeSelect
            dateFormatCalendar={'MMM yyyy'}
            showMonthDropdown
            showYearDropdown
            selected={values[name] ? new Date(values[name]) : new Date()}
            onChange={e => {
                const localeTime = e.toLocaleString();
                setFieldValue(name, localeTime).then(() => {
                    handleChange(localeTime);
                });
            }}
            onBlur={handleBlur}
            dateFormat='MMMM d, yyyy h:mm aa'
            icon={<CiCalendarDate/>}
            showMonthYearDropdown={false}
        />
    );
};

Calendar.propTypes = {
    name: PropTypes.string.isRequired
};

export default Calendar;