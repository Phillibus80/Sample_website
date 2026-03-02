import {Formik} from 'formik';
import PropTypes from 'prop-types';
import {ButtonGroup, Modal, Spinner} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {object, ref, string} from 'yup';

import TypicalUserInputField from './typical-user-input-field.jsx';
import {generateUserUpdateFields} from './utils.jsx';
import {ROLES} from '../../../../constants/constants.js';
import {useAuth} from '../../../../hooks/auth/use-auth.jsx';
import {useCreateUser, useUpdateUser} from '../../../../hooks/users/user-hooks.js';

const EMAIL_REGX = /^(([^<>()[\]\\.,;:\s@"]+(.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;

/**
 * A Modal component that allows for the manipulation of the user's data.
 *
 * @param {boolean} showModal
 * @param {function} setShowModal
 * @param {UserResObject} currentUser
 *
 * @return {React.ReactNode}
 */
const OfficeUserModal = ({showModal, setShowModal, currentUser}) => {
    const {
        mutateAsync: createUser,
        isPending
    } = useCreateUser();
    const {
        mutateAsync: updateUser,
        isPending: updateUserIsPending
    } = useUpdateUser();
    const {loggedInUserName, roles} = useAuth();

    const isNewUser = !currentUser?.id;
    const isAdmin = roles.includes(ROLES.ADMIN) || roles.includes(ROLES.SUPER);
    const isLoggedInUser = loggedInUserName === currentUser?.username;

    return <Modal
        show={showModal}
        centered
        onHide={() => setShowModal(false)}
    >
        <Modal.Header closeButton>
            <Modal.Title>{isNewUser ? 'Create new User data' : 'Manage User Data'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <Formik
                initialValues={{
                    firstName: currentUser?.firstName || '',
                    lastName: currentUser?.lastName || '',
                    email: currentUser?.email || '',
                    username: currentUser?.username || '',
                    permissions: currentUser?.permissions || [],
                    password: '',
                    newPassword: ''
                }}
                validationSchema={
                    object().shape({
                        firstName: string().required('A first name is required to continue.'),
                        lastName: string().required('A last name is required to continue.'),
                        email: string()
                            .matches(EMAIL_REGX, 'Invalid email address'),
                        username: string().required('A username is required to continue.'),
                        password: isNewUser
                            ? string()
                                .min(8, 'Passwords must be at least 8 characters long.')
                                .required('A password is required to continue.')
                            : string()
                                .min(8, 'Current password must be at least 8 characters long.')
                                .when('newPassword', ([newPassword], schema) => {
                                    return newPassword && newPassword.length > 0
                                        ? schema.required('Current password is required when setting a new password.')
                                        : schema;
                                }),
                        newPassword: isNewUser
                            ? string()
                            : string()
                                .min(8, 'New password must be at least 8 characters long.')
                                .when('password', ([password], schema) => {
                                    return password && password.length > 0
                                        ? schema
                                            .required('New password is required when changing password.')
                                            .notOneOf([ref('password')], 'New password must be different from current password')
                                        : schema;
                                })
                    }, [['password', 'newPassword']])
                }
                onSubmit={
                    async (values) => {
                        if (isNewUser) {
                            await createUser({
                                requestBody: {
                                    first_name: values?.firstName,
                                    last_name: values?.lastName,
                                    email: values?.email,
                                    username: values?.username,
                                    password: values?.password
                                }
                            });

                            setShowModal(false);
                        } else {
                            const changes =
                                Object.keys(values).reduce((accum, currentKey) => {
                                    if (currentKey === 'permissions') {
                                        const sortedCurrent = [...(currentUser[currentKey] || [])].sort();
                                        const sortedNew = [...(values[currentKey] || [])].sort();
                                        const hasChanged = JSON.stringify(sortedCurrent) !== JSON.stringify(sortedNew);
                                        if (hasChanged) accum[currentKey] = values[currentKey];
                                    } else if (currentKey === 'password' || currentKey === 'newPassword') {
                                        if (values[currentKey] && values[currentKey] !== '') {
                                            accum[currentKey] = values[currentKey];
                                        }
                                    } else if (values[currentKey] !== currentUser[currentKey]) {
                                        accum[currentKey] = values[currentKey];
                                    }

                                    return accum;
                                }, {});

                            await updateUser({
                                id: currentUser?.id,
                                updates: changes
                            });

                            setShowModal(false);
                        }
                    }}
            >
                {
                    ({
                         handleSubmit,
                         handleChange,
                         handleBlur,
                         touched,
                         errors
                     }) =>
                        <Form onSubmit={handleSubmit}>
                            {
                                generateUserUpdateFields(
                                    currentUser,
                                    errors,
                                    touched
                                )
                            }

                            {
                                !isNewUser && (isAdmin || isLoggedInUser)
                                && <>
                                    <TypicalUserInputField
                                        userKey='password'
                                        currentUser={currentUser}
                                        handleChange={handleChange}
                                        handleBlur={handleBlur}
                                        errors={errors}
                                        touched={touched}
                                    />
                                    <TypicalUserInputField
                                        userKey='newPassword'
                                        currentUser={currentUser}
                                        handleChange={handleChange}
                                        handleBlur={handleBlur}
                                        errors={errors}
                                        touched={touched}
                                    />
                                </>
                            }

                            <ButtonGroup className='mt-5 d-flex justify-content-between'>
                                <Button
                                    className='me-5 rounded'
                                    variant='secondary'
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type='submit'
                                    className='ms-5 rounded'
                                    variant='primary'
                                    disabled={isPending || updateUserIsPending || Object.keys(errors).length > 0}
                                >
                                    <div className='d-flex g-3 justify-content-center align-items-center'>
                                        <span>{`${isNewUser ? 'Create User' : 'Update User'}`}</span>
                                        {(isPending || updateUserIsPending) ?
                                            <Spinner className='ms-3' animation='border' role='statue'/> : ''}
                                    </div>
                                </Button>
                            </ButtonGroup>
                        </Form>
                }
            </Formik>
        </Modal.Body>
    </Modal>;
};

OfficeUserModal.propTypes = {
    currentUser: PropTypes.shape({
        id: PropTypes.number.isRequired,
        email: PropTypes.string.isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        role: PropTypes.string,
        permissions: PropTypes.arrayOf(PropTypes.string),
        username: PropTypes.string.isRequired,
        createdOn: PropTypes.string.isRequired,
        lastModifiedOn: PropTypes.string.isRequired
    }).isRequired,
    showModal: PropTypes.bool.isRequired,
    setShowModal: PropTypes.func.isRequired
};

export default OfficeUserModal;