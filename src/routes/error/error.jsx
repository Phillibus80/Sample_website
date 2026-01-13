import * as styles from './error.module.scss';
import HexPattern from '../../components/hex-pattern/hex-pattern.jsx';
import Header from '../../sections/header/header.jsx';

const Error = () => {
    return (
        <div className={`position-relative overflow-hidden vh-100 w-100 bg-dark`}>
            <Header pageName='home'/>
            <div className={`position-absolute h-100 ${styles.hex_background}`}>
                <div className='position-relative'>
                    <HexPattern rows={6}/>
                </div>
            </div>

            <section className='mt-5 justify-content-center h-100'>
                <p className='text-white fw-bold col-12' style={{fontSize: '18pt'}}>An error occurred.</p>
                <p className='text-white fw-bold' style={{fontSize: '18pt'}}>Try refreshing the page or coming back
                    later.</p>
            </section>
        </div>
    );
};

export default Error;