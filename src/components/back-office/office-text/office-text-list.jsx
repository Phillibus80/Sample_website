import PropTypes from 'prop-types';

import OfficeText from './office-text.jsx';
import {textComponentPropType} from '../../../common/commonPropTypes.jsx';
import {COMPONENTS} from '../../../constants/app-constants.js';
import {PLACEHOLDER_TEXT, ROLES} from '../../../constants/constants.js';
import {useAuth} from '../../../hooks/auth/use-auth.jsx';
import OfficeAdditionButton from '../office-addition-button/office-addition-button.jsx';

/**
 * A utility function that takes the component response object and creates a list of
 * text field components: a typical text field and/or text area.
 *
 * @param {Component} component
 * @param {function} handleClick - Async call to create a new text content in the current page/section/component
 * @param {number} componentContentId - the page section component id
 * @param {string} [prefix] - Optional, can be added to the beginning of field names to namespace Fields
 *
 * @return {Array<React.ReactNode> || React.ReactNode}
 */
const OfficeTextList = ({component, handleClick, componentContentId, prefix = ''}) => {
    const {roles} = useAuth();

    const hasSuperPermissions = roles.includes(ROLES.SUPER);
    const hasAdminPermissions = roles.includes(ROLES.ADMIN);
    const isComponentBenefitsList = component.component_name === COMPONENTS.BENEFITS_LIST;

    if (!component?.textContent && hasSuperPermissions) {
        return <OfficeAdditionButton
            txt='Add text content'
            handleOnClick={async () => {
                const requestBody = {
                    text_content: PLACEHOLDER_TEXT
                };

                await handleClick({componentContentId: componentContentId, requestBody: requestBody});
            }}
        />;
    }

    return <div>
        {
            component?.textContent?.map(
                (tc) => <div key={tc.component_content_id}>
                    <OfficeText
                        componentName={component.component_name}
                        fieldName={`text_${tc.component_content_id}`}
                        textComponent={tc}
                        prefix={prefix}
                        hideDeleteButton={!hasSuperPermissions && component?.textContent?.length < 2}
                    />
                </div>
            )
        }
        {((hasSuperPermissions || hasAdminPermissions) && isComponentBenefitsList)
            && <OfficeAdditionButton
                txt='Add text content'
                handleOnClick={async () => {
                    const requestBody = {
                        text_content: PLACEHOLDER_TEXT
                    };

                    await handleClick({componentContentId: componentContentId, requestBody: requestBody});
                }}
            />
        }
    </div>;
};

OfficeTextList.propTypes = {
    component: PropTypes.shape({
        component_name: PropTypes.string.isRequired,
        textContent: PropTypes.arrayOf(textComponentPropType)
    }).isRequired,
    handleClick: PropTypes.func.isRequired,
    componentContentId: PropTypes.number.isRequired,
    prefix: PropTypes.string
};

export default OfficeTextList;