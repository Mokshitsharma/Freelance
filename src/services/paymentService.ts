export interface PaymentOptions {
  amount: number;
  name: string;
  description: string;
  email?: string;
  contact?: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const initializePayment = async (options: PaymentOptions) => {
  const razorpayKey = (import.meta as any).env.VITE_RAZORPAY_KEY_ID;

  if (!razorpayKey) {
    console.error('Razorpay Key ID is missing');
    alert('Payment system is not configured. Please contact admin.');
    return;
  }

  const rzpOptions = {
    key: razorpayKey,
    amount: options.amount * 100, // Razorpay expects amount in paise
    currency: 'INR',
    name: 'Community App',
    description: options.description,
    handler: function (response: any) {
      options.onSuccess(response);
    },
    prefill: {
      name: options.name,
      email: options.email || '',
      contact: options.contact || '',
    },
    theme: {
      color: '#EA580C', // orange-600
    },
  };

  const rzp = new (window as any).Razorpay(rzpOptions);
  rzp.on('payment.failed', function (response: any) {
    options.onFailure(response.error);
  });
  rzp.open();
};
