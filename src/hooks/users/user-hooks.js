import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';

import {createUser, deleteUser, getUsers, updateUser} from '../../api-calls/users/user-calls.js';
import {TOAST_TYPES} from '../../constants/constants.js';
import {useAuth} from '../auth/use-auth.jsx';
import {useToastContext} from '../context/context-hooks.jsx';

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
    const {bearerToken} = useAuth();

    return useSuspenseQuery({
        queryKey: ['users', role, filter],
        queryFn: async () => {
            return getUsers(role, filter, bearerToken);
        }
    });
};

export const useCreateUser = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['create-user'],
        mutationFn: async ({requestBody}) => createUser(requestBody, bearerToken, csrfToken),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['users']});
            showToast({message: 'User created.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            await queryClient.invalidateQueries({queryKey: ['users']});
            showToast({
                message: `Error creating user. ${error?.response?.data?.message ?? ''}`,
                type: TOAST_TYPES.ERROR
            });
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
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['update-user'],
        mutationFn: async ({id, updates}) => updateUser(id, updates, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ['users']}),
                queryClient.invalidateQueries({queryKey: ['pageContent']})
            ]);
            showToast({message: 'User updated.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            await queryClient.invalidateQueries({queryKey: ['users']});
            showToast({
                message: `Error updating user. ${error?.response?.data?.message ?? ''}`,
                type: TOAST_TYPES.ERROR
            });
        }
    });
};

/**
 *  A hook that calls the API to update the given user id given through the path params
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useDeleteUser = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['remove-user'],
        mutationFn: async ({id}) => deleteUser(id, bearerToken, csrfToken),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['users']});
            showToast({message: 'User removed.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            await queryClient.invalidateQueries({queryKey: ['users']});
            showToast({
                message: `Error removing user. ${error?.response?.data?.message ?? ''}`,
                type: TOAST_TYPES.ERROR
            });
        }
    });
};
