import {sectionContentPropType} from '../../common/commonPropTypes.jsx';
import HeroCarousel from '../../components/galleries/hero-carousel/hero-carousel.jsx';

/**
 * The hero section
 *
 * @param {Section} content
 * @return {React.ReactNode|null}
 */
const hero = ({content}) => {
    if (!content || !content?.show_section) return null;

    return (
        <section className='shadow-sm'>
            <HeroCarousel content={content}/>
        </section>
    );
};

hero.propTypes = sectionContentPropType;

export default hero;

