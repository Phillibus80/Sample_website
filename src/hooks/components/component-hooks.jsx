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
import {useAdminContext, useToastContext} from '../context/context-hooks.jsx';

/**
 * A hook at that retrieves components based on the page.  If no page is provided, the
 * hook will return all available sections.
 *
 * @param {string} [page] - the page name, used as a query parameter
 * @return {ReactQuerySectionResObject}
 */
export const useGetComponents = (page) => {
    const {bearerToken} = useAdminContext();
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
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return (
        useMutation({
            mutationKey: ['createComponent'],
            mutationFn: ({componentName}) => createComponent({
                component_name: componentName
            }, bearerToken, csrfToken),
            onSuccess: async () => Promise.all([
                queryClient.invalidateQueries({
                    queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                }),
                queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                }),
                setToastMessage('Component created.'),
                setToastType(TOAST_TYPES.PRIMARY),
                setShowToast(true)
            ]),
            onError: async (e) => {
                if (e?.status === 401) {
                    return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                        }),
                        queryClient.invalidateQueries({
                            queryKey: ['pageContent']
                        }),
                        setToastMessage(`Error creating component. ${e?.response?.data?.message}`),
                        setToastType(TOAST_TYPES.ERROR),
                        setShowToast(true),
                        navigate(ROUTING_CONSTANTS.LOGIN.URL)
                    ]);
                } else {
                    return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                        }),
                        queryClient.invalidateQueries({
                            queryKey: ['pageContent']
                        }),
                        setToastMessage('Error creating component'),
                        setToastType(TOAST_TYPES.ERROR),
                        setShowToast(true)
                    ]);
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
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['updateComponent'],
        mutationFn: async ({id, updates}) =>
            updateComponent(id, updates, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
            }),
            queryClient.invalidateQueries({
                queryKey: ['pageContent']
            }),
            setToastMessage('Component updated.'),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
        ]),
        onError: async (e) => {
            if (e?.status === 401) {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    setToastMessage(`Error updating component.  ${e?.response?.data?.message}`),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true),
                    navigate(ROUTING_CONSTANTS.LOGIN.URL)
                ]);
            } else {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    setToastMessage('Error updating component.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
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
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['removeComponent'],
        mutationFn: async ({id}) =>
            deleteComponent(id, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
            }),
            setToastMessage('Component removed.'),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
        ]),
        onError: async (error) => {
            if (error?.status === 401) {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                    }),
                    setToastMessage(`Error removing component.  ${error?.response?.data?.message}`),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true),
                    navigate(ROUTING_CONSTANTS.LOGIN.URL)
                ]);
            } else {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: [API_ROUTE_CONST.COMPONENTS.replace('/', '')]
                    }),
                    setToastMessage('Error removing component.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
            }
        }
    });
};