import {useState} from 'react';

import {Formik} from 'formik';
import {Accordion} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

import OfficeContentButtonGroup from './office-content-button-group.jsx';
import {getFormValueChanges} from './utils.jsx';
import {useAdminContext} from '../../../../hooks/context/context-hooks.jsx';
import {useUpdateLink} from '../../../../hooks/links/link-hooks.js';
import AddLinkModal from '../../modals/add-link-modal/add-link-modal.jsx';
import {
    generateYupSchema,
    getFormikInitialValues
} from '../../office-generators/office-component-generator/utils/utils.jsx';
import OfficeLinkList from '../../office-link/office-link-list.jsx';

const OfficeContentLink = () => {
    const [showModal, setShowModal] = useState(false);
    const {links} = useAdminContext();
    const {
        mutateAsync: updateLink,
        isPending
    } = useUpdateLink();

    const handleFormSubmit = async (values, formikHelpers) => {
        formikHelpers.setSubmitting(true);

        const groupChanges = getFormValueChanges(initValues, values, namespacePrefix);
        if (groupChanges.link) {
            const linkUpdates = Object.entries(groupChanges.link).map(
                ([linkId, requestBody]) => updateLink({
                    id: Number(linkId),
                    updates: requestBody
                })
            );

            await Promise.all(linkUpdates);
        }

        formikHelpers.setSubmitting(false);
        window.location.reload();
    };

    /**
     * @type {Component}
     */
    const component = {
        component_name: '',
        links: links || null
    };

    const namespacePrefix = 'content';

    const initValues = getFormikInitialValues(component, namespacePrefix);

    return <>
        <AddLinkModal showModal={showModal} setShowModal={setShowModal}/>

        <Container className={`mt-5`}>
            <h3 className='text-start'>Links</h3>
            <Formik
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
                                    <Accordion.Header>Link List</Accordion.Header>
                                    <Accordion.Body>
                                        <OfficeLinkList
                                            linkContent={links}
                                            handleClick={null}
                                            componentContentId={null}
                                            isLinkTextInputDisabled={false}
                                            isSelectDisabled={true}
                                            prefix={namespacePrefix}
                                            showAddon={false}
                                        />

                                        <OfficeContentButtonGroup
                                            buttonLabel='Add Link'
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

export default OfficeContentLink;