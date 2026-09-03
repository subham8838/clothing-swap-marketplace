import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (values) => {
    setServerError('');
    setSubmitting(true);
    try {
      await login(values);
      navigate(location.state?.from?.pathname || '/dashboard');
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-display text-3xl text-ink mb-2">Welcome back</h1>
      <p className="text-ink/50 mb-8">Log in to see your swaps and messages.</p>

      {serverError && <div className="mb-6 text-sm bg-red-50 text-thread border border-red-100 rounded-lg px-4 py-3">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1.5">Email</label>
          <input type="email" {...register('email', { required: 'Email is required' })}
            className="w-full border border-moss-100 rounded-lg px-4 py-2.5 focus:border-pine outline-none" />
          {errors.email && <p className="text-xs text-thread mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1.5">Password</label>
          <input type="password" {...register('password', { required: 'Password is required' })}
            className="w-full border border-moss-100 rounded-lg px-4 py-2.5 focus:border-pine outline-none" />
          {errors.password && <p className="text-xs text-thread mt-1">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={submitting}
          className="w-full bg-pine text-paper font-semibold py-3 rounded-full hover:bg-pine-700 transition-colors disabled:opacity-60">
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="mt-6 text-xs text-ink/40 bg-moss-50 border border-moss-100 rounded-lg px-4 py-3">
        Demo user: user@example.com / User@12345<br />
        Demo admin: admin@example.com / Admin@12345
      </div>

      <p className="text-sm text-ink/50 mt-6 text-center">
        New to Reweave? <Link to="/register" className="text-pine font-medium hover:underline">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;
