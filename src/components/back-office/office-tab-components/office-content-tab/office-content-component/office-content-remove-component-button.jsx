import PropTypes from 'prop-types';
import {Spinner} from 'react-bootstrap';
import {GrSubtractCircle} from 'react-icons/gr';

import {useRemoveComponent} from '../../../../../hooks/components/component-hooks.jsx';
import * as styles from '../office-content.module.scss';


/**
 * A button wrapper component that isolates the spinner and action for
 * removing a component from the application.
 *
 * @param {number} componentId
 * @return {React.JSX.Element}
 */
const OfficeContentRemoveComponentButton = ({componentId}) => {
    const {
        mutateAsync: removeComponent,
        isPending
    } = useRemoveComponent();

    return isPending
        ? <Spinner
            className='mt-5 ms-3'
            style={{color: 'blue'}}
            animation='border'
            role='status'
        />
        : <GrSubtractCircle
            className={`mt-5 ms-3 ${styles.subtractCircle}`}
            style={{fontSize: '1.5rem'}}
            onClick={async () => removeComponent({id: componentId})}
        />;
};

OfficeContentRemoveComponentButton.propTypes = {
    componentId: PropTypes.number.isRequired
};

export default OfficeContentRemoveComponentButton;