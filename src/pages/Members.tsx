import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Search, MapPin, Briefcase } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  profession: string;
  current_city: string;
  native_place: string;
  age: string;
  photo?: string;
  family_details?: string;
}

const Members = () => {
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('status', '==', 'approved'),
          orderBy('name', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const membersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Member[];
        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.current_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.profession?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('community_members') || 'Community Members'}
        </h1>
        <div className="h-1 w-24 bg-orange-600 rounded-full mx-auto"></div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
          {t('members_page_desc') || 'Meet our registered community members.'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={t('search_members') || 'Search by name, city or profession...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-orange-100 hover:shadow-md transition-all group">
              <div className="aspect-square relative overflow-hidden bg-orange-50">
                {member.photo ? (
                  <img 
                    src={member.photo} 
                    alt={member.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-orange-200">
                    <Users size={64} />
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{member.name}</h3>
                  <p className="text-orange-600 font-semibold text-sm">{member.age} {t('years_old') || 'Years'}</p>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-gray-400" />
                    <span className="truncate">{member.profession}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="truncate">{member.current_city}</span>
                  </div>
                </div>

                {member.family_details && (
                  <div className="pt-4 border-t border-gray-50">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{t('family_details') || 'Family Details'}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 italic">"{member.family_details}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">{t('no_members_found') || 'No members found matching your search.'}</p>
        </div>
      )}
    </div>
  );
};

export default Members;
