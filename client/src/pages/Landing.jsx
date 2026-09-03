import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Repeat, Search, MessageSquareText, Handshake, Leaf } from 'lucide-react';
import * as clothingService from '../services/clothingService';
import ClothingCard from '../components/ClothingCard';
import Loader from '../components/Loader';

const STEPS = [
  { icon: Search, title: 'List what you don&rsquo;t wear', text: 'Photograph a piece you&rsquo;ve outgrown and set its estimated swap value.' },
  { icon: Handshake, title: 'Offer one of yours', text: 'Browse the wardrobe of someone nearby and offer an item in return.' },
  { icon: MessageSquareText, title: 'Negotiate the details', text: 'Chat in real time, revise the proposal, and settle on a fair trade.' },
  { icon: Repeat, title: 'Swap, not shop', text: 'Meet up or ship, mark the swap complete, and rate each other.' },
];

const Landing = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clothingService.getClothingList({ limit: 8, sort: 'newest' })
      .then(({ data }) => setFeatured(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-pine text-paper">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs tracking-[0.2em] uppercase text-clay font-semibold mb-5">Barter-based fashion</span>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mb-6">
              Your closet has<br />someone else&rsquo;s<br /><span className="text-clay">next favourite piece.</span>
            </h1>
            <p className="text-paper/70 text-lg max-w-md mb-8">
              Reweave is a swap marketplace — trade clothes you&rsquo;ve outgrown for ones you&rsquo;ll actually wear. No money changes hands, just fair exchanges.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/listings" className="bg-clay text-pine font-semibold px-6 py-3.5 rounded-full hover:bg-clay-600 transition-colors flex items-center gap-2">
                Browse Listings <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="border border-paper/30 px-6 py-3.5 rounded-full hover:bg-paper/10 transition-colors">
                Start Swapping
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-2xl bg-moss-500/30 border border-paper/10" />
              <div className="aspect-[3/4] rounded-2xl bg-clay/30 border border-paper/10 mt-8" />
            </div>
          </div>
        </div>
        <div className="stitch-divider text-clay/50" />
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl text-ink mb-2">How swapping works</h2>
        <p className="text-ink/50 mb-12 max-w-xl">Four steps between a garment you&rsquo;ve stopped wearing and one you&rsquo;ll reach for constantly.</p>
        <div className="grid md:grid-cols-4 gap-8">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="relative pl-1">
              <div className="w-11 h-11 rounded-full bg-moss-100 flex items-center justify-center text-pine mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-display text-lg text-ink mb-1.5">{title}</h3>
              <p className="text-sm text-ink/50 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sustainability stats */}
      <section className="bg-moss-50 border-y border-moss-100">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <Leaf className="mx-auto text-moss-600 mb-2" size={28} />
            <div className="font-display text-4xl text-pine">12,400+</div>
            <p className="text-sm text-ink/50 mt-1">Garments swapped, not discarded</p>
          </div>
          <div>
            <Leaf className="mx-auto text-moss-600 mb-2" size={28} />
            <div className="font-display text-4xl text-pine">8.6 tonnes</div>
            <p className="text-sm text-ink/50 mt-1">Estimated textile waste avoided</p>
          </div>
          <div>
            <Leaf className="mx-auto text-moss-600 mb-2" size={28} />
            <div className="font-display text-4xl text-pine">30+ cities</div>
            <p className="text-sm text-ink/50 mt-1">Active swap communities across India</p>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl text-ink">Freshly listed</h2>
            <p className="text-ink/50 mt-1">Recently added pieces looking for a new home.</p>
          </div>
          <Link to="/listings" className="text-sm font-medium text-pine hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? <Loader /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((item) => <ClothingCard key={item._id} item={item} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-pine rounded-3xl px-10 py-16 text-center text-paper">
          <h2 className="font-display text-3xl md:text-4xl mb-4">Ready to lighten your closet?</h2>
          <p className="text-paper/60 max-w-lg mx-auto mb-8">List your first item in under five minutes and start browsing swaps in your city today.</p>
          <Link to="/register" className="bg-clay text-pine font-semibold px-7 py-3.5 rounded-full inline-flex items-center gap-2 hover:bg-clay-600 transition-colors">
            Create your account <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
