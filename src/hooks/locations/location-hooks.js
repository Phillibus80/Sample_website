import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';

import {
    createLocation,
    getLocations,
    removeLocation,
    updateLocation
} from '../../api-calls/locations/location-calls.js';
import {TOAST_TYPES} from '../../constants/constants.js';
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
                await Promise.all([
                    queryClient.invalidateQueries({queryKey: ['events']}),
                    queryClient.invalidateQueries({queryKey: ['locations']}),
                    queryClient.invalidateQueries({queryKey: ['pageContent']})
                ]);
                showToast({message: 'Location created.', type: TOAST_TYPES.PRIMARY});
            },
            onError: async (error) => {
                await Promise.all([
                    queryClient.invalidateQueries({queryKey: ['events']}),
                    queryClient.invalidateQueries({queryKey: ['locations']}),
                    queryClient.invalidateQueries({queryKey: ['pageContent']})
                ]);
                showToast({
                    message: `Error creating location. ${error?.response?.data?.message ?? ''}`,
                    type: TOAST_TYPES.ERROR
                });
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
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ['events']}),
                queryClient.invalidateQueries({queryKey: ['locations']}),
                queryClient.invalidateQueries({queryKey: ['pageContent']})
            ]);
            showToast({
                message: `Error updating location. ${error?.response?.data?.message ?? ''}`,
                type: TOAST_TYPES.ERROR
            });
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
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['removeLocation'],
        mutationFn: async ({id}) =>
            removeLocation(id, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ['events']}),
                queryClient.invalidateQueries({queryKey: ['locations']}),
                queryClient.invalidateQueries({queryKey: ['pageContent']})
            ]);
            showToast({message: 'Location removed.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ['events']}),
                queryClient.invalidateQueries({queryKey: ['locations']}),
                queryClient.invalidateQueries({queryKey: ['pageContent']})
            ]);
            showToast({
                message: `Error removing location. ${error?.response?.data?.message ?? ''}`,
                type: TOAST_TYPES.ERROR
            });
        }
    });
};
