import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ArrowRight, UserPlus, RefreshCw, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshProfile, loginWithToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleWhatsAppLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/whatsapp-url');
      const data = await response.json();
      
      if (data.url) {
        setVerificationId(data.verificationId);
        setVerificationCode(data.code);
        setIsVerifying(true);
        
        // Open WhatsApp in a new tab
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      console.error("Error starting WhatsApp login:", err);
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  // Polling for status
  useEffect(() => {
    let interval: any;
    if (isVerifying && verificationId) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/auth/check-status?verificationId=${verificationId}`);
          const data = await response.json();
          
          if (data.status === 'verified') {
            clearInterval(interval);
            if (data.customToken) {
              await loginWithToken(data.customToken);
            }
            await refreshProfile();
            
            if (data.user.name) {
              navigate('/');
            } else {
              navigate('/register');
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isVerifying, verificationId, navigate, refreshProfile]);

  // Simulation function for dev environment
  const simulateVerification = async () => {
    if (!verificationCode) return;
    try {
      await fetch('/api/auth/whatsapp-webhook-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verificationCode,
          phone: "919876543210" // Mock phone
        })
      });
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-orange-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t('login')}
          </h2>
          <p className="mt-3 text-sm text-gray-600 font-medium">
            {isVerifying ? "Waiting for WhatsApp verification..." : "Login securely using your WhatsApp account"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {!isVerifying ? (
          <div className="space-y-6">
            <button
              onClick={handleWhatsAppLogin}
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-5 px-4 border border-transparent text-xl font-black rounded-2xl text-white bg-[#25D366] hover:bg-[#128C7E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-xl hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed gap-4 uppercase tracking-wide"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : (
                <>
                  <MessageCircle size={32} fill="white" />
                  Login with WhatsApp
                </>
              )}
            </button>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-sm text-center text-green-800 font-bold">
                सुरक्षित लॉगिन: व्हाट्सएप बटन पर क्लिक करें और संदेश भेजें।
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative">
                <RefreshCw className="h-12 w-12 text-green-600 animate-spin" />
                <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-900">Verification in progress...</p>
                <p className="text-sm text-gray-500">Please send the message in WhatsApp and return here.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 w-full">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Your Code</p>
                <p className="text-2xl font-mono font-bold text-gray-800 tracking-widest">{verificationCode}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsVerifying(false)}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel and try again
              </button>
              
              {/* Simulation button for demo purposes */}
              <button
                onClick={simulateVerification}
                className="mt-4 text-xs bg-orange-50 text-orange-600 px-3 py-2 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
              >
                [Demo] Simulate WhatsApp Message Sent
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600 font-medium">
            {t('dont_have_account')}{' '}
            <Link to="/register" className="font-bold text-orange-600 hover:text-orange-500 transition-colors flex items-center justify-center gap-1 mt-2">
              <UserPlus size={18} /> {t('register_now')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
