import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {createEvent, getEvents, removeEvent, updateEvent} from '../../api-calls/events/event-calls.js';
import {TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {useAdminContext, useToastContext} from '../context/context-hooks.jsx';

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
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return (
        useMutation({
            mutationKey: ['createEvent'],
            mutationFn: (requestBody) => createEvent(requestBody, bearerToken, csrfToken),
            onSuccess: async () => {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['events']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    setToastMessage('Event created.'),
                    setToastType(TOAST_TYPES.PRIMARY),
                    setShowToast(true)
                ]);
            },
            onError: async (error) => {
                if (error?.status === 401) {
                    return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ['events']
                        }),
                        queryClient.invalidateQueries({
                            queryKey: ['pageContent']
                        }),
                        setToastMessage(`Error creating event. ${error?.response?.data?.message}`),
                        setToastType(TOAST_TYPES.ERROR),
                        setShowToast(true),
                        navigate(ROUTING_CONSTANTS.LOGIN.URL)
                    ]);
                } else {
                    return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ['events']
                        }),
                        queryClient.invalidateQueries({
                            queryKey: ['pageContent']
                        }),
                        setToastMessage('Error creating event'),
                        setToastType(TOAST_TYPES.ERROR),
                        setShowToast(true)
                    ]);
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
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['updateEvent'],
        mutationFn: async ({id, updates}) =>
            updateEvent(id, updates, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['events']
            }),
            queryClient.invalidateQueries({
                queryKey: ['pageContent']
            }),
            setToastMessage('Event updated.'),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
        ]),
        onError: async (error) => {
            if (error?.status === 401) {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['events']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    setToastMessage(`Error updating event. ${error?.response?.data?.message}`),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true),
                    navigate(ROUTING_CONSTANTS.LOGIN.URL)
                ]);
            } else {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['events']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    setToastMessage('Error updating event.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
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
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['removeEvent'],
        mutationFn: async ({id}) =>
            removeEvent(id, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['events']
            }),
            setToastMessage(`Event removed.`),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
        ]),
        onError: async (error) => {
            if (error?.status === 401) {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['events']
                    }),
                    setToastMessage(`Error removing event. ${error?.response?.data?.message}`),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true),
                    navigate(ROUTING_CONSTANTS.LOGIN.URL)
                ]);
            } else {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['events']
                    }),
                    setToastMessage('Error removing event.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
            }
        }
    });
};