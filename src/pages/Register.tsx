import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db, storage } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, MapPin, Briefcase, Home, Save, Loader2, Phone, Users, Camera, CheckCircle2, Upload, Camera as CameraIcon } from 'lucide-react';
import CameraModal from '../components/CameraModal';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    profession: '',
    native_place: '',
    current_city: '',
    family_details: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const validatePhone = (phone: string) => {
    return /^[0-9]{10}$/.test(phone);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handlePhotoSelection(file);
    }
  };

  const handlePhotoSelection = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('फोटो का आकार 5MB से कम होना चाहिए (Photo size should be less than 5MB)');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePhone(formData.phone)) {
      setError('कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें (Please enter a valid 10-digit phone number)');
      return;
    }

    setLoading(true);

    try {
      // Check for duplicate phone number
      const q = query(collection(db, 'users'), where('phone', '==', formData.phone));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setError('यह नंबर पहले से पंजीकृत है (This number is already registered)');
        setLoading(false);
        return;
      }

      let photoUrl = '';
      if (photoFile) {
        const storageRef = ref(storage, `member_photos/${formData.phone}_${Date.now()}`);
        const uploadResult = await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(uploadResult.ref);
      }

      // Save registration
      await addDoc(collection(db, 'users'), {
        ...formData,
        photo: photoUrl,
        age: parseInt(formData.age) || 0,
        role: 'member',
        status: 'pending',
        created_at: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (err: any) {
      console.error("Error registering member:", err);
      setError('पंजीकरण में त्रुटि हुई, कृपया पुनः प्रयास करें (Error in registration, please try again)');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only allow numeric input
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-10 space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 size={64} className="text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">सफलतापूर्वक सबमिट किया गया!</h2>
          <p className="text-xl text-gray-600">
            आपका विवरण सफलतापूर्वक सबमिट कर दिया गया है। जल्द ही इसे मंजूरी दे दी जाएगी।
            <br />
            <span className="text-sm text-gray-400">
              Your details have been submitted successfully. They will be approved soon.
            </span>
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-orange-700 transition-all"
          >
            होम पेज पर जाएं (Go to Home)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
        <div className="bg-orange-600 px-8 py-10 text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">सदस्य पंजीकरण (Member Registration)</h2>
          <p className="mt-2 text-orange-100 font-medium">
            कृपया अपना विवरण भरें (Please fill your details)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
              <p className="text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-lg font-bold text-gray-700 flex items-center gap-2">
                <User size={20} className="text-orange-500" /> नाम (Name) *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 bg-gray-50 text-lg outline-none transition-all"
                placeholder="पूरा नाम लिखें"
              />
            </div>

            <div className="space-y-2">
              <label className="text-lg font-bold text-gray-700 flex items-center gap-2">
                <Phone size={20} className="text-orange-500" /> मोबाइल नंबर (Phone Number) *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 bg-gray-50 text-lg outline-none transition-all"
                placeholder="10 अंकों का नंबर"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-lg font-bold text-gray-700 flex items-center gap-2">
                  <User size={20} className="text-orange-500" /> उम्र (Age) *
                </label>
                <input
                  type="number"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 bg-gray-50 text-lg outline-none transition-all"
                  placeholder="आपकी उम्र"
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-gray-700 flex items-center gap-2">
                  <Briefcase size={20} className="text-orange-500" /> व्यवसाय (Profession) *
                </label>
                <input
                  type="text"
                  name="profession"
                  required
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 bg-gray-50 text-lg outline-none transition-all"
                  placeholder="आप क्या काम करते हैं?"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-lg font-bold text-gray-700 flex items-center gap-2">
                  <Home size={20} className="text-orange-500" /> मूल स्थान (Native Place) *
                </label>
                <input
                  type="text"
                  name="native_place"
                  required
                  value={formData.native_place}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 bg-gray-50 text-lg outline-none transition-all"
                  placeholder="आपका गांव/शहर"
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-gray-700 flex items-center gap-2">
                  <MapPin size={20} className="text-orange-500" /> वर्तमान शहर (Current City) *
                </label>
                <input
                  type="text"
                  name="current_city"
                  required
                  value={formData.current_city}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 bg-gray-50 text-lg outline-none transition-all"
                  placeholder="अभी आप कहाँ रहते हैं?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-lg font-bold text-gray-700 flex items-center gap-2">
                <Users size={20} className="text-orange-500" /> परिवार का विवरण (Family Details) *
              </label>
              <textarea
                name="family_details"
                required
                rows={3}
                value={formData.family_details}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 bg-gray-50 text-lg outline-none transition-all"
                placeholder="परिवार के सदस्यों के बारे में लिखें"
              />
            </div>

            <div className="space-y-2">
              <label className="text-lg font-bold text-gray-700 flex items-center gap-2">
                <Camera size={20} className="text-orange-500" /> फोटो अपलोड करें (Upload Photo - Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer relative min-h-[160px] justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center text-gray-400">
                    <Upload size={32} className="mb-2" />
                    <p className="text-sm font-medium">गैलरी से चुनें (From Gallery)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all text-gray-400 min-h-[160px]"
                >
                  <CameraIcon size={32} className="mb-2" />
                  <p className="text-sm font-medium">कैमरा इस्तेमाल करें (Use Camera)</p>
                </button>
              </div>
              {photoPreview && (
                <div className="mt-4 flex justify-center">
                  <div className="relative w-32 h-32">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-xl shadow-md border-2 border-orange-100" />
                    <div className="absolute -top-2 -right-2 bg-orange-600 text-white p-1 rounded-full">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <CameraModal 
            isOpen={isCameraOpen} 
            onClose={() => setIsCameraOpen(false)} 
            onCapture={handlePhotoSelection} 
          />

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-5 px-4 border border-transparent text-2xl font-black rounded-2xl text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-xl hover:shadow-2xl disabled:opacity-70 gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin h-8 w-8" />
              ) : (
                <>
                  <Save size={28} />
                  पंजीकरण करें (Register)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
