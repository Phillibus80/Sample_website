import {Field} from 'formik';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';

import {convertCamelCaseToTitleCase} from '../../../../utils/utils.js';

/**
 * A utility component for rendering admin fields that are not editable in forms.
 *
 * @param {string} userKey - The key representing the user field.
 * @param {UserResObject} currentUser - The current user object.
 *
 * @return {React.JSX.Element}
 */
const AdminUserField = ({userKey, currentUser}) => {
    return (
        <Form.Label
            column={true}
            className='d-flex flex-column'
            htmlFor={`user_${currentUser.id}_${userKey}`}
        >
            {convertCamelCaseToTitleCase(userKey)}
            <Field
                id={`user_${currentUser.id}_${userKey}`}
                as={Form.Control}
                className={`rounded-3 border-1 w-100 p-2 text-black`}
                disabled={true}
                value={currentUser[userKey]}
                name={userKey}
                type='input'
                aria-label={`An input field for the user's ${userKey}.`}
                isInvalid={false}
            />
        </Form.Label>
    );
};

AdminUserField.propTypes = {
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

export default AdminUserField;