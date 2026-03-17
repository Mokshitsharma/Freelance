import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Target, Heart, Shield } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('about')}
        </h1>
        <div className="h-1 w-24 bg-orange-600 rounded-full mx-auto"></div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
          {t('app_name')} - {t('hero_subtitle')}
        </p>
      </div>

      {/* Mission Section */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-orange-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
            <Target size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t('mission')}</h2>
        </div>
        <div className="prose prose-lg text-gray-700 max-w-none space-y-6">
          <p className="text-lg leading-relaxed">
            {t('about_mission_p1')}
          </p>
          <p className="text-lg leading-relaxed">
            {t('about_mission_p2')}
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 text-center">
          <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{t('unity')}</h3>
          <p className="text-gray-600">{t('unity_desc')}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 text-center">
          <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600">
            <Heart size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{t('support')}</h3>
          <p className="text-gray-600">{t('support_desc')}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 text-center">
          <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600">
            <Shield size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{t('heritage')}</h3>
          <p className="text-gray-600">{t('heritage_desc')}</p>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-orange-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
            <Users size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t('leadership')}</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Placeholder for committee members */}
          <div className="flex items-center gap-6 p-6 rounded-2xl bg-orange-50 border border-orange-100">
            <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center text-orange-600 text-2xl font-bold">
              P
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">President Name</h3>
              <p className="text-orange-600 font-medium">{t('president')}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 p-6 rounded-2xl bg-orange-50 border border-orange-100">
            <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center text-orange-600 text-2xl font-bold">
              S
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Secretary Name</h3>
              <p className="text-orange-600 font-medium">{t('secretary')}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 p-6 rounded-2xl bg-orange-50 border border-orange-100">
            <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center text-orange-600 text-2xl font-bold">
              T
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Treasurer Name</h3>
              <p className="text-orange-600 font-medium">{t('treasurer')}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 p-6 rounded-2xl bg-orange-50 border border-orange-100">
            <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center text-orange-600 text-2xl font-bold">
              M
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Member Name</h3>
              <p className="text-orange-600 font-medium">{t('committee_member')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
