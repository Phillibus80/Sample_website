import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {
    createLocation,
    getLocations,
    removeLocation,
    updateLocation
} from '../../api-calls/locations/location-calls.js';
import {TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {clearAuthFromSessionStorage} from '../../utils/utils.js';
import {useAuth} from '../auth/use-auth.jsx';
import {useToastContext} from '../context/context-hooks.jsx';

/**
 * A hook that retrieves all events from the database.
 *
 * @return {import('@tanstack/react-query').UseSuspenseQueryResult<LocationObject>}
 */
export const useGetLocations = () => {
    return (
        useSuspenseQuery({
            queryKey: ['locations'],
            queryFn: () => getLocations(),
            select: data => {
                const {data: {data: locations}} = data ?? {data: {data: []}};

                return locations.map(
                    /**
                     * @param {LocationRawObject} location
                     * @return {LocationObject}
                     */
                    location => ({
                        location_id: location.id,
                        location_name: location.name,
                        location_address: location.address,
                        location_city: location.city,
                        location_state: location.state,
                        location_zip: location.zip,
                        location_telephone: location.telephone,
                        location_lng: parseFloat(location.lng),
                        location_lat: parseFloat(location.lat)
                    })
                );
            }

        })
    );
};

/**
 * A hook used to create a location.
 *
 * @return {import('@tanstack/react-query').UseMutationResult}
 */
export const useCreateLocation = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return (
        useMutation({
            mutationKey: ['createLocation'],
            mutationFn:
                /**
                 * @param {CreateLocationContentRequestBody} requestBody
                 * @return {Promise<import('axios').AxiosResponse<*>>}
                 */
                    (requestBody) => createLocation(requestBody, bearerToken, csrfToken),
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: ['events']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['locations']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                showToast({message: 'Location created.', type: TOAST_TYPES.PRIMARY});
            },
            onError: async (error) => {
                if (error?.status === 401) {
                    await queryClient.invalidateQueries({
                        queryKey: ['events']
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ['locations']
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    });
                    showToast({
                        message: `Error creating location.  ${error?.response?.data?.message}`,
                        type: TOAST_TYPES.ERROR
                    });
                    clearAuthFromSessionStorage();
                    navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
                } else {
                    await queryClient.invalidateQueries({
                        queryKey: ['events']
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ['locations']
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    });
                    showToast({message: 'Error creating location', type: TOAST_TYPES.ERROR});
                }
            }
        })
    );
};

/**
 *  The Mutation function for the useUpdateLocation hook
 *
 * @param {number} id - location id
 * @param {UpdateLocationContentRequestBody} updates -
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<void>}
 */
const updateLocationMutateFunction = async (
    id,
    updates,
    bearerToken,
    csrfToken
) => {
    const requestBody = Object.entries(updates)
        ?.reduce((accum, [key, value]) => {
            const strippedKey = key.replace('location_', '');
            accum[strippedKey] = value;

            return accum;
        }, {});

    await updateLocation(id, requestBody, bearerToken, csrfToken);
};

/**
 * A hook that calls the api to update an existing location
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useUpdateLocation = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['updateLocation'],
        mutationFn: ({id, updates}) => updateLocationMutateFunction(id, updates, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ['events']}),
                queryClient.invalidateQueries({queryKey: ['locations']}),
                queryClient.invalidateQueries({queryKey: ['pageContent']})
            ]);
            showToast({message: 'Location updated.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            if (error?.status === 401) {
                await queryClient.invalidateQueries({
                    queryKey: ['events']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['locations']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                showToast({
                    message: `Error updating event.  ${error?.response?.data?.message}`,
                    type: TOAST_TYPES.ERROR
                });
                sessionStorage.removeItem('authToken');
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            } else {
                await queryClient.invalidateQueries({
                    queryKey: ['events']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['locations']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                showToast({message: 'Error updating event.', type: TOAST_TYPES.ERROR});
            }
        }
    });
};

/**
 * A hook that calls the api to remove an existing location
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useRemoveLocation = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['removeLocation'],
        mutationFn: async ({id}) =>
            removeLocation(id, bearerToken, csrfToken),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['events']
            });
            await queryClient.invalidateQueries({
                queryKey: ['locations']
            });
            await queryClient.invalidateQueries({
                queryKey: ['pageContent']
            });
            setToastMessage('Location removed.');
            setToastType(TOAST_TYPES.PRIMARY);
            setShowToast(true);
        },
        onError: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['events']
            });
            await queryClient.invalidateQueries({
                queryKey: ['locations']
            });
            await queryClient.invalidateQueries({
                queryKey: ['pageContent']
            });
            setToastMessage('Error removing event.');
            setToastType(TOAST_TYPES.ERROR);
            setShowToast(true);
        }
    });
};