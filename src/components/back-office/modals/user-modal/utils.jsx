import {Row} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

import AdminUserField from './admin-user-field.jsx';
import TypicalUserInputField from './typical-user-input-field.jsx';
import UpdatePermissionField from './update-permission-field.jsx';
import * as styles from '../../office-tab-components/office-users/office-users.module.scss';

/**
 * A helper function that takes the current selected user and
 * generates the form fields to update.
 *
 * @param {UserResObject} currentUser
 * @param {object} errors
 * @param {object} touched
 *
 * @return {React.ReactNode|null}
 */
export const generateUserUpdateFields = (
    currentUser,
    errors,
    touched
) => (currentUser !== null)
    ? Object.keys(currentUser).map(userKey => {

            const isAdminField = (
                userKey === 'id'
                || userKey === 'createdOn'
                || userKey === 'lastModifiedOn'
            );

            const isUpdatePermissionsField = (userKey === 'permissions' && !!currentUser?.id);

            const isTypicalUserInputField = (
                userKey !== 'id'
                && userKey !== 'createdOn'
                && userKey !== 'lastModifiedOn'
                && userKey !== 'permissions'
            );

            return <Row className='mb-3' key={`user_${currentUser.id}_${userKey}`}>
                <Form.Group>
                    {
                        isAdminField
                        && <AdminUserField
                            userKey={userKey}
                            currentUser={currentUser}
                        />
                    }

                    {
                        isUpdatePermissionsField
                        && <UpdatePermissionField
                            userKey={userKey}
                            currentUser={currentUser}
                        />
                    }

                    {
                        isTypicalUserInputField
                        && <TypicalUserInputField
                            userKey={userKey}
                            currentUser={currentUser}
                        />
                    }


                    {touched[userKey] && !!errors[userKey] ? (
                        <div className={styles.error_text}>{errors[userKey]}</div>
                    ) : null}
                    <Form.Control.Feedback type='invalid'>
                        {errors[userKey]}
                    </Form.Control.Feedback>
                </Form.Group>
            </Row>;
        }
    )
    : null;