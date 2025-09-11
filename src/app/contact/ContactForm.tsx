"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const [modal, setModal] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        setModal({
          open: true,
          type: "success",
          message: "Thank you! Your message has been sent successfully.",
        });
        reset();
      } else {
        setModal({
          open: true,
          type: "error",
          message: result.error + "❌ ",
        });
      }
    } catch (err) {
      setModal({
        open: true,
        type: "error",
        message: "Failed to send message. Please try again later.",
      });
    }
  };

  return (
    <div className="font-sans text-gray-900">

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-28 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Contact ToolQS
          </h1>
          <p className="text-lg md:text-xl text-gray-200">
            Have a question, feedback, or partnership idea? We’d love to hear
            from you. Fill out the form below or reach out directly.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">

          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              How We Can Help
            </h2>
            <p className="text-gray-600 mb-6">
              Whether you’re a student using our academic tools, a professional
              optimizing documents, or a business looking for collaborations —
              ToolQS is here to support you.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li>
                <b>Support:</b> Report issues or get help using our tools. 📧
              </li>
              <li>
                <b>Feedback:</b> Share ideas and suggestions to improve ToolQS. 💡
              </li>
              <li>
                <b>Business:</b> Reach out for partnerships and collaborations. 🤝
              </li>
            </ul>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Your Name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  rows={5}
                  {...register("message", { required: "Message is required" })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Write your message..."
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg font-semibold shadow hover:shadow-lg transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
            <p
              className={`text-lg font-medium ${
                modal.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {modal.message}
            </p>
            <button
              onClick={() => setModal({ ...modal, open: false })}
              className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow hover:shadow-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
