import {Field, useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';

import UserRoleCheckboxes from './user-roles-checkboxes.jsx';
import * as styles from '../../office-tab-components/office-users/office-users.module.scss';

/**
 * A utility component for updating user's permission fields in forms.
 *
 * @param {string} userKey - The key representing the user field.
 * @param {UserResObject} currentUser - The current user object.
 *
 * @return {React.JSX.Element}
 */
const UpdatePermissionField = ({userKey, currentUser}) => {
    const {touched, errors} = useFormikContext();

    return (
        <Form.Label
            column={true}
            className='d-flex flex-column'
            htmlFor={`user_${currentUser.id}_${userKey}`}
        >
            {''}
            <Field
                id={`user_${currentUser.id}_${userKey}`}
                as={Form.Control}
                className={`rounded-3 border-1 w-100 p-2 ${styles.table_input}`}
                component={UserRoleCheckboxes}
                name={userKey}
                aria-label={`Checkbox fields for ROLE selection.`}
                isInvalid={touched[userKey] && !!errors[userKey]}
            />
        </Form.Label>
    );
};

UpdatePermissionField.propTypes = {
    userKey: PropTypes.string.isRequired,
    currentUser: PropTypes.shape({
        id: PropTypes.number.isRequired,
        email: PropTypes.string.isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        role: PropTypes.string,
        permissions: PropTypes.arrayOf(PropTypes.string),
        username: PropTypes.string.isRequired,
        password: PropTypes.string,
        createdOn: PropTypes.string.isRequired,
        lastModifiedOn: PropTypes.string.isRequired
    }).isRequired
};

export default UpdatePermissionField;