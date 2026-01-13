import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {createImage, getImages, removeImage, updateImage} from '../../api-calls/images/image-calls.js';
import {API_ROUTE_CONST, TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {useAdminContext, useToastContext} from '../context/context-hooks.jsx';

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
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['createImage'],
        mutationFn: async ({imageText, alt, uploadedFile}) =>
            createImage(imageText, alt, uploadedFile, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['pageContent']
            }),
            queryClient.invalidateQueries({
                queryKey: ['images']
            }),
            setToastMessage('Image created.'),
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
                    setToastMessage(`Error creating image file.  ${error?.response?.data?.message}`),
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
                    setToastMessage('Error creating image file.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
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
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['updateImage'],
        mutationFn: async ({id, updates}) =>
            updateImage(id, updates, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['pageContent']
            }),
            queryClient.invalidateQueries({
                queryKey: ['images']
            }),
            setToastMessage('Image updated.'),
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
                    setToastMessage(`Error updating image.  ${error?.response?.data?.message}`),
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
                    setToastMessage('Error updating image.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
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
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['removeImage'],
        mutationFn: async ({id}) =>
            removeImage(id, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['pageContent']
            }),
            queryClient.invalidateQueries({
                queryKey: ['images']
            }),
            setToastMessage('Image removed.'),
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
                    setToastMessage(`Error removing image.  ${error?.response?.data?.message}`),
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
                    setToastMessage('Error removing image.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
            }
        }
    });
};