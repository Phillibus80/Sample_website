import {Placeholder} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

import * as styles from './loading-skeleton.module.scss';

const LoadingSkeleton = () => {
    return (
        <Container className='vh-100'>
            {/* Navbar Skeleton */}
            <Navbar
                expand='lg'
                className={`bg-body-tertiary rounded-bottom shadow-sm ${styles.navi_background} ${styles.onTop} placeholder-wave`}
            >
                <Container>
                    <Placeholder animation='wave' className='w-100'>
                        <Placeholder xs={3} className='me-3' style={{height: '40px'}}/>
                        <Placeholder xs={2} className='me-2'/>
                        <Placeholder xs={2} className='me-2'/>
                        <Placeholder xs={2}/>
                    </Placeholder>
                </Container>
            </Navbar>

            {/* Carousel Skeleton */}
            <div className={`mb-1 shadow-sm ${styles.carousel} placeholder-wave`}>
                <Placeholder animation='wave' className='w-100 h-100 d-block'>
                    <Placeholder
                        xs={12}
                        className='bg-secondary p-0 m-0'
                        style={{height: '100%', minHeight: '500px'}}
                    />
                </Placeholder>
            </div>

            <div className='spinner-border text-primary mt-5' role='status'>
                <span className='visually-hidden'>Loading...</span>
            </div>
        </Container>
    );
};

export default LoadingSkeleton;