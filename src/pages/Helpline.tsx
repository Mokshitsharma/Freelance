import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Phone, MapPin, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Helpline = () => {
  const { t } = useTranslation();
  const [helplines, setHelplines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHelplines = async () => {
      try {
        const q = query(collection(db, 'helplines'), orderBy('area'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHelplines(data);
      } catch (error) {
        console.error("Error fetching helplines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHelplines();
  }, []);

  // Group by area
  const groupedHelplines = helplines.reduce((acc, curr) => {
    if (!acc[curr.area]) {
      acc[curr.area] = [];
    }
    acc[curr.area].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  const filteredAreas = Object.keys(groupedHelplines).filter(area => 
    area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    groupedHelplines[area].some(h => 
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.phone.includes(searchTerm)
    )
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('helpline_numbers')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('helpline_subtitle')}
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={t('search_helpline')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : filteredAreas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <Phone className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">{t('no_helplines')}</h3>
          <p className="text-gray-500 mt-2">{t('try_adjusting_search')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredAreas.map(area => (
            <div key={area} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center gap-2">
                <MapPin className="text-orange-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">{area}</h2>
                <span className="ml-auto bg-orange-200 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
                  {groupedHelplines[area].length} {t('members')}
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedHelplines[area]
                  .filter(h => 
                    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    h.phone.includes(searchTerm) ||
                    area.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(helpline => (
                  <div key={helpline.id} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all bg-gray-50 hover:bg-white">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{helpline.name}</h3>
                      {helpline.role && (
                        <p className="text-sm text-orange-600 font-medium mb-1">{helpline.role}</p>
                      )}
                      <a href={`tel:${helpline.phone}`} className="text-gray-600 hover:text-orange-600 font-medium flex items-center gap-1">
                        {helpline.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Helpline;
