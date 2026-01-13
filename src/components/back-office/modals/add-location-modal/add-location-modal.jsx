import {Field, Formik} from 'formik';
import PropTypes from 'prop-types';
import {Form, Modal, Row} from 'react-bootstrap';
import {object, string} from 'yup';

import * as styles from './add-location-modal.module.scss';
import {useCreateLocation} from '../../../../hooks/locations/location-hooks.js';
import {toTitleCase} from '../../../../utils/utils.js';
import ModalButtonGroup from '../modal-button-group/modal-button-group.jsx';

/**
 * A modal that allows the user to add a location
 *
 * @param {boolean} showModal
 * @param {function} setShowModal
 *
 * @return {React.JSX.Element}
 */
const AddLocationModal = ({showModal, setShowModal}) => {
    const {
        mutateAsync: createLocation,
        isPending
    } = useCreateLocation();

    /**
     * @type {CreateLocationContentRequestBody}
     */
    const initValues = {
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        telephone: ''
    };

    const yupSchema = object().shape({
        name: string().required('The Location name field is required.'),
        address: string().required('Street address is required'),
        city: string().test(
            'city-validation',
            'city is required when address is present',
            function (value) {
                const {address} = this.parent;

                if (address) {
                    return value !== undefined && value !== null;
                }

                return true;
            }
        ),
        state: string().test(
            'state-validation',
            'state is required when address is present',
            function (value) {
                const {address} = this.parent;

                if (address) {
                    return value !== undefined && value !== null;
                }

                return true;
            }
        ),
        zip: string().test(
            'zip-validation',
            'zip is required when address is present',
            function (value) {
                const {address} = this.parent;

                if (address) {
                    return value !== undefined && value !== null && value.length === 5;
                }

                return true;
            }
        ),
        telephone: string()
    });

    return <Modal
        show={showModal}
        centered
        onHide={() => setShowModal(false)}
    >
        <Modal.Header closeButton>
            <Modal.Title>Add a new location</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <Formik
                initialValues={initValues}
                validationSchema={yupSchema}
                onSubmit={async (values, formikHelpers) => {
                    formikHelpers.setSubmitting(true);

                    await createLocation(values);

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
                            {
                                Object.entries(values).map(
                                    ([key,]) => {
                                        return <Row className='mb-3' key={key}>
                                            <Form.Group>
                                                <Form.Label
                                                    column={true}
                                                    className='d-flex flex-column'
                                                >
                                                    {`${toTitleCase(key)}:`}
                                                </Form.Label>

                                                <Field
                                                    as={Form.Control}
                                                    className={`rounded-3 border-1 w-100 p-2 ${styles.input_background}`}
                                                    type={key === 'lng' || key === 'lat' ? 'number' : 'input'}
                                                    name={`${key}`}
                                                    id={`${key}`}
                                                    aria-label={`An input field to add the location's ${key}.`}
                                                />

                                                {errors[`${key}`] && touched[`${key}`] ? (
                                                    <div className={styles.error_text}>{errors[`${key}`]}</div>
                                                ) : null}
                                            </Form.Group>
                                        </Row>;
                                    })
                            }

                            <ModalButtonGroup
                                buttonLabel='Create Location'
                                setShowModal={setShowModal}
                                isPending={isPending}
                            />
                        </Form>
                }
            </Formik>
        </Modal.Body>
    </Modal>;
};

AddLocationModal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    setShowModal: PropTypes.func.isRequired
};

export default AddLocationModal;