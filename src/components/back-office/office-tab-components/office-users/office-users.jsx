import {useState} from 'react';

import PropTypes from 'prop-types';
import {Row, Spinner} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import {GrSubtractCircle} from 'react-icons/gr';
import {LuPencil} from 'react-icons/lu';

import * as styles from './office-users.module.scss';
import {ROLES} from '../../../../constants/constants.js';
import {useAuth} from '../../../../hooks/auth/use-auth.jsx';
import {useDeleteUser, useGetUsers} from '../../../../hooks/users/user-hooks.js';
import DataTable from '../../../data-table/DataTable.jsx';
import ScrollTopButton from '../../../scroll-top-button/scroll-top-button.jsx';
import OfficeUserModal from '../../modals/user-modal/office-user-modal.jsx';

/**
 * Renders the delete action cell for a single user row.
 * Defined as its own component so each row gets its own `useDeleteUser` hook instance
 * and therefore its own independent pending/loading state.
 *
 * @param {{user: object}} props
 */
const UserDeleteCell = ({user}) => {
    const {mutateAsync: removeUser, isPending} = useDeleteUser();
    const {roles} = useAuth();

    const canRemove =
        !user.permissions.includes(ROLES.SUPER) ||
        roles.includes(ROLES.SUPER);

    if (!canRemove) return null;

    return isPending ? (
        <Spinner animation='border' role='status' style={{color: 'blue'}}/>
    ) : (
        <GrSubtractCircle
            className={styles.subtractCircle}
            style={{fontSize: '1.5rem'}}
            onClick={async (e) => {
                e.stopPropagation();
                await removeUser({id: user.id});
            }}
        />
    );
};

UserDeleteCell.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.number.isRequired,
        permissions: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
};

/**
 * Renders the edit (pencil) action cell for a single user row.
 * Applies the same role guard as UserDeleteCell — SUPER users can only
 * be edited by another SUPER user.
 *
 * @param {{user: object, onEdit: function}} props
 */
const UserEditCell = ({user, onEdit}) => {
    const {roles} = useAuth();

    const canEdit =
        !user.permissions.includes(ROLES.SUPER) ||
        roles.includes(ROLES.SUPER);

    if (!canEdit) return null;

    return (
        <LuPencil
            style={{fontSize: '1.25rem', cursor: 'pointer'}}
            onClick={() => onEdit(user)}
            aria-label={`Edit ${user.firstName} ${user.lastName}`}
        />
    );
};

UserEditCell.propTypes = {
    user: PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        permissions: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    onEdit: PropTypes.func.isRequired,
};

const BASE_COLUMNS = [
    {key: 'firstName', label: 'First Name', sortable: true},
    {key: 'lastName', label: 'Last Name', sortable: true},
    {key: 'email', label: 'Email', sortable: true},
    {key: 'username', label: 'User Name', sortable: true},
];

const ADMIN_COLUMNS = [
    {key: 'permissions', label: 'Permissions', sortable: true},
    {key: 'createdOn', label: 'Created On', sortable: true},
    {key: 'lastModified', label: 'Last Modified', sortable: true},
    {key: 'deleteUser', label: 'Delete', sortable: false},
];

const EDIT_COLUMN = {key: 'edit', label: '', sortable: false};

const OfficeUsers = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const {data: userData, isSuccess} = useGetUsers(null, ROLES.EMAIL.toLowerCase());
    const {roles} = useAuth();

    const isAdminRole = roles.includes(ROLES.SUPER) || roles.includes(ROLES.ADMIN);

    const showUserModal = (user) => {
        setCurrentUser(user);
        setShowModal(true);
    };

    const columns = [
        ...BASE_COLUMNS,
        ...(isAdminRole ? ADMIN_COLUMNS : []),
        EDIT_COLUMN,
    ];

    const users = isSuccess ? (userData?.data?.users ?? []) : [];

    const tableData = users.map((user) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        ...(isAdminRole && {
            permissions: user.permissions?.toString() ?? '',
            createdOn: new Date(user.createdOn).toDateString(),
            lastModified: new Date(user.lastModifiedOn).toDateString(),
            deleteUser: <UserDeleteCell user={user}/>,
        }),
        edit: <UserEditCell user={user} onEdit={showUserModal}/>,
    }));

    return (
        <>
            <OfficeUserModal
                showModal={showModal}
                setShowModal={setShowModal}
                currentUser={currentUser}
            />

            <Container className='mt-5'>
                <DataTable
                    data={tableData}
                    columns={columns}
                    sortable
                    responsive
                    striped
                    bordered
                    hover
                />

                <Row className='mt-5'>
                    <Button
                        className='w-25'
                        type='button'
                        onClick={() =>
                            showUserModal({
                                firstName: '',
                                lastName: '',
                                email: '',
                                username: '',
                                password: '',
                                permissions: [],
                            })
                        }
                    >
                        Create User
                    </Button>
                </Row>
                <ScrollTopButton/>
            </Container>
        </>
    );
};

export default OfficeUsers;