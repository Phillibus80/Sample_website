import {useFormikContext} from 'formik';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import {GrSubtractCircle} from 'react-icons/gr';

import * as styles from './create-page.module.scss';
import OfficeCreatePageContent from './office-create-page-content.jsx';
import {useGetSections} from '../../../../hooks/sections/section-hooks.jsx';

/**
 * @param {Array<{sectionKey: number}>} sections - the sections that currently added to the newly created page
 * @param {function} updateSectionList
 * @return {Array<React.ReactNode>|null}
 */
const OfficeCreatePageContentList = ({sections, updateSectionList}) => {
    const {
        data: sectionData, isSuccess: sectionSuccess
    } = useGetSections();
    const {setFieldValue} = useFormikContext();

    if (!sections || sections.length < 1 || !sectionSuccess || !sectionData?.data) return null;

    return sections.map(({sectionKey}) => (<Container
        key={sectionKey}
        className={`d-flex align-items-center`}
    >
        <div className='w-100'>
            <OfficeCreatePageContent
                contentNumber={sectionKey}
                sectionData={sectionData.data ?? {count: 0, data: []}}
                sectionsCallSuccess={sectionSuccess}
            />
        </div>

        {sections.length > 1 && <GrSubtractCircle
            className={`ms-3 ${styles.subtractCircle}`}
            style={{fontSize: '1.5rem'}}
            onClick={() => {
                setFieldValue(`sectionSelection${sectionKey}`, '')
                    .then(() =>
                        updateSectionList(prev => prev.filter(({sectionKey: prevKey}) => prevKey !== sectionKey))
                    );
            }}
        />}
    </Container>));
};

OfficeCreatePageContentList.propTypes = {
    sections: PropTypes.arrayOf(PropTypes.shape({
        sectionKey: PropTypes.number.isRequired
    })).isRequired,
    updateSectionList: PropTypes.func.isRequired
};

export default OfficeCreatePageContentList;