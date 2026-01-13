import InfoContent from '../../components/info-content/info-content.jsx';
import SectionStyleWrapper from '../../components/section-style-wrapper/section-style-wrapper.jsx';

/**
 * A general use Section.  Contains a Title, SubTitle, TextContainer, and a yellow honey dipper image.
 *
 * @param  {Section} content - the section content returned from the api
 * @return {React.ReactNode | null}
 */
const info = ({content}) => {
    if (!content || !content?.show_section) return null;

    return (
        <SectionStyleWrapper>
            <InfoContent content={content}/>
        </SectionStyleWrapper>
    );
};

export default info;