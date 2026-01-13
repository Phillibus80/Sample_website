import {Field, useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';

import {convertCamelCaseToTitleCase} from '../../../../utils/utils.js';
import * as styles from '../../office-tab-components/office-users/office-users.module.scss';

/**
 * A utility component for rendering typical user input fields in forms.
 *
 * @param {string} userKey - The key representing the user field.
 * @param {UserResObject} currentUser - The current user object.
 *
 * @return {React.JSX.Element}
 */
const TypicalUserInputField = ({userKey, currentUser}) => {
    const {touched, errors} = useFormikContext();

    return (
        <>
            <Form.Label
                column={true}
                htmlFor={`user_${currentUser.id}_${userKey}`}
            >
                {convertCamelCaseToTitleCase(userKey)}
            </Form.Label>
            <Field
                id={`user_${currentUser.id}_${userKey}`}
                as={Form.Control}
                className={`rounded-3 border-1 w-100 p-2 ${styles.table_input}`}
                type={(userKey === 'password' || userKey === 'newPassword') ? 'password' : 'input'}
                name={userKey}
                aria-label={`An input field for the user's ${userKey}.`}
                isInvalid={touched[userKey] && !!errors[userKey]}
            />
            <Form.Control.Feedback type='invalid' style={{display: 'block'}}>
                {errors[userKey]}
            </Form.Control.Feedback>
        </>
    );
};

TypicalUserInputField.propTypes = {
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

export default TypicalUserInputField;