import {useMutation, useQueryClient} from '@tanstack/react-query';

import {
    createComponentContent,
    deleteComponentContent,
    updateComponentContent
} from '../../api-calls/content/content-calls.js';
import {TOAST_TYPES} from '../../constants/constants.js';
import {useAuth} from '../auth/use-auth.jsx';
import {useToastContext} from '../context/context-hooks.jsx';

/**
 * A hook that calls the api to create new content for the page/section/component
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useCreateComponentContent = () => {
    const queryClient = useQueryClient();
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();

    return useMutation({
        mutationKey: ['createNewContent'],
        mutationFn: async ({
                               componentContentId,
                               requestBody
                           }) => createComponentContent(componentContentId, requestBody, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ['pageContent']}),
                queryClient.invalidateQueries({queryKey: ['images']}),
                queryClient.invalidateQueries({queryKey: ['links']}),
                queryClient.invalidateQueries({queryKey: ['events']})
            ]);
            showToast({message: 'Content created.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ['pageContent']}),
                queryClient.invalidateQueries({queryKey: ['images']}),
                queryClient.invalidateQueries({queryKey: ['links']}),
                queryClient.invalidateQueries({queryKey: ['events']})
            ]);
            showToast({
                message: `Error creating content. ${error?.response?.data?.message ?? ''}`,
                type: TOAST_TYPES.ERROR
            });
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
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();

    return useMutation({
        mutationKey: ['removeContent'],
        mutationFn: async ({contentId: componentContentId}) => deleteComponentContent(componentContentId, bearerToken, csrfToken),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['pageContent'],
                exact: false
            });
            showToast({message: 'Content removed.', type: TOAST_TYPES.PRIMARY});
        },
        onError:
            /**
             * @param {import('axios').AxiosError<{ message: string }>} error - The Axios error object
             * @return {Promise<void>}
             */
            async (error) => {
                await queryClient.invalidateQueries({queryKey: ['pageContent']});
                showToast({
                    message: `Error removing content. ${error?.response?.data?.message ?? ''}`,
                    type: TOAST_TYPES.ERROR
                });
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
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();

    return useMutation({
        mutationKey: ['updateContent'],
        mutationFn: async ({
                               componentContentId,
                               requestBody
                           }) => updateComponentContent(componentContentId, requestBody, bearerToken, csrfToken),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['pageContent']});
            showToast({message: 'Content updated.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            await queryClient.invalidateQueries({queryKey: ['pageContent']});
            showToast({
                message: `Error updating content. ${error?.response?.data?.message ?? ''}`,
                type: TOAST_TYPES.ERROR
            });
        }
    });
};
