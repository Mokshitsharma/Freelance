import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('contact')}
        </h1>
        <div className="h-1 w-24 bg-orange-600 rounded-full mx-auto"></div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
          {t('contact_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100 flex items-start gap-6 hover:shadow-md transition-shadow">
            <div className="bg-orange-100 p-4 rounded-2xl text-orange-600 shrink-0">
              <MapPin size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('office_address')}</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {t('office_address_value')}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100 flex items-start gap-6 hover:shadow-md transition-shadow">
            <div className="bg-orange-100 p-4 rounded-2xl text-orange-600 shrink-0">
              <Phone size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact_numbers')}</h3>
              <p className="text-gray-600 leading-relaxed">
                +91-9876543210<br />
                +91-9876543211
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100 flex items-start gap-6 hover:shadow-md transition-shadow">
            <div className="bg-orange-100 p-4 rounded-2xl text-orange-600 shrink-0">
              <Mail size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('email')}</h3>
              <a href="mailto:contact@sarvbrahminsanghtan.in" className="text-orange-600 hover:text-orange-800 font-medium transition-colors">
                contact@sarvbrahminsanghtan.in
              </a>
            </div>
          </div>
        </div>

        {/* WhatsApp Community */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 sm:p-12 shadow-sm border border-green-200 flex flex-col items-center justify-center text-center">
          <div className="bg-green-500 p-6 rounded-full text-white mb-8 shadow-lg">
            <MessageCircle size={64} />
          </div>
          <h2 className="text-3xl font-bold text-green-900 mb-4">{t('join_community')}</h2>
          <p className="text-green-800 text-lg mb-8 font-medium max-w-xs">
            {t('join_community_desc')}
          </p>
          <a 
            href="https://chat.whatsapp.com/example" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-3 w-full justify-center"
          >
            <MessageCircle size={24} />
            {t('whatsapp_group')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
