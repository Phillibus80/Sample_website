import {useContext} from 'react';

import AdminContext from '../../context/admin/admin-context.jsx';
import ToastContext from '../../context/toast/toast-context.jsx';

export const useAdminContext = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('Calling useAdminContext outside of the Provider.');
    }
    return context;
};

export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('Calling useToastContext outside of the Provider.');
    }
    return context;
};