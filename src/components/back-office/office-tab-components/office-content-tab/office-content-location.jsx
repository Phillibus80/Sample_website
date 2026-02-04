import {useState} from 'react';

import {Formik} from 'formik';
import {Accordion} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

import OfficeContentButtonGroup from './office-content-button-group.jsx';
import {getFormValueChanges} from './utils.jsx';
import {useAdminContext} from '../../../../hooks/context/context-hooks.jsx';
import {useUpdateLocation} from '../../../../hooks/locations/location-hooks.js';
import AddLocationModal from '../../modals/add-location-modal/add-location-modal.jsx';
import {
    generateLocationContent,
    generateYupSchema,
    getFormikInitialValues
} from '../../office-generators/office-component-generator/utils/utils.jsx';

/**
 * A React functional component that manages and displays office content locations
 * including the ability to update and add new locations.
 *
 * The component uses React state, hooks, and a form structure managed by Formik
 * for handling user input and submissions. It primarily interacts with administrative
 * location data and facilitates asynchronous updates for location entities.
 *
 * Key features include:
 * - Displaying a list of office content locations.
 * - Handling the addition of new locations via a modal interface.
 * - Providing an interface to update existing locations with form validation.
 *
 * @constant {Function} OfficeContentLocation
 * @returns {React.JSX.Element} A React component containing location content management functionalities.
 */
const OfficeContentLocation = () => {
    const [showModal, setShowModal] = useState(false);
    const {locations} = useAdminContext();
    const {
        mutateAsync: updateLocation,
        isPending
    } = useUpdateLocation();

    const handleFormSubmit = async (values) => {
        const groupChanges = getFormValueChanges(initValues, values, namespacePrefix);

        if (groupChanges.location) {
            const locationUpdates = Object.entries(groupChanges.location).map(
                ([locationId, requestBody]) => {

                    return updateLocation({
                        id: Number(locationId),
                        updates: requestBody
                    });
                }
            );

            await Promise.all(locationUpdates);
        }
    };

    /**
     * @type {Component}
     */
    const component = {
        component_name: '',
        locations: locations || null
    };

    const namespacePrefix = 'content';

    const initValues = getFormikInitialValues(component, namespacePrefix);

    return <>
        <AddLocationModal showModal={showModal} setShowModal={setShowModal}/>

        <Container className={`mt-5`}>
            <h3 className='text-start'>Locations</h3>
            <Formik
                enableReinitialize
                initialValues={initValues}
                validationSchema={generateYupSchema(initValues)}
                onSubmit={handleFormSubmit}>
                {
                    ({handleSubmit}) =>
                        <Form
                            onSubmit={handleSubmit}
                        >
                            <Accordion className='mb-5'>
                                <Accordion.Item eventKey='11'>
                                    <Accordion.Header>Location List</Accordion.Header>
                                    <Accordion.Body>
                                        {
                                            generateLocationContent(
                                                locations,
                                                null,
                                                null,
                                                false,
                                                namespacePrefix,
                                                false
                                            )
                                        }

                                        <OfficeContentButtonGroup
                                            buttonLabel='Add Location'
                                            setShowModal={setShowModal}
                                            isPending={isPending}
                                        />
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Form>
                }
            </Formik>
        </Container>
    </>;

};

export default OfficeContentLocation;