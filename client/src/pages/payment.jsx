import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaLock, FaCreditCard, FaPaypal, FaGoogle, FaTruck } from 'react-icons/fa';
import axios from "axios";
import Navbar from './Navbar';
import Footer from './footer';
import './css/payment.css';

// Mock exchange rates (consider fetching from an API in production)
const exchangeRates = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.0,
};

const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    email: '',
    otp: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [shippingOption, setShippingOption] = useState('standard');
  const [shippingOptions] = useState([
    { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7' },
    { id: 'express', name: 'Express Shipping', price: 12.99, days: '2-3' },
    { id: 'overnight', name: 'Overnight Shipping', price: 24.99, days: '1' }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [devOtp, setDevOtp] = useState('');

  const gemData = location.state?.gemData;
  const quantity = location.state?.quantity || 1;

  useEffect(() => {
    if (!gemData) {
      navigate('/geminven');
    }
  }, [gemData, navigate]);

  const validateFormData = () => {
    const errors = {};

    // First name validation: letters and spaces only, 2-50 characters
    if (!formData.firstName.match(/^[A-Za-z\s]{2,50}$/)) {
      errors.firstName = 'First name must contain only letters and spaces, 2-50 characters';
    }

    // Last name validation: letters and spaces only, 2-50 characters
    if (!formData.lastName.match(/^[A-Za-z\s]{2,50}$/)) {
      errors.lastName = 'Last name must contain only letters and spaces, 2-50 characters';
    }

    // Email validation
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation: exactly 10 digits
    if (!formData.phone.match(/^\d{10}$/)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }

    // Address validation: alphanumeric with some special characters, 5-100 characters
    if (!formData.address.match(/^[A-Za-z0-9\s,.#-]{5,100}$/)) {
      errors.address = 'Address must be 5-100 characters (letters, numbers, basic punctuation)';
    }

    // City validation: letters and spaces, 2-50 characters
    if (!formData.city.match(/^[A-Za-z\s]{2,50}$/)) {
      errors.city = 'City must contain only letters and spaces, 2-50 characters';
    }

    // State validation: letters and spaces, 2-50 characters
    if (!formData.state.match(/^[A-Za-z\s]{2,50}$/)) {
      errors.state = 'State must contain only letters and spaces, 2-50 characters';
    }

    // ZIP code validation: 5-10 characters (numeric or alphanumeric)
    if (!formData.zipCode.match(/^[A-Za-z0-9-]{5,10}$/)) {
      errors.zipCode = 'ZIP code must be 5-10 characters (letters, numbers, or hyphen)';
    }

    // OTP validation: 6 digits (when OTP is being verified)
    if (otpSent && !otpVerified && !formData.otp.match(/^\d{6}$/)) {
      errors.otp = 'OTP must be a 6-digit number';
    }

    // Credit card specific validations
    if (paymentMethod === 'credit-card') {
      if (!formData.cardNumber.match(/^\d{16}$/)) {
        errors.cardNumber = 'Card number must be 16 digits';
      }
      if (!formData.cardHolder.match(/^[A-Za-z\s]{2,50}$/)) {
        errors.cardHolder = 'Card holder name must contain only letters and spaces, 2-50 characters';
      }
      if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
        errors.expiryDate = 'Expiry date must be in MM/YY format';
      }
      if (!formData.cvv.match(/^\d{3,4}$/)) {
        errors.cvv = 'CVV must be 3 or 4 digits';
      }
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Restrict phone to 10 digits
    if (name === 'phone' && value.length > 10) {
      return;
    }

    // Restrict cardNumber to 16 digits
    if (name === 'cardNumber' && value.length > 16) {
      return;
    }

    // Restrict cvv to 4 digits
    if (name === 'cvv' && value.length > 4) {
      return;
    }

    // Restrict otp to 6 digits
    if (name === 'otp' && value.length > 6) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate on change
    const errors = validateFormData();
    setValidationErrors(errors);
  };

  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
  };

  const convertPrice = (priceInUSD) => {
    return priceInUSD * exchangeRates[selectedCurrency];
  };

  const formatPrice = (price) => {
    return `${currencySymbols[selectedCurrency]}${price.toFixed(2)}`;
  };

  const validateForm = () => {
    const errors = validateFormData();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return 'Please correct the errors in the form before submitting.';
    }

    if (!otpVerified) {
      return 'Please verify your email address first';
    }

    return null;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const errors = validateFormData();
    if (errors.email) {
      setError(errors.email);
      setValidationErrors(errors);
      return;
    }

    setOtpLoading(true);
    setError('');
    setDevOtp('');

    try {
      const response = await axios.post('http://localhost:8000/api/auth/send-otp', {
        email: formData.email
      });

      if (response.data.otp) {
        setDevOtp(response.data.otp);
      }

      setOtpSent(true);
      setAttemptsLeft(3);
    } catch (err) {
      console.error('OTP send error:', err.response || err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const errors = validateFormData();
    if (errors.otp) {
      setError(errors.otp);
      setValidationErrors(errors);
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:8000/api/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp
      });

      setOtpVerified(true);
      setDevOtp('');
    } catch (err) {
      console.error('OTP verify error:', err.response || err);
      const remainingAttempts = err.response?.data?.attemptsLeft;
      if (remainingAttempts !== undefined) {
        setAttemptsLeft(remainingAttempts);
      }

      if (remainingAttempts === 0) {
        setOtpSent(false);
        setError('Maximum attempts reached. Request a new OTP.');
      } else {
        setError(err.response?.data?.message || 'Invalid OTP. Try again.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = gemData ? gemData.price * quantity : 0;
    const shipping = shippingOptions.find(opt => opt.id === shippingOption)?.price || 0;
    const totalInUSD = subtotal + shipping;
    return convertPrice(totalInUSD);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedShipping = shippingOptions.find(opt => opt.id === shippingOption);
      const totalAmount = calculateTotal();

      const financeData = {
        transactionType: 'sale',
        amount: totalAmount,
        currency: selectedCurrency,
        paymentMethod,
        description: `Purchase of ${gemData.name} (x${quantity})`,
        relatedGem: gemData._id,
        email: formData.email,
        paymentDetails: paymentMethod === 'credit-card' ? {
          cardNumber: formData.cardNumber,
          cardHolder: formData.cardHolder,
          expiryDate: formData.expiryDate,
          cardLastFour: formData.cardNumber.slice(-4),
        } : paymentMethod === 'paypal' ? {
          paypalEmail: formData.email
        } : {},
        metadata: {
          quantity: quantity.toString()
        }
      };

      const shippingData = {
        orderItem: gemData._id,
        quantity,
        customerEmail: formData.email,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone
        },
        shippingMethod: {
          name: selectedShipping.name,
          cost: convertPrice(selectedShipping.price),
          estimatedDelivery: `${selectedShipping.days} business days`
        },
        totalAmount: totalAmount,
        status: 'pending'
      };

      const [financeResponse, shippingResponse] = await Promise.all([
        axios.post('http://localhost:8000/api/finance', financeData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.post('http://localhost:8000/api/shipping', shippingData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (financeResponse.data._id && shippingResponse.data._id) {
        await axios.patch(`http://localhost:8000/api/shipping/${shippingResponse.data._id}/status`, {
          status: 'processing',
          transactionId: financeResponse.data._id
        });
      }

      navigate('/payment-success', {
        state: {
          gemData,
          quantity,
          totalAmount: totalAmount,
          transactionId: financeResponse.data._id,
          shippingId: shippingResponse.data._id,
          shipping: selectedShipping,
          trackingNumber: shippingResponse.data.trackingNumber,
          currency: selectedCurrency
        }
      });
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!gemData) return null;

  const totalAmount = calculateTotal();

  return (
    <>
      <Navbar />
      <div className="payment-container">
        <div className="payment-header">
          <h1>Secure Checkout</h1>
          <div className="security-badge">
            <FaLock /> Secure Payment
          </div>
        </div>

        <div className="payment-content">
          <div className="payment-summary">
            <h2>Order Summary</h2>
            <div className="currency-selector">
              <label htmlFor="currency">Currency: </label>
              <select id="currency" value={selectedCurrency} onChange={handleCurrencyChange}>
                {Object.keys(exchangeRates).map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
            <div className="gem-summary">
              <img
                src={`http://localhost:8000${gemData.image}`}
                alt={gemData.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/gem-placeholder.jpg";
                }}
              />
              <div className="gem-summary-details">
                <h3>{gemData.name}</h3>
                <p>Quantity: {quantity}</p>
                <p>Price per unit: {formatPrice(convertPrice(gemData.price))}</p>
                <p>Shipping: {formatPrice(convertPrice(shippingOptions.find(opt => opt.id === shippingOption)?.price))}</p>
                <div className="total-amount">
                  Total: {formatPrice(totalAmount)}
                </div>
              </div>
            </div>
          </div>

          <div className="payment-methods">
            <h2>Payment Process</h2>
            
            <div className="email-verification-section">
              <h3>Email Verification</h3>
              <p>Please verify your email address to continue</p>
              
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={otpSent}
                  required
                  className={validationErrors.email ? 'error-input' : ''}
                />
                {validationErrors.email && (
                  <div style={{
                    color: '#d32f2f',
                    fontSize: '0.85rem',
                    marginTop: '4px',
                    padding: '4px 8px',
                    background: '#ffebee',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>⚠</span> {validationErrors.email}
                  </div>
                )}
              </div>
              
              {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}
              
              {devOtp && (
                <div className="dev-otp" style={{ backgroundColor: '#f0f8ff', padding: '10px', border: '1px dashed #007bff' }}>
                  <p>Dev OTP: <span style={{ fontWeight: 'bold' }}>{devOtp}</span></p>
                </div>
              )}
              
              {!otpSent ? (
                <button onClick={handleSendOTP} className="otp-button" disabled={otpLoading}>
                  {otpLoading ? 'Sending...' : 'Send OTP'}
                </button>
              ) : !otpVerified ? (
                <>
                  <div className="form-group">
                    <label>Enter OTP</label>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter the 6-digit code"
                      value={formData.otp}
                      onChange={handleInputChange}
                      required
                      maxLength="6"
                      className={validationErrors.otp ? 'error-input' : ''}
                    />
                    {validationErrors.otp && (
                      <div style={{
                        color: '#d32f2f',
                        fontSize: '0.85rem',
                        marginTop: '4px',
                        padding: '4px 8px',
                        background: '#ffebee',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>⚠</span> {validationErrors.otp}
                      </div>
                    )}
                    {attemptsLeft < 3 && (
                      <small className="attempts-warning">
                        {attemptsLeft} attempts remaining
                      </small>
                    )}
                  </div>
                  <div className="otp-actions">
                    <button onClick={handleVerifyOTP} className="otp-button" disabled={otpLoading}>
                      {otpLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button onClick={handleSendOTP} className="resend-otp-button" disabled={otpLoading}>
                      Resend OTP
                    </button>
                  </div>
                </>
              ) : (
                <div className="email-verified">
                  <div className="success-message">Email verified successfully!</div>
                </div>
              )}
            </div>

            {otpVerified && (
              <>
                <div className="shipping-section">
                  <h3>Shipping Information</h3>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleInputChange} 
                        placeholder="First Name" 
                        required
                        className={validationErrors.firstName ? 'error-input' : ''}
                      />
                      {validationErrors.firstName && (
                        <div style={{
                          color: '#d32f2f',
                          fontSize: '0.85rem',
                          marginTop: '4px',
                          padding: '4px 8px',
                          background: '#ffebee',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>⚠</span> {validationErrors.firstName}
                        </div>
                      )}
                    </div>
                    <div className="input-group">
                      <input 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleInputChange} 
                        placeholder="Last Name" 
                        required
                        className={validationErrors.lastName ? 'error-input' : ''}
                      />
                      {validationErrors.lastName && (
                        <div style={{
                          color: '#d32f2f',
                          fontSize: '0.85rem',
                          marginTop: '4px',
                          padding: '4px 8px',
                          background: '#ffebee',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>⚠</span> {validationErrors.lastName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <input 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                      placeholder="Address" 
                      required 
                      className={validationErrors.address ? 'error-input' : ''}
                    />
                    {validationErrors.address && (
                      <div style={{
                        color: '#d32f2f',
                        fontSize: '0.85rem',
                        marginTop: '4px',
                        padding: '4px 8px',
                        background: '#ffebee',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>⚠</span> {validationErrors.address}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <input 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange} 
                      placeholder="City" 
                      required 
                      className={validationErrors.city ? 'error-input' : ''}
                    />
                    {validationErrors.city && (
                      <div style={{
                        color: '#d32f2f',
                        fontSize: '0.85rem',
                        marginTop: '4px',
                        padding: '4px 8px',
                        background: '#ffebee',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>⚠</span> {validationErrors.city}
                      </div>
                    )}
                    <input 
                      name="state" 
                      value={formData.state} 
                      onChange={handleInputChange} 
                      placeholder="State" 
                      required 
                      className={validationErrors.state ? 'error-input' : ''}
                    />
                    {validationErrors.state && (
                      <div style={{
                        color: '#d32f2f',
                        fontSize: '0.85rem',
                        marginTop: '4px',
                        padding: '4px 8px',
                        background: '#ffebee',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>⚠</span> {validationErrors.state}
                      </div>
                    )}
                    <input 
                      name="zipCode" 
                      value={formData.zipCode} 
                      onChange={handleInputChange} 
                      placeholder="ZIP Code" 
                      required 
                      className={validationErrors.zipCode ? 'error-input' : ''}
                    />
                    {validationErrors.zipCode && (
                      <div style={{
                        color: '#d32f2f',
                        fontSize: '0.85rem',
                        marginTop: '4px',
                        padding: '4px 8px',
                        background: '#ffebee',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>⚠</span> {validationErrors.zipCode}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <input 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder="Phone Number" 
                      required 
                      maxLength="10"
                      className={validationErrors.phone ? 'error-input' : ''}
                    />
                    {validationErrors.phone && (
                      <div style={{
                        color: '#d32f2f',
                        fontSize: '0.85rem',
                        marginTop: '4px',
                        padding: '4px 8px',
                        background: '#ffebee',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>⚠</span> {validationErrors.phone}
                      </div>
                    )}
                  </div>
                  
                  <h4>Shipping Method</h4>
                  {shippingOptions.map(option => (
                    <div key={option.id} className="shipping-option">
                      <input
                        type="radio"
                        id={option.id}
                        name="shipping"
                        checked={shippingOption === option.id}
                        onChange={() => setShippingOption(option.id)}
                      />
                      <label htmlFor={option.id}>
                        <FaTruck /> {option.name} - {formatPrice(convertPrice(option.price))} ({option.days} days)
                      </label>
                    </div>
                  ))}
                </div>

                <div className="payment-options">
                  <h3>Payment Method</h3>
                  <button
                    className={`payment-option ${paymentMethod === 'credit-card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('credit-card')}
                  >
                    <FaCreditCard /> Credit Card
                  </button>
                  <button
                    className={`payment-option ${paymentMethod === 'paypal' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <FaPaypal /> PayPal
                  </button>
                  <button
                    className={`payment-option ${paymentMethod === 'google-pay' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('google-pay')}
                  >
                    <FaGoogle /> Google Pay
                  </button>
                </div>

                {paymentMethod === 'credit-card' && (
                  <form onSubmit={handleSubmit} className="payment-form">
                    <div className="form-group">
                      <label>Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        required
                        maxLength="16"
                        className={validationErrors.cardNumber ? 'error-input' : ''}
                      />
                      {validationErrors.cardNumber && (
                        <div style={{
                          color: '#d32f2f',
                          fontSize: '0.85rem',
                          marginTop: '4px',
                          padding: '4px 8px',
                          background: '#ffebee',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>⚠</span> {validationErrors.cardNumber}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Card Holder Name</label>
                      <input
                        type="text"
                        name="cardHolder"
                        placeholder="John Doe"
                        value={formData.cardHolder}
                        onChange={handleInputChange}
                        required
                        className={validationErrors.cardHolder ? 'error-input' : ''}
                      />
                      {validationErrors.cardHolder && (
                        <div style={{
                          color: '#d32f2f',
                          fontSize: '0.85rem',
                          marginTop: '4px',
                          padding: '4px 8px',
                          background: '#ffebee',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>⚠</span> {validationErrors.cardHolder}
                        </div>
                      )}
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          required
                          className={validationErrors.expiryDate ? 'error-input' : ''}
                        />
                        {validationErrors.expiryDate && (
                          <div style={{
                            color: '#d32f2f',
                            fontSize: '0.85rem',
                            marginTop: '4px',
                            padding: '4px 8px',
                            background: '#ffebee',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span>⚠</span> {validationErrors.expiryDate}
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          required
                          maxLength="4"
                          className={validationErrors.cvv ? 'error-input' : ''}
                        />
                        {validationErrors.cvv && (
                          <div style={{
                            color: '#d32f2f',
                            fontSize: '0.85rem',
                            marginTop: '4px',
                            padding: '4px 8px',
                            background: '#ffebee',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span>⚠</span> {validationErrors.cvv}
                          </div>
                        )}
                      </div>
                    </div>

                    <button type="submit" className="submit-payment-btn" disabled={loading || Object.keys(validationErrors).length > 0}>
                      {loading ? 'Processing...' : `Pay ${formatPrice(totalAmount)}`}
                    </button>
                  </form>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="alternative-payment">
                    <p>You will be redirected to PayPal to complete your payment.</p>
                    <button onClick={handleSubmit} className="submit-payment-btn" disabled={loading || Object.keys(validationErrors).length > 0}>
                      {loading ? 'Processing...' : `Continue to PayPal`}
                    </button>
                  </div>
                )}

                {paymentMethod === 'google-pay' && (
                  <div className="alternative-payment">
                    <p>You will be redirected to Google Pay to complete your payment.</p>
                    <button onClick={handleSubmit} className="submit-payment-btn" disabled={loading || Object.keys(validationErrors).length > 0}>
                      {loading ? 'Processing...' : `Continue to Google Pay`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Payment;