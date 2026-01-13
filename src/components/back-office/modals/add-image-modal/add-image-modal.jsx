import {Field, Formik} from 'formik';
import PropTypes from 'prop-types';
import {Form, Modal, Row} from 'react-bootstrap';
import {mixed, object, string} from 'yup';

import * as styles from './add-image-modal.module.scss';
import {useCreateImage} from '../../../../hooks/images/image-hooks.jsx';
import ImageInput from '../../../image-input/ImageInput.jsx';
import ModalButtonGroup from '../modal-button-group/modal-button-group.jsx';

/**
 * A modal that allows for the user to upload an image
 *
 * @param {boolean} showModal
 * @param {function} setShowModal
 *
 * @return {React.JSX.Element}
 */
const AddImageModal = ({showModal, setShowModal}) => {
    const {
        mutateAsync: uploadImage,
        isPending
    } = useCreateImage();

    const initValues = {
        newImage: '',
        imageText: '',
        imageAlt: ''
    };

    const yupSchema = object().shape({
        newImage: mixed()
            .required('A selected image file to upload is required.')
            .test(
                'fileSize',
                'File is too large. Max size is 2MB.',
                (value) => value && value?.size <= 500000 // 5 MB
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

    return <Modal
        show={showModal}
        centered
        onHide={() => setShowModal(false)}
    >
        <Modal.Header closeButton>
            <Modal.Title>Add a new image</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <Formik
                initialValues={initValues}
                validationSchema={yupSchema}
                onSubmit={async ({imageText, imageAlt, newImage}, formikHelpers) => {
                    formikHelpers.setSubmitting(true);

                    await uploadImage({
                        imageText: imageText,
                        alt: imageAlt,
                        uploadedFile: newImage
                    });

                    setShowModal(false);
                    formikHelpers.setSubmitting(false);
                }}
            >
                {
                    ({
                         handleSubmit,
                         touched,
                         values,
                         errors
                     }) =>
                        <Form onSubmit={handleSubmit}>
                            <Row className='mb-3'>
                                <Form.Group>
                                    <Form.Label
                                        column={true}
                                        className='d-flex flex-column'
                                    >
                                        Image Text:
                                    </Form.Label>

                                    <Field
                                        as={Form.Control}
                                        className={`rounded-3 border-1 w-100 p-2 ${styles.input_background}`}
                                        type='input'
                                        value={values.imageText}
                                        id='imageText'
                                        name='imageText'
                                        aria-label={`An input field to add the image text.`}
                                    />

                                    {errors.imageText && touched.imageText ? (
                                        <div className={styles.error_text}>{errors.imageText}</div>
                                    ) : null}
                                </Form.Group>
                            </Row>

                            <Row className='mb-3'>
                                <Form.Group controlId='imageAlt'>
                                    <Form.Label
                                        column={true}
                                        className='d-flex flex-column'
                                    >
                                        Image Alt Text:
                                    </Form.Label>

                                    <Field
                                        as={Form.Control}
                                        className={`rounded-3 p-2 border-1 w-100 ${styles.input_background}`}
                                        type='input'
                                        value={values.imageAlt}
                                        name='imageAlt'
                                        aria-label={`An input field to add the image alt text.`}
                                    />

                                    {errors.imageAlt && touched.imageAlt ? (
                                        <div className={styles.error_text}>{errors.imageAlt}</div>
                                    ) : null}
                                </Form.Group>
                            </Row>

                            <Row>
                                <Field
                                    type='input'
                                    value={values.newImage}
                                    name='newImage'
                                    component={ImageInput}
                                    aria-label={`A button to upload an image.`}
                                />
                            </Row>

                            <ModalButtonGroup
                                buttonLabel='Upload Image'
                                setShowModal={setShowModal}
                                isPending={isPending}
                            />
                        </Form>
                }
            </Formik>
        </Modal.Body>
    </Modal>;
};

AddImageModal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    setShowModal: PropTypes.func.isRequired
};

export default AddImageModal;