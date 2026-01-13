import {useState} from 'react';

import {Row, Table} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

import OfficeUser from './office-user.jsx';
import {ROLES} from '../../../../constants/constants.js';
import {useAdminContext} from '../../../../hooks/context/context-hooks.jsx';
import {useGetUsers} from '../../../../hooks/users/user-hooks.js';
import ScrollTopButton from '../../../scroll-top-button/scroll-top-button.jsx';
import OfficeUserModal from '../../modals/user-modal/office-user-modal.jsx';

const OfficeUsers = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const {
        data: userData,
        isSuccess
    } = useGetUsers(null, ROLES.EMAIL);

    const {roles} = useAdminContext();
    const isAdminRole = (roles.includes(ROLES.SUPER) || roles.includes(ROLES.ADMIN));

    /**
     * @param {CreateUserObject} user
     */
    const showUserModal = (user) => {
        setCurrentUser(user);
        setShowModal(true);
    };

    return <>
        <OfficeUserModal
            showModal={showModal}
            setShowModal={setShowModal}
            currentUser={currentUser}
        />

        <Container className={`mt-5`}>
            <Table striped bordered hover className={`w-100 text-black`}>
                <thead>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>User Name</th>
                    {isAdminRole
                        && <>
                            <th>Permissions</th>
                            <th>Created On</th>
                            <th>Last Modified</th>
                            <th>Delete User</th>
                        </>
                    }
                </tr>
                </thead>

                <tbody>
                {
                    isSuccess ?
                        userData?.data?.users?.map(user =>
                            <OfficeUser
                                key={user.id}
                                user={user}
                                handleClick={showUserModal}
                                isAdminRole={isAdminRole}
                            />
                        ) : []
                }
                </tbody>
            </Table>

            <Row>
                <Button
                    className='w-25'
                    type='button'
                    onClick={() => showUserModal({
                        firstName: '',
                        lastName: '',
                        email: '',
                        username: '',
                        password: '',
                        permissions: []
                    })}
                >
                    {`Create User`}
                </Button>
            </Row>
            <ScrollTopButton/>
        </Container>
    </>;
};

export default OfficeUsers;