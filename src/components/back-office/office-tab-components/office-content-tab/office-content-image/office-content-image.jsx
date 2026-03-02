import {useState} from 'react';

import {Formik} from 'formik';
import {Accordion, Spinner} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

import * as styles from './office-content-image.module.scss';
import {useAdminContext} from '../../../../../hooks/context/context-hooks.jsx';
import {useUpdateImage} from '../../../../../hooks/images/image-hooks.jsx';
import AddMultipleImagesModal from '../../../modals/add-multiple-images-modal/add-multiple-images-modal.jsx';
import {
    generateYupSchema,
    getFormikInitialValues
} from '../../../office-generators/office-component-generator/utils/utils.jsx';
import OfficeImageList from '../../../office-image/office-image-list.jsx';
import {getFormValueChanges} from '../utils.jsx';

const OfficeContentImage = () => {
    const [showMultipleImageModal, setShowMultipleImageModal] = useState(false);
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
        <AddMultipleImagesModal showModal={showMultipleImageModal} setShowModal={setShowMultipleImageModal}/>

        <Container className={`mt-5 ${styles.image_container}`}>
            <h3 className='text-start'>Images</h3>
            <Formik
                initialValues={initValues}
                validationSchema={generateYupSchema(initValues)}
                onSubmit={handleFormSubmit}>
                {
                    ({handleSubmit, errors}) =>
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

                                        <div className='mt-5 d-flex justify-content-between'>
                                            <Button
                                                className='mt-3 mb-3'
                                                type='button'
                                                onClick={() => setShowMultipleImageModal(true)}
                                            >
                                                Add Images
                                            </Button>

                                            <Button className='mt-3 mb-3' type='submit'
                                                    disabled={isPending || Object.keys(errors).length > 0}>
                                                <div className='d-flex g-3 justify-content-center align-items-center'>
                                                    <span>Submit Changes</span>
                                                    {isPending ? <Spinner className='ms-3' animation='border'
                                                                          role='statue'/> : ''}
                                                </div>
                                            </Button>
                                        </div>
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