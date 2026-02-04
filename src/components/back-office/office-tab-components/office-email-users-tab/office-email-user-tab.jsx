import Container from 'react-bootstrap/Container';

import {ROLES} from '../../../../constants/constants.js';
import {useGetUsers} from '../../../../hooks/users/user-hooks.js';
import DataTable from '../../../data-table/DataTable.jsx';
import ScrollTopButton from '../../../scroll-top-button/scroll-top-button.jsx';

const OfficeEmailUserTab = () => {
    const {data, isSuccess} = useGetUsers(ROLES.EMAIL, null);
    const userList = data?.data?.users ?? [];

    const tableColumns = [
        {key: 'email', label: 'Email', sortable: true},
        {key: 'createdOn', label: 'Created On', sortable: true}
    ];

    const handleRowSelect = (rowData) => {
        if (rowData) {
            // console.log('Selected:', rowData);
        } else {
            // console.log('Deselected');
        }
    };

    return (
        <>
            <Container className={`mt-5`}>
                {isSuccess &&
                    <DataTable
                        data={userList}
                        columns={tableColumns}
                        sortable
                        paginated
                        pageSize={25}
                        filterable
                        filterColumns={['email', 'createdOn']}
                        selectable={false}
                        onRowSelect={handleRowSelect}
                        striped
                        bordered
                        hover
                        responsive
                    />}
            </Container>
            <ScrollTopButton/>
        </>
    );
};

export default OfficeEmailUserTab;