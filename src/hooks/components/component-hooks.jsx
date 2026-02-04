import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {
    createComponent,
    deleteComponent,
    getComponents,
    updateComponent
} from '../../api-calls/components/component-calls.js';
import {API_ROUTE_CONST, TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {clearAuthFromSessionStorage} from '../../utils/utils.js';
import {useAuth} from '../auth/use-auth.jsx';
import {useToastContext} from '../context/context-hooks.jsx';

/**
 * A hook at that retrieves components based on the page.  If no page is provided, the
 * hook will return all available sections.
 *
 * @param {string} [page] - the page name, used as a query parameter
 * @return {ReactQuerySectionResObject}
 */
export const useGetComponents = (page) => {
    const {bearerToken} = useAuth();
    return (
        useSuspenseQuery({
            queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')],
            queryFn: () => getComponents(page, bearerToken)
        })
    );
};

/**
 * A hook used to create new global components.
 *
 * @return {import('@tanstack/react-query').UseMutationResult}
 */
export const useCreateComponent = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return (
        useMutation({
            mutationKey: ['createComponent'],
            mutationFn: ({componentName}) => createComponent({
                component_name: componentName
            }, bearerToken, csrfToken),
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                });
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                showToast({message: 'Component created.', type: TOAST_TYPES.PRIMARY});
            },
            onError: async (e) => {
                if (e?.status === 401) {
                    await queryClient.invalidateQueries({
                        queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    });
                    showToast({
                        message: `Error creating component. ${e?.response?.data?.message}`,
                        type: TOAST_TYPES.ERROR
                    });
                    clearAuthFromSessionStorage();
                    navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
                } else {
                    await queryClient.invalidateQueries({
                        queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    });
                    showToast({
                        message: `Error creating component. ${e?.response?.data?.message}`,
                        type: TOAST_TYPES.ERROR
                    });
                }
            }
        })
    );
};

/**
 * A hook that calls the api to update an existing component
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useUpdateComponent = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['updateComponent'],
        mutationFn: async ({id, updates}) =>
            updateComponent(id, updates, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]}),
                queryClient.invalidateQueries({queryKey: ['pageContent']})
            ]);
            showToast({message: 'Component updated.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (e) => {
            if (e?.status === 401) {
                await queryClient.invalidateQueries({
                    queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                });
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                showToast({
                    message: `Error updating component.  ${e?.response?.data?.message}`,
                    type: TOAST_TYPES.ERROR
                });
                sessionStorage.removeItem('authToken');
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            } else {
                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    })
                ]);
                showToast({message: 'Error updating component.', type: TOAST_TYPES.ERROR});
            }
        }
    });
};

/**
 * A hook that calls the api to remove an existing component
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useRemoveComponent = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['removeComponent'],
        mutationFn: async ({id}) =>
            deleteComponent(id, bearerToken, csrfToken),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]});
            showToast({message: 'Component removed.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            if (error?.status === 401) {
                await queryClient.invalidateQueries({
                    queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                });
                showToast({
                    message: `Error removing component.  ${error?.response?.data?.message}`,
                    type: TOAST_TYPES.ERROR
                });
                sessionStorage.removeItem('authToken');
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            } else {
                await queryClient.invalidateQueries({
                    queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                });
                showToast({message: 'Error removing component.', type: TOAST_TYPES.ERROR});
            }
        }
    });
};