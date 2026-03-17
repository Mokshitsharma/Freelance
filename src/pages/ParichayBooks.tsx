import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Book, Download, ShoppingCart, ExternalLink, FileText } from 'lucide-react';
import { initializePayment } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';

interface ParichayBook {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  price_pdf: number;
  price_delivery: number;
  year: string;
  thumbnail_url?: string;
}

const ParichayBooks = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [books, setBooks] = useState<ParichayBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const q = query(collection(db, 'books'), orderBy('year', 'desc'));
        const querySnapshot = await getDocs(q);
        const booksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ParichayBook[];
        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handlePurchase = async (book: ParichayBook, type: 'pdf' | 'delivery') => {
    if (!currentUser) {
      alert(t('login_with_phone_first'));
      return;
    }

    const amount = type === 'pdf' ? book.price_pdf : book.price_delivery;
    
    try {
      await initializePayment({
        amount,
        name: currentUser.displayName || '',
        description: `Purchase ${type === 'pdf' ? 'Digital' : 'Physical'} Book (${book.year})`,
        email: currentUser.email || '',
        contact: currentUser.phoneNumber || '',
        onSuccess: (response) => {
          console.log('Payment successful:', response);
          alert(t('payment_successful'));
          if (type === 'pdf') {
            window.open(book.pdf_url, '_blank');
          }
        },
        onFailure: (error) => {
          console.error('Payment failed:', error);
          alert(t('payment_failed'));
        }
      });
    } catch (error) {
      console.error("Error initializing payment:", error);
    }
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('sammelan_books')}
        </h1>
        <div className="h-1 w-24 bg-orange-600 rounded-full mx-auto"></div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
          {t('parichay_page_desc')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <div key={book.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col">
              <div className="aspect-[3/4] bg-gray-100 relative group">
                {book.thumbnail_url ? (
                  <img 
                    src={book.thumbnail_url} 
                    alt={book.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Book size={64} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm">
                    {book.year}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{book.title}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-grow">{book.description}</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handlePurchase(book, 'pdf')}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-2xl text-blue-700 hover:bg-blue-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Download size={20} />
                      <div className="text-left">
                        <p className="font-bold text-sm">{t('download_pdf')}</p>
                        <p className="text-xs opacity-70">Digital Copy</p>
                      </div>
                    </div>
                    <span className="font-extrabold">₹{book.price_pdf}</span>
                  </button>

                  <button
                    onClick={() => handlePurchase(book, 'delivery')}
                    className="w-full flex items-center justify-between p-4 bg-orange-50 rounded-2xl text-orange-700 hover:bg-orange-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart size={20} />
                      <div className="text-left">
                        <p className="font-bold text-sm">{t('order_book')}</p>
                        <p className="text-xs opacity-70">Physical Copy</p>
                      </div>
                    </div>
                    <span className="font-extrabold">₹{book.price_delivery}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {books.length === 0 && !loading && (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-300">
          <Book size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-500 font-medium">{t('no_books')}</p>
        </div>
      )}
    </div>
  );
};

export default ParichayBooks;
