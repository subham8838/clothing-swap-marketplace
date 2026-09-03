import React from 'react';
import { Link } from 'react-router-dom';
import { Shirt } from 'lucide-react';

const Footer = () => (
  <footer className="bg-pine text-paper/80 mt-24">
    <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
      <div>
        <div className="flex items-center gap-2 font-display text-lg text-paper mb-3">
          <Shirt size={20} strokeWidth={1.75} />
          Reweave
        </div>
        <p className="text-sm text-paper/60 max-w-xs">
          A barter marketplace for clothes that still have a life left in them. No money, just fair trades.
        </p>
      </div>
      <div>
        <h4 className="font-display text-paper mb-3">Explore</h4>
        <ul className="space-y-2 text-sm text-paper/60">
          <li><Link to="/listings" className="hover:text-paper">Browse listings</Link></li>
          <li><Link to="/register" className="hover:text-paper">Create an account</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-display text-paper mb-3">Community</h4>
        <ul className="space-y-2 text-sm text-paper/60">
          <li>Sustainability</li>
          <li>Swap fairness</li>
          <li>Trust &amp; safety</li>
        </ul>
      </div>
      <div>
        <h4 className="font-display text-paper mb-3">Reweave</h4>
        <p className="text-sm text-paper/50">Every swap is a garment kept out of landfill.</p>
      </div>
    </div>
    <div className="stitch-divider text-clay/40" />
    <div className="max-w-7xl mx-auto px-6 py-5 text-xs text-paper/40">© {new Date().getFullYear()} Reweave. All rights reserved.</div>
  </footer>
);

export default Footer;
