import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', category: 'General Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate real submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 select-none">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Contact & Community Support</h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Have feedback on the risk gatekeeper, feature suggestions, or questions regarding the curriculum? We'd love to hear from you.
        </p>
      </div>

      <div className="bg-[#0c121f] border border-[#1b253b] rounded-3xl p-8 sm:p-10 shadow-2xl">
        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Message Received!</h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Thank you for reaching out to the TradeSphere AI engineering team. We review student and community feedback regularly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({ name: '', email: '', category: 'General Inquiry', message: '' });
              }}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1.5">Your Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1.5">Email Address:</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1.5">Category:</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option>General Inquiry</option>
                <option>Risk Engine Feedback</option>
                <option>Options Greeks Bug Report</option>
                <option>Curriculum / Academy Suggestion</option>
                <option>Open Source Contribution</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1.5">Your Message:</label>
              <textarea
                required
                rows={5}
                placeholder="Share your experience with the platform or suggest a new feature..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending Feedback...' : 'Submit Message'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
