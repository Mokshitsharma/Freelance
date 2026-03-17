import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Users, User, Calendar, Heart, FileText, Download, Eye, Edit, Trash2, X, PhoneCall, Plus, TrendingUp, UserCheck, CalendarDays, Book, ShieldCheck, Camera, Upload, Camera as CameraIcon, Image, MessageSquare } from 'lucide-react';
import CameraModal from '../components/CameraModal';
import * as XLSX from 'xlsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [helplines, setHelplines] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [leadershipMessages, setLeadershipMessages] = useState<any[]>([]);
  const [adminRequests, setAdminRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [bookPhotoFile, setBookPhotoFile] = useState<File | null>(null);
  const [bookPhotoPreview, setBookPhotoPreview] = useState<string | null>(null);
  const [isUserCameraOpen, setIsUserCameraOpen] = useState(false);
  const [isBookCameraOpen, setIsBookCameraOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryFormData, setGalleryFormData] = useState<any>({ title: '', description: '', date: '' });
  const [galleryPhotoFile, setGalleryPhotoFile] = useState<File | null>(null);
  const [galleryPhotoPreview, setGalleryPhotoPreview] = useState<string | null>(null);
  const [isGalleryCameraOpen, setIsGalleryCameraOpen] = useState(false);
  const [isLeadershipModalOpen, setIsLeadershipModalOpen] = useState(false);
  const [leadershipFormData, setLeadershipFormData] = useState<any>({ name: '', designation: '', message: '', order: 0 });
  const [leadershipPhotoFile, setLeadershipPhotoFile] = useState<File | null>(null);
  const [leadershipPhotoPreview, setLeadershipPhotoPreview] = useState<string | null>(null);
  const [isLeadershipCameraOpen, setIsLeadershipCameraOpen] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [editingLeadershipId, setEditingLeadershipId] = useState<string | null>(null);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNativePlace, setFilterNativePlace] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterProfession, setFilterProfession] = useState('');
  const [filterGender, setFilterGender] = useState('');

  // Event Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventFormData, setEventFormData] = useState<any>({ title: '', description: '', date: '', location: '' });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Helpline Modal State
  const [isHelplineModalOpen, setIsHelplineModalOpen] = useState(false);
  const [helplineFormData, setHelplineFormData] = useState<any>({ name: '', phone: '', area: '', role: '' });
  const [editingHelplineId, setEditingHelplineId] = useState<string | null>(null);

  // Book Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookFormData, setBookFormData] = useState<any>({ title: '', description: '', year: '', pdf_url: '', thumbnail_url: '', price_pdf: 0, price_delivery: 0 });
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!userProfile || userProfile.role !== 'admin') return;
    try {
      const [usersSnap, eventsSnap, donationsSnap, profilesSnap, helplinesSnap, booksSnap, adminsSnap, gallerySnap, leadershipSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'events')),
        getDocs(collection(db, 'donations')),
        getDocs(collection(db, 'parichay_profiles')),
        getDocs(collection(db, 'helplines')),
        getDocs(collection(db, 'books')),
        getDocs(collection(db, 'admins')),
        getDocs(collection(db, 'gallery')),
        getDocs(collection(db, 'leadership_messages'))
      ]);

      setMembers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setEvents(eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setDonations(donationsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setProfiles(profilesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setHelplines(helplinesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBooks(booksSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAdminRequests(adminsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setGallery(gallerySnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLeadershipMessages(leadershipSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.role !== 'admin') return;
    fetchData();
  }, [userProfile]);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setMembers(members.filter(m => m.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user.");
      }
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditFormData(user);
    setPhotoPreview(user.photo || null);
    setPhotoFile(null);
    setIsEditModalOpen(true);
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleUserPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleUserPhotoSelection(file);
    }
  };

  const handleUserPhotoSelection = (file: File) => {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      let photoUrl = editFormData.photo || '';
      if (photoFile) {
        const storageRef = ref(storage, `member_photos/${selectedUser.id}_${Date.now()}`);
        const uploadResult = await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(uploadResult.ref);
      }

      const userRef = doc(db, 'users', selectedUser.id);
      const dataToSave = { ...editFormData, photo: photoUrl };
      await updateDoc(userRef, dataToSave);
      
      setMembers(members.map(m => m.id === selectedUser.id ? { ...m, ...dataToSave } : m));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user.");
    } finally {
      setIsSaving(false);
    }
  };

  const [eventFormErrors, setEventFormErrors] = useState<Record<string, string>>({});

  const handleOpenEventModal = (event?: any) => {
    setEventFormErrors({});
    if (event) {
      setEventFormData(event);
      setEditingEventId(event.id);
    } else {
      setEventFormData({ title: '', description: '', date: '', location: '' });
      setEditingEventId(null);
    }
    setIsEventModalOpen(true);
  };

  const validateEventForm = () => {
    const errors: Record<string, string> = {};
    if (!eventFormData.title) errors.title = 'Title is required';
    if (!eventFormData.description) errors.description = 'Description is required';
    if (!eventFormData.date) errors.date = 'Date is required';
    if (!eventFormData.location) errors.location = 'Location is required';
    setEventFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEvent = async () => {
    if (!validateEventForm()) return;
    setIsSaving(true);
    try {
      const dataToSave = {
        ...eventFormData,
        created_at: new Date().toISOString(),
        created_by: userProfile?.uid
      };

      if (editingEventId) {
        await updateDoc(doc(db, 'events', editingEventId), dataToSave);
        setEvents(events.map(e => e.id === editingEventId ? { id: editingEventId, ...dataToSave } : e));
      } else {
        const docRef = await addDoc(collection(db, 'events'), dataToSave);
        setEvents([...events, { id: docRef.id, ...dataToSave }]);
      }
      setIsEventModalOpen(false);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', id));
        setEvents(events.filter(e => e.id !== id));
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event.");
      }
    }
  };

  const handleOpenHelplineModal = (helpline?: any) => {
    if (helpline) {
      setHelplineFormData(helpline);
      setEditingHelplineId(helpline.id);
    } else {
      setHelplineFormData({ name: '', phone: '', area: '', role: '' });
      setEditingHelplineId(null);
    }
    setIsHelplineModalOpen(true);
  };

  const handleSaveHelpline = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...helplineFormData,
        created_at: new Date().toISOString()
      };

      if (editingHelplineId) {
        await updateDoc(doc(db, 'helplines', editingHelplineId), dataToSave);
        setHelplines(helplines.map(h => h.id === editingHelplineId ? { id: editingHelplineId, ...dataToSave } : h));
      } else {
        const docRef = await addDoc(collection(db, 'helplines'), dataToSave);
        setHelplines([...helplines, { id: docRef.id, ...dataToSave }]);
      }
      setIsHelplineModalOpen(false);
    } catch (error) {
      console.error("Error saving helpline:", error);
      alert("Failed to save helpline.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHelpline = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this helpline?')) {
      try {
        await deleteDoc(doc(db, 'helplines', id));
        setHelplines(helplines.filter(h => h.id !== id));
      } catch (error) {
        console.error("Error deleting helpline:", error);
        alert("Failed to delete helpline.");
      }
    }
  };

  const handleOpenBookModal = (book?: any) => {
    if (book) {
      setBookFormData(book);
      setEditingBookId(book.id);
      setBookPhotoPreview(book.thumbnail_url || null);
    } else {
      setBookFormData({ title: '', description: '', year: '', pdf_url: '', thumbnail_url: '', price_pdf: 0, price_delivery: 0 });
      setEditingBookId(null);
      setBookPhotoPreview(null);
    }
    setBookPhotoFile(null);
    setIsBookModalOpen(true);
  };

  const handleBookPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleBookPhotoSelection(file);
    }
  };

  const handleBookPhotoSelection = (file: File) => {
    setBookPhotoFile(file);
    setBookPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveBook = async () => {
    setIsSaving(true);
    try {
      let thumbnailUrl = bookFormData.thumbnail_url || '';
      if (bookPhotoFile) {
        const storageRef = ref(storage, `book_thumbnails/${Date.now()}_${bookPhotoFile.name}`);
        const uploadResult = await uploadBytes(storageRef, bookPhotoFile);
        thumbnailUrl = await getDownloadURL(uploadResult.ref);
      }

      const dataToSave = {
        ...bookFormData,
        thumbnail_url: thumbnailUrl,
        created_at: new Date().toISOString()
      };

      if (editingBookId) {
        await updateDoc(doc(db, 'books', editingBookId), dataToSave);
        setBooks(books.map(b => b.id === editingBookId ? { id: editingBookId, ...dataToSave } : b));
      } else {
        const docRef = await addDoc(collection(db, 'books'), dataToSave);
        setBooks([...books, { id: docRef.id, ...dataToSave }]);
      }
      setIsBookModalOpen(false);
    } catch (error) {
      console.error("Error saving book:", error);
      alert("Failed to save book.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteDoc(doc(db, 'books', id));
        setBooks(books.filter(b => b.id !== id));
      } catch (error) {
        console.error("Error deleting book:", error);
        alert("Failed to delete book.");
      }
    }
  };

  const handleApproveMember = async (id: string) => {
    try {
      await updateDoc(doc(db, 'users', id), { status: 'approved' });
      setMembers(members.map(m => m.id === id ? { ...m, status: 'approved' } : m));
    } catch (error) {
      console.error("Error approving member:", error);
      alert("Failed to approve member.");
    }
  };

  const handleRejectMember = async (id: string) => {
    if (window.confirm('Are you sure you want to reject/delete this member?')) {
      try {
        await deleteDoc(doc(db, 'users', id));
        setMembers(members.filter(m => m.id !== id));
      } catch (error) {
        console.error("Error rejecting member:", error);
        alert("Failed to reject member.");
      }
    }
  };

  const handleApproveAdmin = async (id: string) => {
    try {
      await updateDoc(doc(db, 'admins', id), { status: 'active' });
      setAdminRequests(adminRequests.map(r => r.id === id ? { ...r, status: 'active' } : r));
    } catch (error) {
      console.error("Error approving admin:", error);
      alert("Failed to approve admin.");
    }
  };

  const handleRejectAdmin = async (id: string) => {
    if (window.confirm('Are you sure you want to reject/delete this admin request?')) {
      try {
        await deleteDoc(doc(db, 'admins', id));
        setAdminRequests(adminRequests.filter(r => r.id !== id));
      } catch (error) {
        console.error("Error rejecting admin:", error);
        alert("Failed to reject admin.");
      }
    }
  };

  const handleSaveGallery = async () => {
    if (!galleryFormData.title) return;
    setIsSaving(true);
    try {
      let imageUrl = galleryFormData.url;
      if (galleryPhotoFile) {
        const photoRef = ref(storage, `gallery/${Date.now()}_${galleryPhotoFile.name}`);
        await uploadBytes(photoRef, galleryPhotoFile);
        imageUrl = await getDownloadURL(photoRef);
      }

      const data = {
        ...galleryFormData,
        url: imageUrl,
        created_at: new Date().toISOString()
      };

      if (editingGalleryId) {
        await updateDoc(doc(db, 'gallery', editingGalleryId), data);
        setGallery(gallery.map(g => g.id === editingGalleryId ? { id: editingGalleryId, ...data } : g));
      } else {
        const docRef = await addDoc(collection(db, 'gallery'), data);
        setGallery([...gallery, { id: docRef.id, ...data }]);
      }
      setIsGalleryModalOpen(false);
      setGalleryFormData({ title: '', description: '', date: '' });
      setGalleryPhotoFile(null);
      setGalleryPhotoPreview(null);
      setEditingGalleryId(null);
    } catch (error) {
      console.error("Error saving gallery item:", error);
      alert("Failed to save gallery item.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (window.confirm('Delete this photo?')) {
      try {
        await deleteDoc(doc(db, 'gallery', id));
        setGallery(gallery.filter(g => g.id !== id));
      } catch (error) {
        console.error("Error deleting gallery item:", error);
      }
    }
  };

  const handleSaveLeadership = async () => {
    if (!leadershipFormData.name || !leadershipFormData.designation || !leadershipFormData.message) return;
    setIsSaving(true);
    try {
      let imageUrl = leadershipFormData.photo_url;
      if (leadershipPhotoFile) {
        const photoRef = ref(storage, `leadership/${Date.now()}_${leadershipPhotoFile.name}`);
        await uploadBytes(photoRef, leadershipPhotoFile);
        imageUrl = await getDownloadURL(photoRef);
      }

      const data = {
        ...leadershipFormData,
        photo_url: imageUrl,
        created_at: new Date().toISOString()
      };

      if (editingLeadershipId) {
        await updateDoc(doc(db, 'leadership_messages', editingLeadershipId), data);
        setLeadershipMessages(leadershipMessages.map(m => m.id === editingLeadershipId ? { id: editingLeadershipId, ...data } : m));
      } else {
        const docRef = await addDoc(collection(db, 'leadership_messages'), data);
        setLeadershipMessages([...leadershipMessages, { id: docRef.id, ...data }]);
      }
      setIsLeadershipModalOpen(false);
      setLeadershipFormData({ name: '', designation: '', message: '', order: 0 });
      setLeadershipPhotoFile(null);
      setLeadershipPhotoPreview(null);
      setEditingLeadershipId(null);
    } catch (error) {
      console.error("Error saving leadership message:", error);
      alert("Failed to save leadership message.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLeadership = async (id: string) => {
    if (window.confirm('Delete this message?')) {
      try {
        await deleteDoc(doc(db, 'leadership_messages', id));
        setLeadershipMessages(leadershipMessages.filter(m => m.id !== id));
      } catch (error) {
        console.error("Error deleting leadership message:", error);
      }
    }
  };

  const handleGalleryPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleGalleryPhotoSelection(file);
    }
  };

  const handleGalleryPhotoSelection = (file: File) => {
    setGalleryPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setGalleryPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLeadershipPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleLeadershipPhotoSelection(file);
    }
  };

  const handleLeadershipPhotoSelection = (file: File) => {
    setLeadershipPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLeadershipPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (userProfile?.role !== 'admin' || (userProfile.status !== 'active' && userProfile.email !== 'mokshitsharmalaptop@gmail.com')) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 max-w-md">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p>You do not have permission to view this page or your account is pending approval.</p>
          <div className="mt-4">
            <button onClick={() => navigate('/admin-login')} className="text-orange-600 font-bold underline">Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  const isSuperAdmin = userProfile.email === 'mokshitsharmalaptop@gmail.com';

  const tabs = [
    { id: 'members', label: t('members'), icon: Users, count: members.length },
    { id: 'events', label: t('events'), icon: Calendar, count: events.length },
    { id: 'parichay', label: t('parichay'), icon: FileText, count: profiles.length },
    { id: 'donations', label: t('donations'), icon: Heart, count: donations.length },
    { id: 'helplines', label: t('helplines'), icon: PhoneCall, count: helplines.length },
    { id: 'books', label: t('sammelan_books'), icon: Book, count: books.length },
    { id: 'gallery', label: 'Gallery', icon: Image, count: gallery.length },
    { id: 'leadership', label: 'Leadership', icon: MessageSquare, count: leadershipMessages.length },
  ];

  if (isSuperAdmin) {
    tabs.push({ id: 'admin_requests', label: 'Admin Requests', icon: ShieldCheck, count: adminRequests.filter(r => r.status === 'pending').length });
  }

  const filteredMembers = members.filter(m => {
    const matchesSearch = !searchTerm || 
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone?.includes(searchTerm) ||
      m.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.native_place?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.current_city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesNativePlace = !filterNativePlace || m.native_place === filterNativePlace;
    const matchesCity = !filterCity || m.current_city === filterCity;
    const matchesProfession = !filterProfession || m.profession === filterProfession;

    return matchesSearch && matchesNativePlace && matchesCity && matchesProfession;
  });

  const nativePlaces = Array.from(new Set(members.map(m => m.native_place).filter(Boolean)));
  const cities = Array.from(new Set(members.map(m => m.current_city).filter(Boolean)));
  const professions = Array.from(new Set(members.map(m => m.profession).filter(Boolean)));

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = !searchTerm || 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm);
    
    const matchesGender = !filterGender || p.gender === filterGender;

    return matchesSearch && matchesGender;
  });

  const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;

  const donationData = donations
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(d => ({
      date: new Date(d.created_at).toLocaleDateString(),
      amount: d.amount
    }));

  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-12 shadow-sm">
          <h2 className="text-3xl font-bold text-red-800 mb-4">{t('access_denied')}</h2>
          <p className="text-red-600 text-lg">{t('admin_only_page')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 font-medium mt-2">Manage community data and operations.</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'members' && (
            <button 
              onClick={() => exportToExcel(members, 'members')}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download size={20} />
              Export Data
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t('total_members')}</p>
            <p className="text-2xl font-bold text-gray-900">{members.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-2xl text-green-600">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t('total_donations')}</p>
            <p className="text-2xl font-bold text-gray-900">₹{totalDonations}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t('upcoming_events')}</p>
            <p className="text-2xl font-bold text-gray-900">{upcomingEvents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-2xl text-purple-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t('parichay_registrations')}</p>
            <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-orange-600" />
              {t('donation_trends')}
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" fill="#EA580C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">{t('quick_actions')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveTab('events')}
              className="p-4 bg-orange-50 rounded-2xl text-orange-700 font-semibold hover:bg-orange-100 transition-colors text-center"
            >
              {t('manage_events')}
            </button>
            <button 
              onClick={() => setActiveTab('parichay')}
              className="p-4 bg-blue-50 rounded-2xl text-blue-700 font-semibold hover:bg-blue-100 transition-colors text-center"
            >
              {t('manage_parichay')}
            </button>
            <button 
              onClick={() => setActiveTab('donations')}
              className="p-4 bg-green-50 rounded-2xl text-green-700 font-semibold hover:bg-green-100 transition-colors text-center"
            >
              {t('view_donations')}
            </button>
            <button 
              onClick={() => setActiveTab('members')}
              className="p-4 bg-purple-50 rounded-2xl text-purple-700 font-semibold hover:bg-purple-100 transition-colors text-center"
            >
              {t('view_members')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-6 rounded-3xl border text-left transition-all ${
              activeTab === tab.id 
                ? 'bg-orange-600 text-white border-orange-600 shadow-md transform scale-105' 
                : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-orange-100 text-orange-600'
            }`}>
              <tab.icon size={24} />
            </div>
            <h3 className="text-lg font-bold mb-1">{tab.label}</h3>
            <p className={`text-3xl font-extrabold ${activeTab === tab.id ? 'text-white' : 'text-gray-900'}`}>
              {loading ? '...' : tab.count}
            </p>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 capitalize">{activeTab} List</h2>
          <div className="flex gap-2">
            {activeTab === 'events' && (
              <button 
                onClick={() => handleOpenEventModal()}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                {t('create_event')}
              </button>
            )}
            {activeTab === 'helplines' && (
              <button 
                onClick={() => handleOpenHelplineModal()}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                {t('add_helpline')}
              </button>
            )}
            {activeTab === 'books' && (
              <button 
                onClick={() => handleOpenBookModal()}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                {t('upload_book')}
              </button>
            )}
            {activeTab === 'gallery' && (
              <button 
                onClick={() => {
                  setEditingGalleryId(null);
                  setGalleryFormData({ title: '', description: '', date: '' });
                  setGalleryPhotoPreview(null);
                  setIsGalleryModalOpen(true);
                }}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Add Photo
              </button>
            )}
            {activeTab === 'leadership' && (
              <button 
                onClick={() => {
                  setEditingLeadershipId(null);
                  setLeadershipFormData({ name: '', designation: '', message: '', order: 0 });
                  setLeadershipPhotoPreview(null);
                  setIsLeadershipModalOpen(true);
                }}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Add Message
              </button>
            )}
            <input 
              type="text" 
              placeholder={t('search_placeholder')} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
          </div>
        </div>

        {activeTab === 'members' && (
          <div className="p-4 bg-white border-b border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select 
              value={filterNativePlace}
              onChange={e => setFilterNativePlace(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">{t('all')} {t('native_place')}</option>
              {nativePlaces.map(place => (
                <option key={place} value={place}>{place}</option>
              ))}
            </select>
            <select 
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">{t('all')} {t('current_city')}</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select 
              value={filterProfession}
              onChange={e => setFilterProfession(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">{t('all')} {t('profession')}</option>
              {professions.map(prof => (
                <option key={prof} value={prof}>{prof}</option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'parichay' && (
          <div className="p-4 bg-white border-b border-gray-200 flex gap-4">
            <select 
              value={filterGender}
              onChange={e => setFilterGender(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">{t('all')} {t('gender')}</option>
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
            </select>
            <button 
              onClick={() => exportToExcel(profiles, 'parichay_profiles')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-all"
            >
              <Download size={16} />
              {t('export_excel')}
            </button>
          </div>
        )}
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                  {activeTab === 'members' && (
                    <>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Phone</th>
                      <th className="p-4 font-semibold">City</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'events' && (
                    <>
                      <th className="p-4 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Location</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'parichay' && (
                    <>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Gender</th>
                      <th className="p-4 font-semibold">City</th>
                      <th className="p-4 font-semibold">Status</th>
                    </>
                  )}
                  {activeTab === 'donations' && (
                    <>
                      <th className="p-4 font-semibold">User ID</th>
                      <th className="p-4 font-semibold">Amount</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Date</th>
                    </>
                  )}
                  {activeTab === 'helplines' && (
                    <>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Phone</th>
                      <th className="p-4 font-semibold">Area</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'admin_requests' && (
                    <>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Reason</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'gallery' && (
                    <>
                      <th className="p-4 font-semibold">Photo</th>
                      <th className="p-4 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'leadership' && (
                    <>
                      <th className="p-4 font-semibold">Leader</th>
                      <th className="p-4 font-semibold">Designation</th>
                      <th className="p-4 font-semibold">Order</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeTab === 'members' && filteredMembers.map(m => (
                  <tr key={m.id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{m.name}</td>
                    <td className="p-4 text-gray-600">{m.phone}</td>
                    <td className="p-4 text-gray-600">{m.current_city || '-'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        m.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        m.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {m.status || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {m.status === 'pending' && (
                          <button 
                            onClick={() => handleApproveMember(m.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve Member"
                          >
                            <UserCheck size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewUser(m)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditUser(m)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(m.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'events' && events.map(e => (
                  <tr key={e.id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{e.title}</td>
                    <td className="p-4 text-gray-600">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-600">{e.location}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEventModal(e)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(e.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'parichay' && profiles.map(p => (
                  <tr key={p.id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{p.name}</td>
                    <td className="p-4 text-gray-600 capitalize">{p.gender}</td>
                    <td className="p-4 text-gray-600">{p.current_city}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${p.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {p.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
                {activeTab === 'donations' && donations.map(d => (
                  <tr key={d.id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900 truncate max-w-[150px]">{d.user_id}</td>
                    <td className="p-4 text-gray-900 font-bold">₹{d.amount}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${d.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{new Date(d.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {activeTab === 'helplines' && helplines.map(h => (
                  <tr key={h.id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{h.name}</td>
                    <td className="p-4 text-gray-600">{h.phone}</td>
                    <td className="p-4 text-gray-600">{h.area}</td>
                    <td className="p-4 text-gray-600">{h.role || '-'}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenHelplineModal(h)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit Helpline"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteHelpline(h.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Helpline"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'books' && books.map(b => (
                  <tr key={b.id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{b.title}</td>
                    <td className="p-4 text-gray-600">{b.year}</td>
                    <td className="p-4 text-gray-600">₹{b.price_pdf} / ₹{b.price_delivery}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenBookModal(b)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit Book"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBook(b.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Book"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'admin_requests' && adminRequests.map(r => (
                  <tr key={r.id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{r.email}</td>
                    <td className="p-4 text-gray-600 max-w-xs truncate">{r.reason}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {r.status === 'pending' && (
                          <button 
                            onClick={() => handleApproveAdmin(r.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                          onClick={() => handleRejectAdmin(r.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                        >
                          {r.status === 'pending' ? 'Reject' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'gallery' && gallery.map(g => (
                  <tr key={g.id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="p-4">
                      <img src={g.url} alt={g.title} className="w-12 h-12 rounded-lg object-cover" />
                    </td>
                    <td className="p-4 font-medium text-gray-900">{g.title}</td>
                    <td className="p-4 text-gray-600">{g.date ? new Date(g.date).toLocaleDateString() : '-'}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingGalleryId(g.id);
                            setGalleryFormData({ title: g.title, description: g.description, date: g.date, url: g.url });
                            setGalleryPhotoPreview(g.url);
                            setIsGalleryModalOpen(true);
                          }}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteGallery(g.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'leadership' && leadershipMessages.sort((a, b) => (a.order || 0) - (b.order || 0)).map(m => (
                  <tr key={m.id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={m.photo_url} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                      <span className="font-medium text-gray-900">{m.name}</span>
                    </td>
                    <td className="p-4 text-gray-600">{m.designation}</td>
                    <td className="p-4 text-gray-600">{m.order || 0}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingLeadershipId(m.id);
                            setLeadershipFormData({ name: m.name, designation: m.designation, message: m.message, order: m.order, photo_url: m.photo_url });
                            setLeadershipPhotoPreview(m.photo_url);
                            setIsLeadershipModalOpen(true);
                          }}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteLeadership(m.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900">User Profile</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-8">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-orange-100 shadow-sm bg-gray-50 flex-shrink-0">
                  {selectedUser.photo ? (
                    <img src={selectedUser.photo} alt={selectedUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-grow">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase">Name</p>
                    <p className="text-lg font-medium text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase">Phone</p>
                    <p className="text-lg font-medium text-gray-900">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase">Age</p>
                    <p className="text-lg font-medium text-gray-900">{selectedUser.age || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase">Status</p>
                    <p className="text-lg font-medium text-gray-900 capitalize">{selectedUser.status || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Role</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Current City</p>
                  <p className="text-lg font-medium text-gray-900">{selectedUser.current_city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Native Place</p>
                  <p className="text-lg font-medium text-gray-900">{selectedUser.native_place || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Profession</p>
                  <p className="text-lg font-medium text-gray-900">{selectedUser.profession || '-'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm font-semibold text-gray-500 uppercase">Family Details</p>
                  <p className="text-lg font-medium text-gray-900">{selectedUser.family_details || '-'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900">Edit User</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    value={editFormData.name || ''} 
                    onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input 
                    type="text" 
                    value={editFormData.phone || ''} 
                    onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select 
                    value={editFormData.role || 'member'} 
                    onChange={e => setEditFormData({...editFormData, role: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select 
                    value={editFormData.status || 'pending'} 
                    onChange={e => setEditFormData({...editFormData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  <input 
                    type="number" 
                    value={editFormData.age || ''} 
                    onChange={e => setEditFormData({...editFormData, age: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current City</label>
                  <input 
                    type="text" 
                    value={editFormData.current_city || ''} 
                    onChange={e => setEditFormData({...editFormData, current_city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Native Place</label>
                  <input 
                    type="text" 
                    value={editFormData.native_place || ''} 
                    onChange={e => setEditFormData({...editFormData, native_place: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profession</label>
                  <input 
                    type="text" 
                    value={editFormData.profession || ''} 
                    onChange={e => setEditFormData({...editFormData, profession: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo</label>
                  <div className="flex flex-col gap-4 p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                    <div className="flex items-center gap-4">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-orange-200" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                          <Camera size={24} />
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleUserPhotoChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          />
                          <button type="button" className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold border border-orange-100 hover:bg-orange-100 transition-colors">
                            {t('upload_photo')}
                          </button>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setIsUserCameraOpen(true)}
                          className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                          <CameraIcon size={16} />
                          {t('camera')}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Recommended: Square image, max 5MB</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <CameraModal 
        isOpen={isUserCameraOpen} 
        onClose={() => setIsUserCameraOpen(false)} 
        onCapture={handleUserPhotoSelection} 
      />

      {/* Add/Edit Helpline Modal */}
      {isHelplineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingHelplineId ? t('edit_helpline') : t('add_helpline')}
              </h3>
              <button onClick={() => setIsHelplineModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('name')} *</label>
                <input 
                  type="text" 
                  required
                  value={helplineFormData.name} 
                  onChange={e => setHelplineFormData({...helplineFormData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('phone_number')} *</label>
                <input 
                  type="text" 
                  required
                  value={helplineFormData.phone} 
                  onChange={e => setHelplineFormData({...helplineFormData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('area_location')} *</label>
                <input 
                  type="text" 
                  required
                  value={helplineFormData.area} 
                  onChange={e => setHelplineFormData({...helplineFormData, area: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="South Delhi"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('role_designation')}</label>
                <input 
                  type="text" 
                  value={helplineFormData.role} 
                  onChange={e => setHelplineFormData({...helplineFormData, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Area Coordinator"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button 
                onClick={() => setIsHelplineModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                disabled={isSaving}
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleSaveHelpline}
                disabled={isSaving || !helplineFormData.name || !helplineFormData.phone || !helplineFormData.area}
                className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingEventId ? t('edit') + ' ' + t('events') : t('create_event')}
              </h3>
              <button onClick={() => setIsEventModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('title')} *</label>
                <input 
                  type="text" 
                  required
                  value={eventFormData.title} 
                  onChange={e => {
                    setEventFormData({...eventFormData, title: e.target.value});
                    if (eventFormErrors.title) setEventFormErrors({...eventFormErrors, title: ''});
                  }}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${eventFormErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Event Title"
                />
                {eventFormErrors.title && <p className="text-red-500 text-xs mt-1">{eventFormErrors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('description')} *</label>
                <textarea 
                  required
                  value={eventFormData.description} 
                  onChange={e => {
                    setEventFormData({...eventFormData, description: e.target.value});
                    if (eventFormErrors.description) setEventFormErrors({...eventFormErrors, description: ''});
                  }}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${eventFormErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Event Description"
                  rows={3}
                />
                {eventFormErrors.description && <p className="text-red-500 text-xs mt-1">{eventFormErrors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('date')} *</label>
                <input 
                  type="date" 
                  required
                  value={eventFormData.date} 
                  onChange={e => {
                    setEventFormData({...eventFormData, date: e.target.value});
                    if (eventFormErrors.date) setEventFormErrors({...eventFormErrors, date: ''});
                  }}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${eventFormErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                />
                {eventFormErrors.date && <p className="text-red-500 text-xs mt-1">{eventFormErrors.date}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('location')} *</label>
                <input 
                  type="text" 
                  required
                  value={eventFormData.location} 
                  onChange={e => {
                    setEventFormData({...eventFormData, location: e.target.value});
                    if (eventFormErrors.location) setEventFormErrors({...eventFormErrors, location: ''});
                  }}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${eventFormErrors.location ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Event Location"
                />
                {eventFormErrors.location && <p className="text-red-500 text-xs mt-1">{eventFormErrors.location}</p>}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button 
                onClick={() => setIsEventModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                disabled={isSaving}
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleSaveEvent}
                disabled={isSaving || !eventFormData.title || !eventFormData.description || !eventFormData.date || !eventFormData.location}
                className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add/Edit Book Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingBookId ? t('edit') + ' ' + t('books') : t('upload_book')}
              </h3>
              <button onClick={() => setIsBookModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('title')} *</label>
                <input 
                  type="text" 
                  required
                  value={bookFormData.title} 
                  onChange={e => setBookFormData({...bookFormData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Book Title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('description')} *</label>
                <textarea 
                  required
                  value={bookFormData.description} 
                  onChange={e => setBookFormData({...bookFormData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Book Description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('year')} *</label>
                  <input 
                    type="text" 
                    required
                    value={bookFormData.year} 
                    onChange={e => setBookFormData({...bookFormData, year: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('thumbnail_url')} *</label>
                  <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-2xl bg-gray-50">
                    <div className="flex items-center gap-4">
                      {bookPhotoPreview && (
                        <img src={bookPhotoPreview} alt="Book Preview" className="w-12 h-16 object-cover rounded-lg border border-gray-200" />
                      )}
                      <div className="flex flex-wrap gap-2">
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleBookPhotoChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          />
                          <button type="button" className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold border border-orange-100 hover:bg-orange-100 transition-colors">
                            {t('upload_photo')}
                          </button>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setIsBookCameraOpen(true)}
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">PDF URL *</label>
                <input 
                  type="text" 
                  required
                  value={bookFormData.pdf_url} 
                  onChange={e => setBookFormData({...bookFormData, pdf_url: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('price_pdf')} *</label>
                  <input 
                    type="number" 
                    required
                    value={bookFormData.price_pdf} 
                    onChange={e => setBookFormData({...bookFormData, price_pdf: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('price_delivery')} *</label>
                  <input 
                    type="number" 
                    required
                    value={bookFormData.price_delivery} 
                    onChange={e => setBookFormData({...bookFormData, price_delivery: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button 
                onClick={() => setIsBookModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                disabled={isSaving}
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleSaveBook}
                disabled={isSaving || !bookFormData.title || !bookFormData.year || !bookFormData.pdf_url || !bookFormData.thumbnail_url}
                className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : t('save')}
              </button>
            </div>
          </div>
          <CameraModal 
            isOpen={isBookCameraOpen} 
            onClose={() => setIsBookCameraOpen(false)} 
            onCapture={handleBookPhotoSelection} 
          />
        </div>
      )}

      {/* Gallery Modal */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingGalleryId ? 'Edit Photo' : 'Add Photo'}
              </h3>
              <button onClick={() => setIsGalleryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input 
                  type="text" 
                  required
                  value={galleryFormData.title} 
                  onChange={e => setGalleryFormData({...galleryFormData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea 
                  value={galleryFormData.description} 
                  onChange={e => setGalleryFormData({...galleryFormData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input 
                  type="date" 
                  value={galleryFormData.date} 
                  onChange={e => setGalleryFormData({...galleryFormData, date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photo *</label>
                <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-2xl bg-gray-50">
                  <div className="flex items-center gap-4">
                    {galleryPhotoPreview && (
                      <img src={galleryPhotoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    )}
                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleGalleryPhotoChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        />
                        <button type="button" className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold border border-orange-100 hover:bg-orange-100 transition-colors">
                          Upload
                        </button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsGalleryCameraOpen(true)}
                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-2"
                      >
                        <CameraIcon size={16} />
                        Camera
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button 
                onClick={() => setIsGalleryModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveGallery}
                disabled={isSaving || !galleryFormData.title || (!galleryPhotoFile && !galleryFormData.url)}
                className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : 'Save'}
              </button>
            </div>
          </div>
          <CameraModal 
            isOpen={isGalleryCameraOpen} 
            onClose={() => setIsGalleryCameraOpen(false)} 
            onCapture={handleGalleryPhotoSelection} 
          />
        </div>
      )}

      {/* Leadership Modal */}
      {isLeadershipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingLeadershipId ? 'Edit Message' : 'Add Message'}
              </h3>
              <button onClick={() => setIsLeadershipModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input 
                  type="text" 
                  required
                  value={leadershipFormData.name} 
                  onChange={e => setLeadershipFormData({...leadershipFormData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Designation *</label>
                <input 
                  type="text" 
                  required
                  value={leadershipFormData.designation} 
                  onChange={e => setLeadershipFormData({...leadershipFormData, designation: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="President, Secretary, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                <textarea 
                  required
                  value={leadershipFormData.message} 
                  onChange={e => setLeadershipFormData({...leadershipFormData, message: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                <input 
                  type="number" 
                  value={leadershipFormData.order} 
                  onChange={e => setLeadershipFormData({...leadershipFormData, order: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photo *</label>
                <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-2xl bg-gray-50">
                  <div className="flex items-center gap-4">
                    {leadershipPhotoPreview && (
                      <img src={leadershipPhotoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-full border border-gray-200" />
                    )}
                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleLeadershipPhotoChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        />
                        <button type="button" className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold border border-orange-100 hover:bg-orange-100 transition-colors">
                          Upload
                        </button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsLeadershipCameraOpen(true)}
                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-2"
                      >
                        <CameraIcon size={16} />
                        Camera
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button 
                onClick={() => setIsLeadershipModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveLeadership}
                disabled={isSaving || !leadershipFormData.name || !leadershipFormData.designation || !leadershipFormData.message || (!leadershipPhotoFile && !leadershipFormData.photo_url)}
                className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : 'Save'}
              </button>
            </div>
          </div>
          <CameraModal 
            isOpen={isLeadershipCameraOpen} 
            onClose={() => setIsLeadershipCameraOpen(false)} 
            onCapture={handleLeadershipPhotoSelection} 
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
