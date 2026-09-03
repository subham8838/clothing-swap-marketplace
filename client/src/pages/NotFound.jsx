import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="max-w-lg mx-auto px-6 py-32 text-center">
    <h1 className="font-display text-5xl text-pine mb-4">404</h1>
    <p className="text-ink/50 mb-8">This page seems to have been swapped away.</p>
    <Link to="/" className="bg-pine text-paper px-6 py-3 rounded-full font-semibold hover:bg-pine-700">Back home</Link>
  </div>
);

export default NotFound;
