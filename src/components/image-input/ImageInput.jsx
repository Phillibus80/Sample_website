import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import {Container, Row} from 'react-bootstrap';

import styles from './ImageInput.module.scss';

/**
 *
 * @param field
 * @param form
 * @param label
 * @param disabled
 * @return {React.ReactNode}
 */
const ImageInput = ({field, form, label = '', disabled}) => {
    const {setFieldValue} = useFormikContext();

    return <Container>
        {label}
        <Row className={styles.sectionWrapper}>
            <input
                disabled={disabled}
                id={field.name}
                name={field.name}
                className={`${disabled ? styles.disabledField : styles.customFileInput}`}
                type='file'
                onChange={async (event) => {
                    await setFieldValue(field.name, event.currentTarget.files[0]);
                }}
            />
        </Row>

        <Row className={styles.sectionWrapper}>
            {form.touched[field.name] && form.errors[field.name] && (
                <div className={styles.error_text}>
                    {form.errors[field.name]}
                </div>
            )}
        </Row>
    </Container>;
};

ImageInput.propTypes = {
    disabled: PropTypes.bool,
    field: PropTypes.shape({
        name: PropTypes.string
    }),
    form: PropTypes.object,
    label: PropTypes.string,
    setFieldValue: PropTypes.func
};

export default ImageInput;