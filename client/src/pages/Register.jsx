import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (values) => {
    setServerError('');
    setSubmitting(true);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        location: { city: values.city, state: values.state, country: 'India' },
      });
      navigate('/dashboard');
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-2">Create your account</h1>
      <p className="text-ink/50 mb-8">Join Reweave and start swapping instead of shopping.</p>

      {serverError && <div className="mb-6 text-sm bg-red-50 text-thread border border-red-100 rounded-lg px-4 py-3">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1.5">Full name</label>
          <input {...register('name', { required: 'Name is required' })}
            className="w-full border border-moss-100 rounded-lg px-4 py-2.5 focus:border-pine outline-none" />
          {errors.name && <p className="text-xs text-thread mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1.5">Email</label>
          <input type="email" {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
          })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5 focus:border-pine outline-none" />
          {errors.email && <p className="text-xs text-thread mt-1">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">City</label>
            <input {...register('city', { required: 'City is required' })}
              className="w-full border border-moss-100 rounded-lg px-4 py-2.5 focus:border-pine outline-none" />
            {errors.city && <p className="text-xs text-thread mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">State</label>
            <input {...register('state')}
              className="w-full border border-moss-100 rounded-lg px-4 py-2.5 focus:border-pine outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1.5">Password</label>
          <input type="password" {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Must be at least 8 characters' },
            pattern: { value: /^(?=.*[A-Z])(?=.*[0-9]).+$/, message: 'Include an uppercase letter and a number' },
          })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5 focus:border-pine outline-none" />
          {errors.password && <p className="text-xs text-thread mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1.5">Confirm password</label>
          <input type="password" {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === password || 'Passwords do not match',
          })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5 focus:border-pine outline-none" />
          {errors.confirmPassword && <p className="text-xs text-thread mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={submitting}
          className="w-full bg-pine text-paper font-semibold py-3 rounded-full hover:bg-pine-700 transition-colors disabled:opacity-60">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-ink/50 mt-6 text-center">
        Already have an account? <Link to="/login" className="text-pine font-medium hover:underline">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
