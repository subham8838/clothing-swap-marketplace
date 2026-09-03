import React from 'react';

const Loader = ({ full = false, label = 'Loading…' }) => (
  <div className={full ? 'min-h-[60vh] flex items-center justify-center' : 'py-10 flex items-center justify-center'}>
    <div className="flex flex-col items-center gap-3 text-moss-600">
      <div className="w-8 h-8 border-2 border-moss-100 border-t-clay rounded-full animate-spin" />
      <span className="text-sm font-body">{label}</span>
    </div>
  </div>
);

export default Loader;
