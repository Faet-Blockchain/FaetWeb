/* eslint-disable @next/next/no-img-element */
"use client";

import React /*, { useState }*/ from "react";
import { motion } from "framer-motion";

const CommunitySection: React.FC = () => {
  /*
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const recaptchaToken = await window.grecaptcha.execute(
        "6LfUn2IrAAAAAOe0xfIsiXgdnQ3FaApkJORBh68E",
        { action: "submit_form" }
      );
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "faetstudio@faet.io",
          subject: \`FAET WEBSITE INQUIRY: \${formData.name}; (\${formData.email})\`,
          text: formData.message,
          recaptchaToken,
        }),
      });
      if (response.ok) {
        setSuccessMessage("Your message has been sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        const data = await response.json();
        alert("Failed to send the message: " + data.message);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send the message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  */

  return (
    <section id="contact" className="py-20 md:py-32 bg-[#CED6AE]/80 w-full">
      <div className="max-w-6xl mx-auto px-3">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Column */}
          <div className="w-full md:w-1/2">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: "easeInOut" }}
              className="text-black mb-6 text-5xl md:text-7xl font-nocturne-serif-bold"
            >
              Community
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: "easeInOut" }}
              className="text-neutral-800 mb-8"
            >
              Join our vibrant community of developers, designers, and tech enthusiasts. Share ideas, get support, and collaborate on exciting projects.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex space-x-4 h-10 w-auto"
            >
              <a href="https://discord.gg/t88HmN52Nd" target="_blank">
                <img src="/images/discord2.png" alt="discord" />
              </a>
              <a href="https://x.com/FaetStudio" target="_blank">
                <img src="/images/X.png" alt="X" />
              </a>
            </motion.div>
          </div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeInOut" }}
            className="w-full md:w-1/2"
          >
            {/*
            <h3 className="text-2xl font-semibold mb-6 font-nocturne-serif-bold text-black">
              Contact Us
            </h3>

            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="form-textarea"
                  required
                />
              </div>
              <button type="submit" className="form-button" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
            {successMessage && <p className="text-green-600 mt-4">{successMessage}</p>}
            */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
