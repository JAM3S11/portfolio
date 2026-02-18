import { Github, Linkedin, Mail, Phone, Send, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Whatsapp from '../assets/whatsapp.svg';

const ContactPage = () => {
    const [result, setResults] = useState("");
    const [status, setStatus] = useState("idle"); // idle, loading, success

    const message = "Hello! Thank you for reaching out. What challenge can I help you solve today? Whether you have a general inquiry or need a system solution, feel free to share.";
    const socialLinks = [
        { name: "Github", icon: <Github size={25} />, url: import.meta.env.VITE_GITHUB_URL },
        { name: "LinkedIn", icon: <Linkedin size={25} />, url: import.meta.env.VITE_LINKEDIN_URL },
        { name: "WhatsApp", icon: <img src={Whatsapp} alt='WhatsApp' className="w-6 h-6 dark:invert" />, url: `${import.meta.env.VITE_WHATSAPP_URL}?text=${encodeURIComponent(message)}` }
    ];

    const handleForm = async (event) => {
        event.preventDefault();
        setStatus("loading");
        setResults("Sending...");

        const formData = new FormData(event.target);
        formData.append("access_key", import.meta.env.VITE_WEB3FORMS_COM_KEY);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setStatus("success");
                setResults("Message sent successfully!");
                event.target.reset();
                setTimeout(() => { setStatus("idle"); setResults(""); }, 5000);
            } else {
                setStatus("idle");
                setResults(data.message);
            }
        } catch (error) {
            setStatus("idle");
            setResults("Something went wrong. Please try again.");
        }
    };

    return (
        <div id='contact' className='bg-white dark:bg-[#19183B] text-gray-300 px-6 py-20 transition-colors duration-300 overflow-hidden'>
            <div className='max-w-4xl mx-auto'>

                {/* Header section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='mb-16'
                >
                    <h3 className='text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2'>
                        Get in touch
                    </h3>
                    <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "240px" }}
                        transition={{ duration: 1 }}
                        className='h-px mb-12 mx-auto bg-linear-to-r from-transparent via-blue-500 to-transparent'
                    ></motion.div>
                </motion.div>

                {/* Contents */}
                <div className='grid md:grid-cols-2 gap-16 items-start'>

                    {/* Left column */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className='space-y-8'
                    >
                        <div>
                            <h4 className='text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4'>
                                Let's Connect
                            </h4>
                            <p className='text-gray-700 dark:text-gray-400 text-lg leading-relaxed max-w-md'>
                                I would love to hear from you and how I could help. Please fill in the form and I'll get back to you as soon as possible.
                            </p>
                        </div>

                        <div className='space-y-4'>
                            {[
                                { icon: <Mail size={25} />, label: "Mail", value: "jdndirangu2020@gmail.com", href: "mailto:jdndirangu2020@gmail.com" },
                                { icon: <Phone size={25} />, label: "Phone", value: "+254 716 041419", href: "tel:+254716041419" }
                            ].map((item, idx) => (
                                <motion.a 
                                    key={idx}
                                    href={item.href}
                                    whileHover={{ x: 10 }}
                                    className='flex items-center gap-4 bg-slate-100 dark:bg-[#111827]/50 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl group transition-all'
                                >
                                    <div className='w-12 h-12 rounded-xl text-blue-500 bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all'>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className='text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400'>
                                            {item.label}
                                        </p>
                                        <p className='font-semibold text-gray-800 dark:text-gray-200'>
                                            {item.value}
                                        </p>
                                    </div>
                                </motion.a>
                            ))}
                        </div>

                        <div className='space-y-3'>
                            <p className='font-bold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                                Connect on social
                            </p>
                            <div className='flex items-center gap-3'>
                                {socialLinks.map((social) => (
                                    <motion.a
                                        key={social.name}
                                        href={social.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        whileHover={{ y: -5, scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className='w-12 h-12 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-400 hover:text-blue-500 hover:border-blue-500/50 flex items-center justify-center shadow-sm transition-colors'
                                    >
                                        {social.icon}
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right hand side form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <form onSubmit={handleForm} className='space-y-4 bg-slate-50 dark:bg-[#111827]/50 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl'>
                            <div className='space-y-4'>
                                {['name', 'email'].map((field) => (
                                    <div key={field}>
                                        <label className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1 capitalize'>
                                            {field === 'name' ? 'Full Name' : 'Email Address'}:
                                        </label>
                                        <input
                                            name={field}
                                            required
                                            type={field === 'email' ? 'email' : 'text'}
                                            placeholder={field === 'name' ? 'John Doe' : 'johndoe@gmail.com'}
                                            className='w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#19183B] border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-800 dark:text-white transition-all'
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1'>Message:</label>
                                    <textarea 
                                        name='message'
                                        required
                                        rows="4" 
                                        placeholder="How can I help you?" 
                                        className='w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#19183B] border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-800 dark:text-white transition-all resize-none'
                                    ></textarea>
                                </div>
                            </div>

                            <motion.button 
                                disabled={status === "loading"}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/25 ${
                                    status === "success" ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
                                } text-white`}
                            >
                                {status === "loading" ? (
                                    <motion.div 
                                        animate={{ rotate: 360 }} 
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    >
                                        <Send size={20} />
                                    </motion.div>
                                ) : status === "success" ? (
                                    <CheckCircle size={20} />
                                ) : (
                                    <Send size={20} />
                                )}
                                {status === "loading" ? "Sending..." : status === "success" ? "Sent!" : "Send Message"}
                            </motion.button>

                            <AnimatePresence>
                                {result && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`text-center text-sm font-medium mt-2 ${status === "success" ? "text-green-500" : "text-blue-500"}`}
                                    >
                                        {result}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;