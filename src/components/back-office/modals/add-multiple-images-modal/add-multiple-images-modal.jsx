import {FieldArray, Formik} from 'formik';
import PropTypes from 'prop-types';
import {Button, Col, Form, Modal, Row} from 'react-bootstrap';
import {array, mixed, object, string} from 'yup';

import * as styles from './add-multiple-images-modal.module.scss';
import {useCreateImage} from '../../../../hooks/images/image-hooks.jsx';
import ModalButtonGroup from '../modal-button-group/modal-button-group.jsx';

/**
 * A modal that allows for the user to upload multiple images
 *
 * @param {boolean} showModal
 * @param {function} setShowModal
 *
 * @return {React.JSX.Element}
 */
const AddMultipleImagesModal = ({showModal, setShowModal}) => {
    const {
        mutateAsync: uploadImage
    } = useCreateImage();

    const initValues = {
        images: [{
            file: null,
            imageText: '',
            imageAlt: ''
        }]
    };

    const imageSchema = object().shape({
        file: mixed()
            .required('A selected image file to upload is required.')
            .test(
                'fileSize',
                'File is too large. Max size is 5MB.',
                (value) => value && value?.size <= 5242880
            )
            .test(
                'fileFormat',
                'Unsupported file format.',
                (value) => value && [
                    'image/jpg',
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'image/ico',
                    'image/webp'
                ].includes(value?.type)
            ),
        imageText: string().required('The Image Text field is required.'),
        imageAlt: string().required('The Image Alt field is required.')
    });

    const yupSchema = object().shape({
        images: array().of(imageSchema).min(1, 'At least one image is required.')
    });

    return <Modal
        show={showModal}
        centered
        size='lg'
        onHide={() => setShowModal(false)}
    >
        <Modal.Header closeButton>
            <Modal.Title>Add Multiple Images</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <Formik
                enableReinitialize
                initialValues={initValues}
                validationSchema={yupSchema}
                onSubmit={async ({images}, formikHelpers) => {
                    formikHelpers.setSubmitting(true);

                    try {
                        for (const image of images) {
                            await uploadImage({
                                imageText: image.imageText,
                                alt: image.imageAlt,
                                uploadedFile: image.file
                            });
                        }

                        setShowModal(false);
                    } catch (error) {
                        console.error('Error uploading images:', error);
                    } finally {
                        formikHelpers.setSubmitting(false);
                    }
                }}
            >
                {
                    ({
                         handleSubmit,
                         touched,
                         values,
                         errors,
                         setFieldValue,
                         setFieldTouched,
                         isSubmitting
                     }) =>
                        <Form onSubmit={handleSubmit}>
                            <FieldArray name='images'>
                                {({push, remove}) => (
                                    <>
                                        {values.images.map((image, index) => (
                                            <div key={index} className={styles.image_section}>
                                                <div className={styles.image_header}>
                                                    <h5>Image {index + 1}</h5>
                                                    {values.images.length > 1 && (
                                                        <Button
                                                            variant='danger'
                                                            size='sm'
                                                            onClick={() => remove(index)}
                                                            aria-label={`Remove image ${index + 1}`}
                                                        >
                                                            Remove
                                                        </Button>
                                                    )}
                                                </div>

                                                <Row className='mb-3'>
                                                    <Form.Group>
                                                        <Form.Label column={true}>
                                                            Image Text:
                                                        </Form.Label>

                                                        <Form.Control
                                                            className={`rounded-3 border-1 w-100 p-2 ${styles.input_background}`}
                                                            type='text'
                                                            value={values.images[index].imageText}
                                                            onChange={(e) => setFieldValue(`images.${index}.imageText`, e.target.value)}
                                                            aria-label={`Image text for image ${index + 1}`}
                                                        />

                                                        {errors.images?.[index]?.imageText && touched.images?.[index]?.imageText ? (
                                                            <div
                                                                className={styles.error_text}>{errors.images[index].imageText}</div>
                                                        ) : null}
                                                    </Form.Group>
                                                </Row>

                                                <Row className='mb-3'>
                                                    <Form.Group>
                                                        <Form.Label column={true}>
                                                            Image Alt Text:
                                                        </Form.Label>

                                                        <Form.Control
                                                            className={`rounded-3 p-2 border-1 w-100 ${styles.input_background}`}
                                                            type='text'
                                                            value={values.images[index].imageAlt}
                                                            onChange={(e) => setFieldValue(`images.${index}.imageAlt`, e.target.value)}
                                                            aria-label={`Image alt text for image ${index + 1}`}
                                                        />

                                                        {errors.images?.[index]?.imageAlt && touched.images?.[index]?.imageAlt ? (
                                                            <div
                                                                className={styles.error_text}>{errors.images[index].imageAlt}</div>
                                                        ) : null}
                                                    </Form.Group>
                                                </Row>

                                                <Row className='mb-3'>
                                                    <Form.Group>
                                                        <Form.Label column={true}>
                                                            Select Image File:
                                                        </Form.Label>

                                                        <Form.Control
                                                            type='file'
                                                            accept='image/jpg,image/jpeg,image/png,image/gif,image/ico,image/webp'
                                                            onChange={async (event) => {
                                                                const file = event.currentTarget.files[0];
                                                                await setFieldValue(`images.${index}.file`, file);
                                                                await setFieldTouched(`images.${index}.file`, true, true);
                                                            }}
                                                            aria-label={`File input for image ${index + 1}`}
                                                        />

                                                        {values.images[index].file && (
                                                            <div className={styles.file_preview}>
                                                                Selected: {values.images[index].file.name}
                                                            </div>
                                                        )}

                                                        {errors.images?.[index]?.file && touched.images?.[index]?.file ? (
                                                            <div className={styles.error_text}>
                                                                {typeof errors.images[index].file === 'string'
                                                                    ? errors.images[index].file
                                                                    : 'Invalid file'}
                                                            </div>
                                                        ) : null}
                                                    </Form.Group>
                                                </Row>
                                            </div>
                                        ))}

                                        <Row className='mb-3'>
                                            <Col>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => push({
                                                        file: null,
                                                        imageText: '',
                                                        imageAlt: ''
                                                    })}
                                                    className='w-100'
                                                    aria-label='Add another image'
                                                >
                                                    + Add Another Image
                                                </Button>
                                            </Col>
                                        </Row>
                                    </>
                                )}
                            </FieldArray>

                            <ModalButtonGroup
                                buttonLabel='Upload Images'
                                setShowModal={setShowModal}
                                isPending={isSubmitting}
                            />
                        </Form>
                }
            </Formik>
        </Modal.Body>
    </Modal>;
};

AddMultipleImagesModal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    setShowModal: PropTypes.func.isRequired
};

export default AddMultipleImagesModal;
