import {useState} from 'react';

import {Formik} from 'formik';
import {Accordion} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

import OfficeContentButtonGroup from './office-content-button-group.jsx';
import {getFormValueChanges} from './utils.jsx';
import {useAdminContext} from '../../../../hooks/context/context-hooks.jsx';
import {useUpdateImage} from '../../../../hooks/images/image-hooks.jsx';
import AddImageModal from '../../modals/add-image-modal/add-image-modal.jsx';
import {
    generateYupSchema,
    getFormikInitialValues
} from '../../office-generators/office-component-generator/utils/utils.jsx';
import OfficeImageList from '../../office-image/office-image-list.jsx';

const OfficeContentImage = () => {
    const [showModal, setShowModal] = useState(false);
    const {images} = useAdminContext();

    const {
        mutateAsync: updateImage,
        isPending
    } = useUpdateImage();

    const handleFormSubmit = async (values, formikHelpers) => {
        formikHelpers.setSubmitting(true);

        const groupChanges = getFormValueChanges(initValues, values, namespacePrefix);

        if (groupChanges.image) {
            const imageEntries =
                Object.entries(groupChanges.image)
                    .map(([imageId, requestBody]) => {
                            let body = {...requestBody};

                            if (requestBody.image_alt) {
                                body = {
                                    ...requestBody,
                                    alt: requestBody.image_alt
                                };

                                delete body.image_alt;
                            }

                            updateImage({
                                id: imageId,
                                updates: body
                            });
                        }
                    );

            await Promise.all(imageEntries);
        }

        formikHelpers.setSubmitting(false);
        window.location.reload();
    };

    /**
     * @type {Component}
     */
    const component = {
        component_name: '',
        images: images || null
    };

    const namespacePrefix = 'content';

    const initValues = getFormikInitialValues(component, namespacePrefix);

    return <>
        <AddImageModal showModal={showModal} setShowModal={setShowModal}/>

        <Container className={`mt-5`}>
            <h3 className='text-start'>Images</h3>
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
                                    <Accordion.Header>Image List</Accordion.Header>
                                    <Accordion.Body>
                                        <OfficeImageList
                                            imageContent={images}
                                            handleClick={null}
                                            componentContentId={null}
                                            isDisabled={false}
                                            isSelectDisabled={true}
                                            prefix={namespacePrefix}
                                            showAddon={false}
                                        />

                                        <OfficeContentButtonGroup
                                            buttonLabel='Add Image'
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

export default OfficeContentImage;