import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FiArrowLeft, FiMail } from 'react-icons/fi';
import styles from './Auth.module.css';

const schema = yup.object({ email: yup.string().email('Valid email required').required('Email required') });

const ForgotPassword: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data: { email: string }) => {
    await new Promise(r => setTimeout(r, 1200));
    setEmail(data.email);
    setSubmitted(true);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.leftPanel}>
        <div className={styles.brandSection}>
          <div className={styles.logo}>🔑</div>
          <h1 className={styles.brandTitle}>Reset Your Password</h1>
          <p className={styles.brandDesc}>Enter your email address and we'll send you instructions to reset your password.</p>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          {submitted ? (
            <>
              <div className={styles.successIcon}>📧</div>
              <h2 className={styles.successTitle}>Check Your Email</h2>
              <p className={styles.successMsg}>
                We've sent password reset instructions to <strong>{email}</strong>.
                Check your inbox and follow the link.
              </p>
              <Link to="/login">
                <button className={styles.submitBtn} style={{ width: '100%' }}>Back to Login</button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.forgotBack}><FiArrowLeft /> Back to Login</Link>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Forgot Password?</h2>
                <p className={styles.formSubtitle}>Enter your email and we'll send reset instructions.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Email Address</label>
                  <div className={styles.inputWrap}>
                    <FiMail className={styles.inputIcon} />
                    <input {...register('email')} type="email" className={`${styles.input} ${errors.email ? styles.inputError : ''}`} placeholder="you@company.com" />
                  </div>
                  {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
                </div>
                <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                  {isSubmitting ? <span className={styles.spinner} /> : <FiMail />}
                  {isSubmitting ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
