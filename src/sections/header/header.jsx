import {sectionContentPropType} from '../../common/commonPropTypes.jsx';
import Navi from '../../components/navi/navi.jsx';
import {SECTIONS} from '../../constants/app-constants.js';
import {useGetPageContent} from '../../hooks/api-hooks.js';

/**
 * The Header section which is a reusable component.
 *
 * @param {boolean} detachFromResponse - ignores the content.show_section flag when true
 * @param {string} pageName - allows for different links per page basis.  If left empty, it simply assumes 'home'
 * @return {React.ReactNode|null}
 */
const Header = ({detachFromResponse = false, pageName = 'home'}) => {
    const {data} = useGetPageContent(pageName);

    const content = data?.data?.sections?.find(({section_name}) => section_name === SECTIONS.HEADER);

    if (!content?.show_section && !detachFromResponse) return null;

    return <Navi headerContent={content}/>;
};

Header.propTypes = sectionContentPropType;

export default Header;