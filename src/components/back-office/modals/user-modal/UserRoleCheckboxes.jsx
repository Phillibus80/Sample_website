import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import {InputGroup} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

import {useGetUsers} from '../../../../hooks/users/user-hooks.js';

/**
 *
 * @param {object} form
 * @param {boolean} disabled
 * @return {React.ReactNode}
 */
const UserRoleCheckboxes = ({form, disabled}) => {
    const {data, isSuccess} = useGetUsers('all');
    const {setFieldValue} = useFormikContext();

    return isSuccess
        ? <InputGroup className='d-flex flex-column'>
            {
                /**
                 * @type {Array<React.ReactNode> | []}
                 */
                data.data.roles.map(role =>
                    <Form.Check
                        key={role}
                        type='checkbox'
                        label={role}
                        checked={form.values.permissions.includes(role)}
                        onChange={() => {
                            form.values.permissions.includes(role)
                                ? setFieldValue('permissions', form.values.permissions.filter(permission => permission !== role))
                                : setFieldValue('permissions', [...form.values.permissions, role]);
                        }}
                        disabled={disabled}
                    />)
            }
        </InputGroup>
        : <div>Loading</div>;
};

UserRoleCheckboxes.propTypes = {
    form: PropTypes.shape({
        values: PropTypes.shape({
            permissions: PropTypes.arrayOf(PropTypes.string).isRequired
        }).isRequired
    }).isRequired,
    disabled: PropTypes.bool.isRequired
};

export default UserRoleCheckboxes;