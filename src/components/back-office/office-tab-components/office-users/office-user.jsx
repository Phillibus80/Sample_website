import PropTypes from 'prop-types';
import {Spinner} from 'react-bootstrap';
import {GrSubtractCircle} from 'react-icons/gr';

import * as styles from './office-users.module.scss';
import {useDeleteUser} from '../../../../hooks/users/user-hooks.js';

/**
 *
 * @param {UserResObject} user
 * @param {function} handleClick
 * @param {boolean} isAdminRole
 * @return {React.ReactNode|null}
 */
const OfficeUser = ({user, handleClick, isAdminRole}) => {
    const {
        mutateAsync: removeUser,
        isPending: removeUserLoading
    } = useDeleteUser();

    if (!user) return null;

    return (
        <tr key={user.email} className={styles.table_row} onClick={() => handleClick(user)}>
            <td className='text-black text-start p-3'>
                {user.firstName}
            </td>

            <td className='text-black text-start p-3'>
                {user.lastName}
            </td>

            <td className='text-black text-start p-3'>
                {user.email}
            </td>

            <td className='text-black text-start p-3'>
                {user.username}
            </td>

            {isAdminRole
                && <>
                    <td className='text-black text-start p-3'>
                        {user.permissions.toString()}
                    </td>

                    <td className='text-black text-center p-3'>
                        {new Date(user.createdOn).toDateString()}
                    </td>

                    <td className='text-black text-center p-3'>
                        {new Date(user.lastModifiedOn).toDateString()}
                    </td>

                    <td className='text-black text-center p-3'>
                        {
                            removeUserLoading
                                ? <Spinner style={{color: 'blue'}} animation='border'
                                           role='status'/>
                                : <GrSubtractCircle
                                    className={`${styles.subtractCircle}`}
                                    style={{fontSize: '1.5rem'}}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await removeUser({id: user.id});
                                    }}
                                />
                        }
                    </td>
                </>
            }
        </tr>
    );
};

OfficeUser.propTypes = {
    user: PropTypes.shape({
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
    handleClick: PropTypes.func.isRequired,
    isAdminRole: PropTypes.bool.isRequired
};

export default OfficeUser;