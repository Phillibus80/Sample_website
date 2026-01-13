import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {
    createComponentContent,
    deleteComponentContent,
    updateComponentContent
} from '../../api-calls/content/content-calls.js';
import {TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {useAdminContext, useToastContext} from '../context/context-hooks.jsx';

/**
 * A hook that calls the api to create new content for the page/section/component
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useCreateComponentContent = () => {
    const queryClient = useQueryClient();
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['createNewContent'],
        mutationFn: async ({
                               componentContentId,
                               requestBody
                           }) => createComponentContent(componentContentId, requestBody, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['pageContent']
            }),
            queryClient.invalidateQueries({
                queryKey: ['images']
            }),
            queryClient.invalidateQueries({
                queryKey: ['links']
            }),
            queryClient.invalidateQueries({
                queryKey: ['events']
            }),
            setToastMessage('Content created.'),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
        ]),
        onError: async (error) => {
            if (error?.status === 401) {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['images']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['links']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['events']
                    }),
                    setToastMessage(`Error creating content. ${error?.response?.data?.message}`),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true),
                    navigate(ROUTING_CONSTANTS.LOGIN.URL)
                ]);
            } else {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['images']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['links']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['events']
                    }),
                    setToastMessage('Error creating content.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
            }
        }
    });
};

/**
 * A hook that calls the api to remove the content based on the
 * component content id.
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useRemoveComponentContent = () => {
    const queryClient = useQueryClient();
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['removeContent'],
        mutationFn: async ({contentId: componentContentId}) => deleteComponentContent(componentContentId, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                }),
                setToastMessage('Content removed.'),
                setToastType(TOAST_TYPES.PRIMARY),
                setShowToast(true)
            ]);
        },
        onError:
            /**
             * @param {import('axios').AxiosError<{ message: string }>} error - The Axios error object
             * @return {Promise<void>}
             */
            async (error) => {
                if (error?.status === 401) {
                    await Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ['pageContent']
                        }),
                        setToastMessage(`Error removing content. ${error?.response?.data?.message}`),
                        setToastType(TOAST_TYPES.ERROR),
                        setShowToast(true),
                        navigate(ROUTING_CONSTANTS.LOGIN.URL)
                    ]);
                } else {
                    await Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ['pageContent']
                        }),
                        setToastMessage(`Error removing content. ${error?.response?.data?.message}`),
                        setToastType(TOAST_TYPES.ERROR),
                        setShowToast(true)
                    ]);
                }
            }
    });
};

/**
 * A hook that calls the api to update the content based on the
 * component content id.
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useUpdateComponentContent = () => {
    const queryClient = useQueryClient();
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['updateContent'],
        mutationFn: async ({
                               componentContentId,
                               requestBody
                           }) => updateComponentContent(componentContentId, requestBody, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['pageContent']
            }),
            setToastMessage('Content updated.'),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
        ]),
        onError: async (error) => {
            if (error?.status === 401) {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    setToastMessage(`Error updating content. ${error?.response?.data?.message}`),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true),
                    navigate(ROUTING_CONSTANTS.LOGIN.URL)
                ]);
            } else {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    setToastMessage('Error updating content.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
            }
        }
    });
};