import {useEffect} from 'react';

import {Field, Form, Formik} from 'formik';
import {Col, Container, FormControl, Row, Spinner} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import {useNavigate} from 'react-router';
import * as Yup from 'yup';

import styles from './Login.module.scss';
import AppToast from '../../components/app-toast/app-toast.jsx';
import HexPattern from '../../components/hex-pattern/hex-pattern.jsx';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {useAuth, useLogin} from '../../hooks/auth/auth-hooks.js';
import {useToastContext} from '../../hooks/context/context-hooks.jsx';
import Header from '../../sections/header/header.jsx';

const Login = () => {
    const {showToast, setShowToast, toastMessage, toastType} = useToastContext();
    const navigate = useNavigate();
    const {login: authLogin, isAuthenticated} = useAuth();

    const {
        mutateAsync: loginMutate,
        data: loginData,
        isSuccess: loginSuccess,
        isError: loginError,
        error: loginErrorData
    } = useLogin();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(ROUTING_CONSTANTS.ADMIN.URL, {replace: true});
        }
    }, [isAuthenticated, navigate]);

    // Handle successful login
    useEffect(() => {
        if (loginSuccess && loginData?.data) {
            const {token, username, role} = loginData.data;

            const loginSuccessful = authLogin(token, username, role);

            if (loginSuccessful) {
                navigate(ROUTING_CONSTANTS.ADMIN.URL, {
                    state: loginData.data,
                    replace: true
                });
            }
        }
    }, [loginSuccess, loginData, authLogin, navigate]);

    // Handle login errors
    useEffect(() => {
        if (loginError) {
            console.error('Login error:', loginErrorData);
        }
    }, [loginError, loginErrorData]);

    const submitLoginForm = async (values) => {
        try {
            await loginMutate(values);
        } catch (error) {
            console.error('Login submission error:', error);
        }
    };

    const initValues = {
        user_name: '',
        password: ''
    };

    const loginSchema = Yup.object().shape({
        user_name: Yup.string()
            .max(50, 'Please keep your name to only 50 characters.')
            .required('User name is required.'),
        password: Yup.string()
            .max(50, 'Please keep your password to only 50 characters.')
            .required('Password is required.')
    });

    return (
        <>
            <AppToast
                showToast={showToast}
                setShowToast={setShowToast}
                toastMessage={toastMessage}
                variant={toastType}
            />

            <Container className={`vh-100 w-75 ${styles.login}`}>
                <Header pageName={ROUTING_CONSTANTS.HOME.LABEL}/>

                <h1>
                    Login Screen
                </h1>

                <Formik
                    initialValues={initValues}
                    onSubmit={submitLoginForm}
                    validationSchema={loginSchema}
                >
                    {({
                          isSubmitting,
                          isValid,
                          errors,
                          touched
                      }) => (
                        <>
                            <div className={`position-relative`}>
                                <div className={`position-absolute ${styles.login_form_background}`}>
                                    <HexPattern rows={4}/>
                                </div>
                            </div>
                            <Form className={`overflow-hidden p-4 ${styles.login_form}`}>
                                <Row className={`z-2 ${styles.container_section}`}>
                                    <Col
                                        className='gap-0 d-flex flex-column overflow-hidden'
                                        sm={12}
                                        md={6}
                                    >
                                        <label
                                            className='text-white fw-bold text-start'
                                            htmlFor='user_name'
                                            id='user_name_label'
                                        >
                                            Username:
                                        </label>

                                        <Field
                                            className='z-3'
                                            as={FormControl}
                                            type='input'
                                            id='user_name'
                                            name='user_name'
                                            placeholder='username'
                                            aria-labelledby='user_name'
                                        />

                                        {errors['user_name'] && touched[`user_name`] ? (
                                            <div className={styles.error_message}>{errors[`user_name`]}</div>
                                        ) : null}
                                    </Col>


                                    <Col
                                        className='gap-0 d-flex flex-column mt-3 mt-md-0'
                                        sm={12}
                                        md={6}
                                    >
                                        <label
                                            className='text-white fw-bold text-start'
                                            htmlFor='password'
                                            id='password_label'
                                        >
                                            Password:
                                        </label>

                                        <Field
                                            as={FormControl}
                                            type='password'
                                            id='password'
                                            name='password'
                                            placeholder='password'
                                            aria-labelledby='password_label'
                                        />

                                        {errors['password'] && touched[`password`] ? (
                                            <div className={styles.error_message}>{errors[`password`]}</div>
                                        ) : null}
                                    </Col>
                                </Row>

                                <Button
                                    className={`z-3 ${styles.form_button}`}
                                    type='submit'
                                    disabled={isSubmitting || !isValid}
                                    aria-label={
                                        isSubmitting || !isValid
                                            ? 'The submit button is currently disabled'
                                            : 'Submit your login credentials'
                                    }
                                >
                                    <span><b>Submit</b></span>
                                    {
                                        isSubmitting &&
                                        <Spinner className='ms-3' animation='border' role='status'/>
                                    }
                                </Button>
                            </Form>
                        </>
                    )}
                </Formik>

            </Container>
        </>
    );
};

export default Login;