import {Field, Formik} from 'formik';
import PropTypes from 'prop-types';
import {Form, Modal, Row} from 'react-bootstrap';
import {object, string} from 'yup';

import * as styles from './add-link-modal.module.scss';
import {useCreateLink} from '../../../../hooks/links/link-hooks.js';
import ModalButtonGroup from '../modal-button-group/modal-button-group.jsx';

/**
 * A modal that allows for the user to add a link
 * @param {boolean} showModal
 * @param {function} setShowModal
 *
 * @return {React.JSX.Element}
 */
const AddLinkModal = ({showModal, setShowModal}) => {
    const {
        mutateAsync: createLink,
        isPending
    } = useCreateLink();

    const initValues = {
        linkText: '',
        linkUrl: ''
    };

    const yupSchema = object().shape({
        linkText: string().required('The Link Text field is required.'),
        linkUrl: string().required('The Link Url field is required.')
    });

    return <Modal
        show={showModal}
        centered
        onHide={() => setShowModal(false)}
    >
        <Modal.Header closeButton>
            <Modal.Title>Add a new link</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <Formik
                initialValues={initValues}
                validationSchema={yupSchema}
                onSubmit={async ({linkText, linkUrl}, formikHelpers) => {
                    formikHelpers.setSubmitting(true);

                    await createLink({
                        link_text: linkText,
                        link_url: linkUrl
                    });

                    formikHelpers.setSubmitting(false);
                    setShowModal(false);
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
                                        Link Text:
                                    </Form.Label>

                                    <Field
                                        as={Form.Control}
                                        className={`rounded-3 border-1 w-100 p-2 ${styles.input_background}`}
                                        type='input'
                                        value={values.linkText}
                                        id='linkText'
                                        name='linkText'
                                        aria-label={`An input field to add the link text.`}
                                    />

                                    {errors.linkText && touched.linkText ? (
                                        <div className={styles.error_text}>{errors.linkText}</div>
                                    ) : null}
                                </Form.Group>
                            </Row>

                            <Row className='mb-3'>
                                <Form.Group controlId='linkUrl'>
                                    <Form.Label
                                        column={true}
                                        className='d-flex flex-column'
                                    >
                                        Link Url:
                                    </Form.Label>

                                    <Field
                                        as={Form.Control}
                                        className={`rounded-3 p-2 border-1 w-100 ${styles.input_background}`}
                                        type='input'
                                        value={values.linkUrl}
                                        name='linkUrl'
                                        aria-label={`An input field to add the link url.`}
                                    />

                                    {errors.linkUrl && touched.linkUrl ? (
                                        <div className={styles.error_text}>{errors.linkUrl}</div>
                                    ) : null}
                                </Form.Group>
                            </Row>

                            <ModalButtonGroup
                                buttonLabel='Add Link'
                                setShowModal={setShowModal}
                                isPending={isPending}
                            />
                        </Form>
                }
            </Formik>
        </Modal.Body>
    </Modal>;
};

AddLinkModal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    setShowModal: PropTypes.func.isRequired
};

export default AddLinkModal;