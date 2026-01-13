import {Suspense} from 'react';

import {Table} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';

import {useGetUsers} from '../../../../hooks/users/user-hooks.js';
import LoadingSkeleton from '../../../loading-skeleton/loading-skeleton.jsx';
import ScrollTopButton from '../../../scroll-top-button/scroll-top-button.jsx';

const OfficeEmailUserTab = () => {
    const {data, isSuccess} = useGetUsers('EMAIL');
    const userList = data?.data?.users ?? [];

    return (
        <Suspense fallback={<LoadingSkeleton/>}>
            <Container className={`mt-5`}>
                <Table striped bordered hover className={`w-100 text-black`}>
                    <thead>
                    <tr>
                        <th>Email</th>
                        <th>Created On</th>
                    </tr>
                    </thead>

                    <tbody>
                    {
                        isSuccess ?
                            userList?.map(
                                user =>
                                    <tr key={user?.email}>
                                        <td className='text-black text-start p-3'>{user?.email}</td>
                                        <td className='text-black text-center p-3'>{new Date(user?.createdOn).toDateString()}</td>
                                    </tr>
                            ) : []
                    }
                    </tbody>
                </Table>
            </Container>
            <ScrollTopButton/>
        </Suspense>
    );
};

export default OfficeEmailUserTab;