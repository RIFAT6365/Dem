import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useRestaurant();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Your message has been sent to our guest relation team!');
  };

  return (
    <div className="py-12 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#07131A] text-xs font-bold uppercase tracking-wider mb-2 border border-[#F5B51B]/40">
          <MessageSquare className="w-3.5 h-3.5 text-[#E9A817]" />
          <span>Get in Touch</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#17191C]">
          Contact Our Hospitality Team
        </h1>
        <p className="text-xs sm:text-sm text-[#686B70] mt-2">
          Have an inquiry regarding private catering, celebration reservations, or delivery feedback? We are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info & Hours */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-[#E9E9E5] shadow-sm space-y-6">
            <h3 className="font-serif text-2xl font-bold text-[#17191C]">
              Direct Contact Channels
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#E9A817] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-500">Phone Numbers</span>
                  <a href={`tel:${settings.phone}`} className="text-sm font-bold text-gray-900 hover:text-[#E9A817]">
                    {settings.phone}
                  </a>
                  <span className="block text-[11px] text-gray-500 mt-0.5">Hotline for orders & table bookings</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#E9A817] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-500">Email Address</span>
                  <a href={`mailto:${settings.email}`} className="text-sm font-bold text-gray-900 hover:text-[#E9A817]">
                    {settings.email}
                  </a>
                  <span className="block text-[11px] text-gray-500 mt-0.5">Corporate events & queries</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#E9A817] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-500">Restaurant Location</span>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{settings.address}</p>
                  <span className="block text-[11px] text-gray-500 mt-0.5">Free valet parking available</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#E9A817] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-500">Dining Hours</span>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{settings.openingHours}</p>
                  <span className="block text-[11px] text-gray-500 mt-0.5">Kitchen accepts orders till 10:45 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map card */}
          <div className="rounded-3xl overflow-hidden border border-[#E9E9E5] bg-gray-900 shadow-sm relative h-64 group">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
              alt="Restaurant location map"
              className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-[#07131A]/50 flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-xl animate-bounce mb-2">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-base">{settings.restaurantName}</h4>
              <p className="text-xs text-gray-300 max-w-xs mt-1">{settings.address}</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="mt-3 px-4 py-1.5 rounded-lg bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817] transition-all"
              >
                Open Google Maps Navigation
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E9E9E5] shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-[#17191C] mb-2">
              Send Us a Message
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Fill out the form below and our manager will reply within 24 hours.
            </p>

            {submitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-emerald-900">Message Received!</h4>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  Thank you for reaching out to {settings.restaurantName}. We have logged your request and our team will get in touch with you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Asif Mahmud"
                      required
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. asif@example.com"
                      required
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1700 000000"
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Inquiry Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] bg-white"
                    >
                      <option value="">Select a topic</option>
                      <option value="Table Reservation">Table Reservation Question</option>
                      <option value="Private Event">Catering & Private Event</option>
                      <option value="Delivery Feedback">Online Delivery Feedback</option>
                      <option value="General Question">General Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    required
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
