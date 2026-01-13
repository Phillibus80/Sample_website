import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {createUser, deleteUser, getUsers, updateUser} from '../../api-calls/users/user-calls.js';
import {TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {useAdminContext, useToastContext} from '../context/context-hooks.jsx';

/**
 * A hook that calls the api to retrieve the users.  Can be filtered by
 * the optional argument role.
 *
 * @param {Role | 'all' | null} [role] - Optional, the role to filter the users.  'all' can be given as the role
 * to return all ROLE types.
 * @param {Role | null} [filter] - Optional cannot be on at the same time as the role.  Removes
 * the declared Role in the filter and returns everything else.
 *
 * @return {ReactQueryUserResObject} - the response from the API
 */
export const useGetUsers = (role, filter) => {
    const {bearerToken} = useAdminContext();

    return useSuspenseQuery({
        queryKey: ['users', role],
        queryFn: async () => {
            return getUsers(role, filter, bearerToken);
        }
    });
};

export const useCreateUser = () => {
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['create-user'],
        mutationFn: async ({requestBody}) => createUser(requestBody, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['users']
            }),
            setToastMessage('User created.'),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
        ]),
        onError: async (error) => {
            if (error?.status === 401) {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['users']
                    }),
                    setToastMessage(`Error creating user.  ${error?.response?.data?.message}`),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true),
                    navigate(ROUTING_CONSTANTS.LOGIN.URL)
                ]);
            } else {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['users']
                    }),
                    setToastMessage('Error creating user.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
            }
        }
        }
    );
};

/**
 *  A hook that calls the API to update the given user id given through the path params
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useUpdateUser = () => {
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['update-user'],
        mutationFn: async ({id, updates}) => updateUser(id, updates, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['users']
                }),
            queryClient.invalidateQueries({
                queryKey: ['pageContent']
            }),
            setToastMessage('User updated.'),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
            ]
        ),
        onError: async (error) => {
            if (error?.status === 401) {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['users']
                    }),
                    setToastMessage(`Error updating user.  ${error?.response?.data?.message}`),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true),
                    navigate(ROUTING_CONSTANTS.LOGIN.URL)
                ]);
            } else {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['users']
                    }),
                    setToastMessage('Error updating user.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
            }
        }
    });
};

/**
 *  A hook that calls the API to update the given user id given through the path params
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useDeleteUser = () => {
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['remove-user'],
        mutationFn: async ({id}) => deleteUser(id, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['users']
                }),
            setToastMessage('User removed.'),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
            ]
        ),
        onError: async (error) => {
            if (error?.status === 401) {
                return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ['users']
                        }),
                        setToastMessage(`Error removing user.  ${error?.response?.data?.message}`),
                        setToastType(TOAST_TYPES.ERROR),
                        setShowToast(true),
                        navigate(ROUTING_CONSTANTS.LOGIN.URL)
                    ]
                );
            } else {
                return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ['users']
                        }),
                        setToastMessage('Error removing user.'),
                        setToastType(TOAST_TYPES.ERROR),
                        setShowToast(true)
                    ]
                );
            }
        }
    });
};