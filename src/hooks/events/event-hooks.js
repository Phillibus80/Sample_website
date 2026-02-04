import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {createEvent, getEvents, removeEvent, updateEvent} from '../../api-calls/events/event-calls.js';
import {TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {clearAuthFromSessionStorage} from '../../utils/utils.js';
import {useAuth} from '../auth/use-auth.jsx';
import {useToastContext} from '../context/context-hooks.jsx';

/**
 * A hook that retrieves all events from the database.
 *
 * @return {import('@tanstack/react-query').UseSuspenseQueryResult<EventObject>}
 */
export const useGetEvents = () => {
    return (
        useSuspenseQuery({
            queryKey: ['events'],
            queryFn: () => getEvents(),
            select: data => {
                const {data: {data: events}} = data ?? {data: {data: []}};

                return events.map(
                    /**
                     * @param {EventRawObject} event
                     * @return {EventObject}
                     */
                    event => ({
                        event_id: event.id,
                        event_title: event.title,
                        event_description: event.description,
                        event_location: event.location,
                        event_address: event.address,
                        event_city: event.city,
                        event_state: event.state,
                        event_zip: event.zip,
                        event_telephone: event.telephone,
                        event_lng: parseFloat(event.lng),
                        event_lat: parseFloat(event.lat),
                        event_time: event.event_time.toLocaleString()
                    })
                );
            }

        })
    );
};

/**
 * A hook used to create an event.
 *
 * @return {import('@tanstack/react-query').UseMutationResult}
 */
export const useCreateEvent = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return (
        useMutation({
            mutationKey: ['createEvent'],
            mutationFn: (requestBody) => createEvent(requestBody, bearerToken, csrfToken),
            onSuccess: async () => {
                await Promise.all([
                    queryClient.invalidateQueries({queryKey: ['events']}),
                    queryClient.invalidateQueries({queryKey: ['pageContent']})
                ]);
                showToast({message: 'Event created.', type: TOAST_TYPES.PRIMARY});
            },
            onError: async (error) => {
                if (error?.status === 401) {
                    await queryClient.invalidateQueries({
                        queryKey: ['events']
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    });
                    showToast({
                        message: `Error creating event. ${error?.response?.data?.message}`,
                        type: TOAST_TYPES.ERROR
                    });
                    clearAuthFromSessionStorage();
                    navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
                } else {
                    await Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ['events']
                        }),
                        queryClient.invalidateQueries({
                            queryKey: ['pageContent']
                        }),
                    ]);
                    showToast({message: 'Error creating event', type: TOAST_TYPES.ERROR});
                }
            }
        })
    );
};

/**
 * A hook that calls the api to update an existing event
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useUpdateEvent = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['updateEvent'],
        mutationFn: async ({id, updates}) =>
            updateEvent(id, updates, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ['events']}),
                queryClient.invalidateQueries({queryKey: ['pageContent']})
            ]);
            showToast({message: 'Event updated.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            if (error?.status === 401) {
                await queryClient.invalidateQueries({
                    queryKey: ['events']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                showToast({
                    message: `Error updating event. ${error?.response?.data?.message}`,
                    type: TOAST_TYPES.ERROR
                });
                sessionStorage.removeItem('authToken');
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            } else {
                await queryClient.invalidateQueries({
                    queryKey: ['events']
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
 * A hook that calls the api to remove an existing event
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useRemoveEvent = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['removeEvent'],
        mutationFn: async ({id}) =>
            removeEvent(id, bearerToken, csrfToken),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['events']});
            showToast({message: `Event removed.`, type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            if (error?.status === 401) {
                await queryClient.invalidateQueries({
                    queryKey: ['events']
                });
                showToast({
                    message: `Error removing event. ${error?.response?.data?.message}`,
                    type: TOAST_TYPES.ERROR
                });
                sessionStorage.removeItem('authToken');
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            } else {
                await queryClient.invalidateQueries({
                    queryKey: ['events']
                });
                showToast({message: 'Error removing event.', type: TOAST_TYPES.ERROR});
            }
        }
    });
};