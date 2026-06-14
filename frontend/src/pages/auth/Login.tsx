import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiCreditCard, FiLogIn } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginThunk, clearError } from '@/store/slices/authSlice';
import styles from './Auth.module.css';

const schema = yup.object({
  employeeId: yup.string().required('Employee ID is required'),
  email: yup.string().email('Valid email required').required('Email is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
  rememberMe: yup.boolean().default(false),
});
type FormData = yup.InferType<typeof schema>;

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector(s => s.auth);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { employeeId: 'EMP001', email: 'admin@company.com', password: 'Password@123', rememberMe: false },
  });

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const onSubmit = async (data: FormData) => {
    await dispatch(loginThunk(data));
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.leftPanel}>
        <div className={styles.brandSection}>
          <div className={styles.logo}>🤖</div>
          <h1 className={styles.brandTitle}>AI Productivity<br />Tracking System</h1>
          <p className={styles.brandDesc}>
            Track AI utilisation across all SDLC activities. Measure effort savings,
            monitor coverage and accuracy, and generate executive-level Excel reports.
          </p>
          <div className={styles.featureList}>
            {['9 SDLC Phase Tracking','Real-time Dashboard Analytics','Excel Report Generation','Jira Integration & Sync','Role-based Access Control'].map(f => (
              <div key={f} className={styles.featureItem}><span>✓</span>{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSubtitle}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label}>Employee ID</label>
              <div className={styles.inputWrap}>
                <FiCreditCard className={styles.inputIcon} />
                <input {...register('employeeId')} className={`${styles.input} ${errors.employeeId ? styles.inputError : ''}`} placeholder="e.g. EMP001" />
              </div>
              {errors.employeeId && <span className={styles.errorMsg}>{errors.employeeId.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrap}>
                <FiMail className={styles.inputIcon} />
                <input {...register('email')} type="email" className={`${styles.input} ${errors.email ? styles.inputError : ''}`} placeholder="you@company.com" />
              </div>
              {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <FiLock className={styles.inputIcon} />
                <input {...register('password')} type="password" className={`${styles.input} ${errors.password ? styles.inputError : ''}`} placeholder="Enter your password" />
              </div>
              {errors.password && <span className={styles.errorMsg}>{errors.password.message}</span>}
            </div>

            <div className={styles.row}>
              <label className={styles.checkLabel}>
                <input {...register('rememberMe')} type="checkbox" className={styles.checkbox} />
                Remember me
              </label>
              <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            </div>

            <button type="submit" disabled={isLoading} className={styles.submitBtn}>
              {isLoading ? <span className={styles.spinner} /> : <FiLogIn />}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className={styles.demoBox}>
            <p className={styles.demoTitle}>🔑 Demo Credentials</p>
            <p className={styles.demoText}>ID: EMP001 &nbsp;|&nbsp; Email: admin@company.com</p>
            <p className={styles.demoText}>Password: Password@123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
