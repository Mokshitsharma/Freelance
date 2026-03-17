import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Users, Edit2, Save, X, Camera, Camera as CameraIcon, Upload } from 'lucide-react';
import CameraModal from '../components/CameraModal';

const Profile = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: 0,
    profession: '',
    native_place: '',
    current_city: '',
    family_details: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        age: userProfile.age || 0,
        profession: userProfile.profession || '',
        native_place: userProfile.native_place || '',
        current_city: userProfile.current_city || '',
        family_details: userProfile.family_details || ''
      });
      setPhotoPreview(userProfile.photo || null);
    }
  }, [userProfile]);

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handlePhotoSelection(file);
    }
  };

  const handlePhotoSelection = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let photoUrl = userProfile.photo || '';

      if (photoFile) {
        const storageRef = ref(storage, `profile_photos/${currentUser.uid}.jpg`);
        await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(storageRef);
      }

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...formData,
        photo: photoUrl
      });

      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-100 shadow-inner bg-gray-100 flex items-center justify-center">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={64} className="text-gray-300" />
            )}
          </div>
          {isEditing && (
            <div className="absolute bottom-0 right-0 flex gap-2">
              <label className="bg-orange-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-orange-700 transition-colors">
                <Upload size={20} />
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
              <button 
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="bg-gray-800 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-black transition-colors"
              >
                <CameraIcon size={20} />
              </button>
            </div>
          )}
        </div>

        <CameraModal 
          isOpen={isCameraOpen} 
          onClose={() => setIsCameraOpen(false)} 
          onCapture={handlePhotoSelection} 
        />

        <div className="flex-grow text-center md:text-left space-y-2">
          {isEditing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="text-3xl font-bold text-gray-900 border-b-2 border-orange-500 focus:outline-none bg-transparent w-full"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">{userProfile.name}</h1>
          )}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Phone size={16} />
              <span>{userProfile.phone}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{userProfile.age} {t('years')}</span>
            </div>
            <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {userProfile.role}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                <X size={20} />
                <span className="hidden sm:inline">{t('cancel')}</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span className="hidden sm:inline">{t('save')}</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-md"
            >
              <Edit2 size={20} />
              <span>{t('edit_profile')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="text-orange-600" size={24} />
            {t('personal_details')}
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('age')}</label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className="text-lg font-medium text-gray-900 border-b border-gray-200 focus:border-orange-500 focus:outline-none"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900">{userProfile.age}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('profession')}</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="text-lg font-medium text-gray-900 border-b border-gray-200 focus:border-orange-500 focus:outline-none"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900">{userProfile.profession || '-'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="text-orange-600" size={24} />
            {t('location_details')}
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('native_place')}</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.native_place}
                  onChange={(e) => setFormData({ ...formData, native_place: e.target.value })}
                  className="text-lg font-medium text-gray-900 border-b border-gray-200 focus:border-orange-500 focus:outline-none"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900">{userProfile.native_place || '-'}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('current_city')}</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.current_city}
                  onChange={(e) => setFormData({ ...formData, current_city: e.target.value })}
                  className="text-lg font-medium text-gray-900 border-b border-gray-200 focus:border-orange-500 focus:outline-none"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900">{userProfile.current_city || '-'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Family Details */}
        <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-orange-100 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-orange-600" size={24} />
            {t('family_details')}
          </h2>
          
          <div className="flex flex-col gap-1">
            {isEditing ? (
              <textarea
                value={formData.family_details}
                onChange={(e) => setFormData({ ...formData, family_details: e.target.value })}
                rows={4}
                className="w-full text-lg font-medium text-gray-900 border border-gray-200 rounded-xl p-4 focus:border-orange-500 focus:outline-none"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 whitespace-pre-wrap">{userProfile.family_details || '-'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
