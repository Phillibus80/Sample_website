import * as styles from './not-found.module.scss';
import HexPattern from '../../components/hex-pattern/hex-pattern.jsx';
import Header from '../../sections/header/header.jsx';

const NotFound = () => {
    return (
        <div className={`position-relative overflow-hidden vh-100 w-100 bg-dark`}>
            <Header pageName='home'/>
            <div className={`position-absolute h-100 ${styles.hex_background}`}>
                <div className='position-relative'>
                    <HexPattern rows={6}/>
                </div>
            </div>

            <section className='mt-5 justify-content-center h-100'>
                <span className='text-white fw-bold' style={{fontSize: '20pt'}}>
                    Page Not Found.
                </span>
            </section>
        </div>
    );
};

export default NotFound;