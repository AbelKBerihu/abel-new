/*
# Add WhatsApp URL setting

Adds a whatsapp_url row to site_settings so the owner can configure
their WhatsApp link from the admin panel.
*/

INSERT INTO public.site_settings (key, value)
VALUES ('whatsapp_url', 'https://wa.me/251912345678')
ON CONFLICT (key) DO NOTHING;