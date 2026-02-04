import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {createImage, getImages, removeImage, updateImage} from '../../api-calls/images/image-calls.js';
import {API_ROUTE_CONST, TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {clearAuthFromSessionStorage} from '../../utils/utils.js';
import {useAuth} from '../auth/use-auth.jsx';
import {useToastContext} from '../context/context-hooks.jsx';

/**
 * A hook that retrieves all images from the database.
 *
 * @return {ReactQueryUserResObject}
 */
export const useGetImages = () => {
    return (
        useSuspenseQuery({
            queryKey: [API_ROUTE_CONST.IMAGES.replace('/', '')],
            queryFn: getImages
        })
    );
};

/**
 * A hook that calls the api to create a new image
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useCreateImage = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['createImage'],
        mutationFn: async ({imageText, alt, uploadedFile}) =>
            createImage(imageText, alt, uploadedFile, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ['pageContent']}),
                queryClient.invalidateQueries({queryKey: ['images']})
            ]);
            showToast({message: 'Image created.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            if (error?.status === 401) {
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['images']
                });
                showToast({
                    message: `Error creating image file.  ${error?.response?.data?.message}`,
                    type: TOAST_TYPES.ERROR
                });
                clearAuthFromSessionStorage();
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            } else {
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['images']
                });
                showToast({message: 'Error creating image file.', type: TOAST_TYPES.ERROR});
            }
        }
    });
};

/**
 * A hook that calls the api to update an existing image
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useUpdateImage = () => {
    const queryClient = useQueryClient();
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['updateImage'],
        mutationFn: async ({id, updates}) =>
            updateImage(id, updates, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ['pageContent']}),
                queryClient.invalidateQueries({queryKey: ['images']})
            ]);
            showToast({message: 'Image updated.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            if (error?.status === 401) {
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['images']
                });
                showToast({
                    message: `Error updating image.  ${error?.response?.data?.message}`,
                    type: TOAST_TYPES.ERROR
                });
                clearAuthFromSessionStorage();
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            } else {
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['images']
                });
                showToast({message: 'Error updating image.', type: TOAST_TYPES.ERROR});
            }
        }
    });
};

/**
 * A hook that calls the api to remove an existing image
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useRemoveImage = () => {
    const queryClient = useQueryClient();
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['removeImage'],
        mutationFn: async ({id}) =>
            removeImage(id, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ['pageContent']}),
                queryClient.invalidateQueries({queryKey: ['images']})
            ]);
            showToast({message: 'Image removed.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            if (error?.status === 401) {
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['images']
                });
                showToast({
                    message: `Error removing image.  ${error?.response?.data?.message}`,
                    type: TOAST_TYPES.ERROR
                });
                clearAuthFromSessionStorage();
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            } else {
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['images']
                });
                showToast({message: 'Error removing image.', type: TOAST_TYPES.ERROR});
            }
        }
    });
};