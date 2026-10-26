import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { verifyPayment } from '../../services/donationService';

// Dynamically load Razorpay standard checkout script if not already on window
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Launch Razorpay checkout modal or test fallback
 */
export const openRazorpayCheckout = async ({
  orderData,
  onSuccess,
  onFailure,
  campaign,
  donorName,
  donorEmail,
  donorPhone,
}) => {
  const isLoaded = await loadRazorpayScript();

  // If Razorpay SDK loaded and valid orderId
  if (isLoaded && window.Razorpay && orderData.orderId && !orderData.orderId.startsWith('order_test_')) {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount * 100, // paise
      currency: orderData.currency || 'INR',
      name: 'District Welfare & Medical Aid Platform',
      description: `Medical Assistance Donation for ${campaign?.patientDisplayName || 'Patient'}`,
      order_id: orderData.orderId,
      prefill: {
        name: donorName || '',
        email: donorEmail || '',
        contact: donorPhone || '',
      },
      theme: {
        color: '#1e3a5f',
      },
      handler: async function (response) {
        try {
          const verifyRes = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            donationId: orderData.donationId,
          });

          toast.success('Donation payment verified successfully! Thank you for your support.');
          if (onSuccess) onSuccess(verifyRes.data.data);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Payment signature verification failed server-side');
          if (onFailure) onFailure(err);
        }
      },
      modal: {
        ondismiss: function () {
          toast('Donation checkout cancelled.');
          if (onFailure) onFailure(new Error('Checkout cancelled by donor'));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } else {
    // Razorpay Test Mode Simulator (Runs full server-side verification)
    const simulatedPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      const verifyRes = await verifyPayment({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: simulatedPaymentId,
        razorpay_signature: 'test_signature_valid',
        donationId: orderData.donationId,
      });

      toast.success('Test payment verified and confirmed server-side! Receipt generated.');
      if (onSuccess) onSuccess(verifyRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server-side verification failed');
      if (onFailure) onFailure(err);
    }
  }
};

export default { openRazorpayCheckout };
