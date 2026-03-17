import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Heart, CreditCard, QrCode, CheckCircle } from 'lucide-react';

const Donation = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState<number>(501);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const predefinedAmounts = [101, 501, 1100, 2100];

  const handleDonate = async () => {
    if (!currentUser) {
      alert(t('login') + " " + t('required_field'));
      return;
    }

    const finalAmount = customAmount ? parseInt(customAmount) : amount;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setProcessing(true);
    
    // Simulate Razorpay payment flow
    setTimeout(async () => {
      try {
        await addDoc(collection(db, 'donations'), {
          user_id: currentUser.uid,
          amount: finalAmount,
          payment_id: `pay_mock_${Math.random().toString(36).substring(7)}`,
          status: 'success',
          created_at: new Date().toISOString()
        });
        setSuccess(true);
      } catch (error) {
        console.error("Error processing donation:", error);
        alert(t('error'));
      } finally {
        setProcessing(false);
      }
    }, 1500);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <div className="bg-green-50 rounded-3xl p-12 border border-green-100 shadow-sm">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-4xl font-extrabold text-green-800 mb-4">{t('payment_successful')}</h2>
          <p className="text-xl text-green-700 mb-8 font-medium">
            {t('donation_success_msg', { amount: customAmount || amount })}
          </p>
          <button 
            onClick={() => setSuccess(false)}
            className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-md"
          >
            {t('make_another_donation')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('donate')}
        </h1>
        <div className="h-1 w-24 bg-orange-600 rounded-full mx-auto"></div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
          {t('donation_page_desc')}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-orange-100">
        <div className="flex items-center justify-center mb-10">
          <div className="bg-orange-100 p-4 rounded-full text-orange-600">
            <Heart size={48} />
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-4 text-center">{t('select_amount')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {predefinedAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-4 rounded-xl font-bold text-lg transition-all border-2 ${
                    amount === amt && !customAmount
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md transform scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 font-medium">{t('or')}</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-900 mb-4 text-center">{t('custom_amount')}</label>
            <div className="relative max-w-xs mx-auto">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">₹</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount(0);
                }}
                placeholder={t('enter_amount')}
                className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 text-xl font-bold text-gray-900 transition-colors text-center"
              />
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
            <button
              onClick={handleDonate}
              disabled={processing || (!amount && !customAmount)}
              className="w-full bg-orange-600 text-white px-8 py-5 rounded-xl font-bold text-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <CreditCard size={24} />
                  {t('donate_now')} (₹{customAmount || amount})
                </>
              )}
            </button>
            <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
              <QrCode size={16} /> {t('secure_payment')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donation;
