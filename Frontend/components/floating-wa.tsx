import React from "react";

export const WHATSAPP_NUMBER = "6285805566344";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat via WhatsApp"
      title="Chat via WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
    >
      <i className="fa-brands fa-whatsapp text-3xl sm:text-4xl" aria-hidden="true" />
    </a>
  );
}
