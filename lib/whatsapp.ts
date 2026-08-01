export const DEFAULT_PROMO_WHATSAPP_MESSAGE = "Hello, I'm interested in your promoted item.";

export const buildWhatsAppLink = (phoneNumber: string, message: string = DEFAULT_PROMO_WHATSAPP_MESSAGE): string => {
    const digitsOnly = phoneNumber.replace(/[^\d]/g, '');
    // Nigerian local numbers (0XXXXXXXXXX) need the country code for wa.me to resolve correctly.
    const normalised = digitsOnly.startsWith('0') ? `234${digitsOnly.slice(1)}` : digitsOnly;
    return `https://wa.me/${normalised}?text=${encodeURIComponent(message)}`;
};
