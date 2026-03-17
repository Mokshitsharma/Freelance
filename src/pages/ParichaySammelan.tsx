import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Users, FileText, Download, Truck, CheckCircle, Camera, Upload, Camera as CameraIcon } from 'lucide-react';
import CameraModal from '../components/CameraModal';
import { initializePayment } from '../services/paymentService';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(1, { message: 'Required' }),
  gender: z.enum(['male', 'female']),
  age: z.number().min(18, { message: 'Must be at least 18' }),
  height: z.string().min(1, { message: 'Required' }),
  education: z.string().min(1, { message: 'Required' }),
  profession: z.string().min(1, { message: 'Required' }),
  father_name: z.string().min(1, { message: 'Required' }),
  father_gotra: z.string().min(1, { message: 'Required' }),
  address: z.string().min(1, { message: 'Required' }),
  native_place: z.string().min(1, { message: 'Required' }),
  current_city: z.string().min(1, { message: 'Required' }),
  phone: z.string().min(10, { message: 'Invalid phone' }),
  photo: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Book {
  id: string;
  title: string;
  pdf_url: string;
  price_pdf: number;
  price_delivery: number;
}

const ParichaySammelan = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      age: userProfile?.age || 18,
      profession: userProfile?.profession || '',
      native_place: userProfile?.native_place || '',
      current_city: userProfile?.current_city || '',
      gender: 'male'
    }
  });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const q = query(collection(db, 'books'));
        const querySnapshot = await getDocs(q);
        const booksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Book[];
        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!currentUser) {
      alert(t('login') + " " + t('required_field'));
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl = data.photo || '';

      if (photoFile && currentUser) {
        const storageRef = ref(storage, `parichay_photos/${currentUser.uid}_${Date.now()}.jpg`);
        await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(storageRef);
      }

      const docRef = await addDoc(collection(db, 'parichay_profiles'), {
        ...data,
        photo: photoUrl,
        user_id: currentUser.uid,
        payment_status: 'pending',
        created_at: new Date().toISOString()
      });

      // Initialize Payment
      await initializePayment({
        amount: 500, // Example amount for Parichay registration
        name: data.name,
        description: t('parichay_registration_fee'),
        contact: data.phone,
        onSuccess: async (response) => {
          // Update payment status in Firestore
          const { doc, updateDoc } = await import('firebase/firestore');
          await updateDoc(docRef, {
            payment_status: 'paid',
            payment_id: response.razorpay_payment_id
          });
          setRegistrationSuccess(true);
        },
        onFailure: (error) => {
          console.error("Payment failed:", error);
          alert(t('payment_failed'));
        }
      });
    } catch (error) {
      console.error("Error submitting profile:", error);
      alert(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('parichay')}
        </h1>
        <div className="h-1 w-24 bg-orange-600 rounded-full mx-auto"></div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
          {t('parichay_page_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-orange-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                <Users size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t('profile_registration')}</h2>
            </div>

            {registrationSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">{t('registration_submitted')}</h3>
                <p className="text-green-700 mb-6">{t('registration_success_msg')}</p>
                <button className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
                  {t('proceed_to_payment')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('name')} *</label>
                    <input {...register('name')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('gender')} *</label>
                    <select {...register('gender')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
                      <option value="male">{t('male')}</option>
                      <option value="female">{t('female')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('age')} *</label>
                    <input type="number" {...register('age', { valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" />
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('height')} *</label>
                    <input {...register('height')} placeholder="e.g. 5'8&quot;" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" />
                    {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('education')} *</label>
                    <input {...register('education')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" />
                    {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('profession')} *</label>
                    <input {...register('profession')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" />
                    {errors.profession && <p className="text-red-500 text-xs mt-1">{errors.profession.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('father_name')} *</label>
                    <input {...register('father_name')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" />
                    {errors.father_name && <p className="text-red-500 text-xs mt-1">{errors.father_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('father_gotra')} *</label>
                    <input {...register('father_gotra')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" />
                    {errors.father_gotra && <p className="text-red-500 text-xs mt-1">{errors.father_gotra.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('native_place')} *</label>
                    <input {...register('native_place')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" />
                    {errors.native_place && <p className="text-red-500 text-xs mt-1">{errors.native_place.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('current_city')} *</label>
                    <input {...register('current_city')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" />
                    {errors.current_city && <p className="text-red-500 text-xs mt-1">{errors.current_city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('phone_number')} *</label>
                    <input {...register('phone')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('photo')}</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        {photoPreview && (
                          <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-orange-100" />
                        )}
                        <div className="flex flex-wrap gap-2">
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            />
                            <button type="button" className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold border border-orange-100 hover:bg-orange-100 transition-colors">
                              {t('upload_photo')}
                            </button>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setIsCameraOpen(true)}
                            className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-2"
                          >
                            <CameraIcon size={16} />
                            {t('camera')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CameraModal 
                  isOpen={isCameraOpen} 
                  onClose={() => setIsCameraOpen(false)} 
                  onCapture={handlePhotoSelection} 
                />
                
                <div className="pt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('address')} *</label>
                  <textarea {...register('address')} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"></textarea>
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <>
                        {t('submit_and_pay')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Booklets Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                <FileText size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t('sammelan_books')}</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : books.length > 0 ? (
              <div className="space-y-4">
                {books.map(book => (
                  <div key={book.id} className="border border-gray-200 rounded-2xl p-5 hover:border-orange-300 transition-colors bg-orange-50/50">
                    <h3 className="font-bold text-gray-900 mb-4">{book.title}</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between bg-white border border-orange-200 px-4 py-3 rounded-xl hover:bg-orange-50 transition-colors text-sm font-semibold text-orange-700">
                        <span className="flex items-center gap-2"><Download size={18} /> {t('download_pdf')}</span>
                        <span>₹{book.price_pdf}</span>
                      </button>
                      <button className="w-full flex items-center justify-between bg-orange-600 text-white px-4 py-3 rounded-xl hover:bg-orange-700 transition-colors text-sm font-semibold shadow-sm">
                        <span className="flex items-center gap-2"><Truck size={18} /> {t('order_book')}</span>
                        <span>₹{book.price_delivery}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500">{t('no_books')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParichaySammelan;
