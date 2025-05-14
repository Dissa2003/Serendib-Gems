import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './footer';
import './css/gemCutting.css';

const GemCutting = () => {
  const [formData, setFormData] = useState({
    gemstoneType: '',
    roughStoneWeight: '',
    shapeOfRoughStone: '',
    inclusionLocation: '',
    desiredShape: '',
    expectedWeightAfterCutting: '',
    cuttingMethod: '',
    brilliancePriority: '',
    finishLevel: '',
    gemstoneColorQuality: '',
    additionalNotes: '',
    cutter: '',
    userName: '',
    email: '',
    contactNumber: ''
  });

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const gemstoneTypes = [
    'Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Amethyst', 
    'Aquamarine', 'Topaz', 'Opal', 'Garnet', 'Peridot', 
    'Tanzanite', 'Tourmaline', 'Citrine', 'Morganite', 'Other'
  ];

  const roughShapes = [
    'Octahedron', 'Cube', 'Dodecahedron', 'Irregular', 'Tabular', 
    'Prismatic', 'Rounded', 'Elongated', 'Flat', 'Other'
  ];

  const desiredShapes = [
    'Round', 'Princess', 'Cushion', 'Emerald', 'Oval', 
    'Pear', 'Marquise', 'Asscher', 'Radiant', 'Heart', 
    'Trillion', 'Baguette', 'Briolette', 'Rose Cut', 'Other'
  ];

  const cuttingMethods = [
    'Traditional', 'Precision', 'Laser', 'Ultrasonic', 'Water Jet',
    'Hand Cutting', 'Automated', 'Hybrid', 'Other'
  ];

  const cutters = [
    'John Diamond', 'Maria Gemstone', 'Robert Crystal', 'Sarah Facet',
    'David Brilliance', 'Lisa Precision', 'Michael Cutter', 'Custom'
  ];

  const validateFormData = () => {
    const errors = {};
    
    if (!formData.userName.match(/^[A-Za-z\s]{2,50}$/)) {
      errors.userName = 'Name must contain only letters and spaces, 2-50 characters';
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.contactNumber && !formData.contactNumber.match(/^\d{10}$/)) {
      errors.contactNumber = 'Phone number must be exactly 10 digits';
    }

    const roughWeight = parseFloat(formData.roughStoneWeight);
    if (!roughWeight || roughWeight < 0.01) {
      errors.roughStoneWeight = 'Rough stone weight must be a number greater than 0.01 carats';
    }

    const expectedWeight = parseFloat(formData.expectedWeightAfterCutting);
    if (formData.expectedWeightAfterCutting && (!expectedWeight || expectedWeight <= 0)) {
      errors.expectedWeightAfterCutting = 'Expected weight must be a positive number';
    } else if (roughWeight && expectedWeight && expectedWeight >= roughWeight) {
      errors.expectedWeightAfterCutting = 'Expected weight must be less than rough stone weight';
    }

    if (!formData.inclusionLocation.match(/^[A-Za-z0-9\s,.()-]{2,100}$/)) {
      errors.inclusionLocation = 'Inclusion location must be 2-100 characters (letters, numbers, basic punctuation)';
    }

    if (formData.gemstoneColorQuality && !formData.gemstoneColorQuality.match(/^[A-Za-z0-9\s,+-]{0,50}$/)) {
      errors.gemstoneColorQuality = 'Color quality must be 0-50 characters (letters, numbers, basic punctuation)';
    }

    if (formData.additionalNotes.length > 500) {
      errors.additionalNotes = 'Additional notes must be 500 characters or less';
    }

    if (!formData.gemstoneType) errors.gemstoneType = 'Please select a gemstone type';
    if (!formData.shapeOfRoughStone) errors.shapeOfRoughStone = 'Please select a rough stone shape';
    if (!formData.desiredShape) errors.desiredShape = 'Please select a desired shape';
    if (!formData.cuttingMethod) errors.cuttingMethod = 'Please select a cutting method';
    if (!formData.brilliancePriority) errors.brilliancePriority = 'Please select a brilliance priority';
    if (!formData.finishLevel) errors.finishLevel = 'Please select a finish level';
    if (!formData.cutter) errors.cutter = 'Please select a cutter';

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contactNumber' && value.length > 10) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'gemstoneType' || name === 'desiredShape') {
      updatePreviewImage(
        name === 'gemstoneType' ? value : formData.gemstoneType,
        name === 'desiredShape' ? value : formData.desiredShape
      );
    }

    const errors = validateFormData();
    setValidationErrors(errors);
  };

  const updatePreviewImage = (gemType, shape) => {
    if (!gemType || !shape) return;
    setPreviewImage(`/images/gems/${gemType.toLowerCase()}_${shape.toLowerCase()}.jpg`);
  };

  const validateForm = () => {
    const errors = validateFormData();
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitMessage({ 
        type: 'error', 
        text: 'Please correct the errors in the form before submitting.' 
      });
      return;
    }
    
    setLoading(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      await axios.post('http://localhost:8000/api/gem-cutting', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
        }
      });

      let emailStatus = '';

      if (formData.email) {
        try {
          const emailResponse = await axios.post('http://localhost:8000/api/email/send', {
            to: formData.email,
            subject: 'Gem Cutting Request Confirmation',
            message: `Dear ${formData.userName},\n\nYour gem cutting request for a ${formData.gemstoneType} to be cut into a ${formData.desiredShape} shape has been successfully received. Our expert cutter, ${formData.cutter}, will begin working on your request soon.\n\nThank you for choosing our gem cutting service!\n\nBest regards,\nThe Gem Cutting Team`
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
            }
          });

          if (emailResponse.status === 200) {
            emailStatus = ' A confirmation email has been sent to your inbox.';
          }
        } catch (emailError) {
          console.error('Email sending failed:', emailError.response?.data || emailError.message);
          emailStatus = ' However, we couldn\'t send a confirmation email. Please check your email address or contact support.';
        }
      } else {
        emailStatus = ' No email provided for confirmation.';
      }

      // Redirect to /cutsuccess with formData
      navigate('/cutsuccess', { state: { formData, emailStatus } });
    } catch (error) {
      console.error('Error submitting gem cutting request:', error.response?.data || error.message);
      setSubmitMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit request. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gem-cutting-page">
      <Navbar />
      <div className="gem-cutting-container">
        <div className="gem-cutting-header">
          <h1>Custom Gem Cutting Service</h1>
          <p>Transform your rough gemstones into exquisite cut gems with our expert cutting service</p>
        </div>

        <div className="gem-cutting-content">
          <div className="gem-cutting-info">
            <div className="info-card">
              <div className="info-icon">💎</div>
              <h3>Expert Craftsmanship</h3>
              <p>Our master gem cutters bring decades of experience to every stone they touch.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">✨</div>
              <h3>Precision Cutting</h3>
              <p>Using state-of-the-art technology for optimal brilliance and beauty.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🔍</div>
              <h3>Custom Design</h3>
              <p>Tailored cutting plans to maximize your gemstone's unique characteristics.</p>
            </div>
          </div>

          <div className="gem-cutting-form-container">
            {submitMessage.text && (
              <div className={`submit-message ${submitMessage.type}`}>
                {submitMessage.text}
              </div>
            )}
            
            <div className="form-preview-wrapper">
              <form className="gem-cutting-form" onSubmit={handleSubmit}>
                <h2>Gem Cutting Request</h2>
                
                <div className="form-section">
                  <h3>Gemstone Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="gemstoneType">Gemstone Type*</label>
                      <select 
                        id="gemstoneType" 
                        name="gemstoneType" 
                        value={formData.gemstoneType} 
                        onChange={handleChange}
                        required
                        className={validationErrors.gemstoneType ? 'error-input' : ''}
                      >
                        <option value="">Select Gemstone Type</option>
                        {gemstoneTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {validationErrors.gemstoneType && (
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
                          <span>⚠</span> {validationErrors.gemstoneType}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="roughStoneWeight">Rough Stone Weight (carats)*</label>
                      <input 
                        type="number" 
                        id="roughStoneWeight" 
                        name="roughStoneWeight" 
                        value={formData.roughStoneWeight} 
                        onChange={handleChange}
                        step="0.01"
                        min="0.01"
                        required
                        className={validationErrors.roughStoneWeight ? 'error-input' : ''}
                      />
                      {validationErrors.roughStoneWeight && (
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
                          <span>⚠</span> {validationErrors.roughStoneWeight}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="shapeOfRoughStone">Shape of Rough Stone*</label>
                      <select 
                        id="shapeOfRoughStone" 
                        name="shapeOfRoughStone" 
                        value={formData.shapeOfRoughStone} 
                        onChange={handleChange}
                        required
                        className={validationErrors.shapeOfRoughStone ? 'error-input' : ''}
                      >
                        <option value="">Select Rough Shape</option>
                        {roughShapes.map(shape => (
                          <option key={shape} value={shape}>{shape}</option>
                        ))}
                      </select>
                      {validationErrors.shapeOfRoughStone && (
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
                          <span>⚠</span> {validationErrors.shapeOfRoughStone}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="inclusionLocation">Inclusion Location*</label>
                      <input 
                        type="text" 
                        id="inclusionLocation" 
                        name="inclusionLocation" 
                        value={formData.inclusionLocation} 
                        onChange={handleChange}
                        placeholder="e.g., Top left quadrant, Center, None"
                        required
                        className={validationErrors.inclusionLocation ? 'error-input' : ''}
                      />
                      {validationErrors.inclusionLocation && (
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
                          <span>⚠</span> {validationErrors.inclusionLocation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Cutting Specifications</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="desiredShape">Desired Shape*</label>
                      <select 
                        id="desiredShape" 
                        name="desiredShape" 
                        value={formData.desiredShape} 
                        onChange={handleChange}
                        required
                        className={validationErrors.desiredShape ? 'error-input' : ''}
                      >
                        <option value="">Select Desired Shape</option>
                        {desiredShapes.map(shape => (
                          <option key={shape} value={shape}>{shape}</option>
                        ))}
                      </select>
                      {validationErrors.desiredShape && (
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
                          <span>⚠</span> {validationErrors.desiredShape}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="expectedWeightAfterCutting">Expected Weight After Cutting (carats)</label>
                      <input 
                        type="number" 
                        id="expectedWeightAfterCutting" 
                        name="expectedWeightAfterCutting" 
                        value={formData.expectedWeightAfterCutting} 
                        onChange={handleChange}
                        step="0.01"
                        min="0.01"
                        className={validationErrors.expectedWeightAfterCutting ? 'error-input' : ''}
                      />
                      {validationErrors.expectedWeightAfterCutting && (
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
                          <span>⚠</span> {validationErrors.expectedWeightAfterCutting}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cuttingMethod">Cutting Method*</label>
                      <select 
                        id="cuttingMethod" 
                        name="cuttingMethod" 
                        value={formData.cuttingMethod} 
                        onChange={handleChange}
                        required
                        className={validationErrors.cuttingMethod ? 'error-input' : ''}
                      >
                        <option value="">Select Cutting Method</option>
                        {cuttingMethods.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                      {validationErrors.cuttingMethod && (
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
                          <span>⚠</span> {validationErrors.cuttingMethod}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="brilliancePriority">Brilliance Priority*</label>
                      <select 
                        id="brilliancePriority" 
                        name="brilliancePriority" 
                        value={formData.brilliancePriority} 
                        onChange={handleChange}
                        required
                        className={validationErrors.brilliancePriority ? 'error-input' : ''}
                      >
                        <option value="">Select Priority</option>
                        <option value="weight retention">Weight Retention</option>
                        <option value="brilliance maximization">Brilliance Maximization</option>
                      </select>
                      {validationErrors.brilliancePriority && (
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
                          <span>⚠</span> {validationErrors.brilliancePriority}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="finishLevel">Finish Level*</label>
                      <select 
                        id="finishLevel" 
                        name="finishLevel" 
                        value={formData.finishLevel} 
                        onChange={handleChange}
                        required
                        className={validationErrors.finishLevel ? 'error-input' : ''}
                      >
                        <option value="">Select Finish Level</option>
                        <option value="rough">Rough</option>
                        <option value="medium">Medium</option>
                        <option value="high polish">High Polish</option>
                      </select>
                      {validationErrors.finishLevel && (
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
                          <span>⚠</span> {validationErrors.finishLevel}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="gemstoneColorQuality">Gemstone Color Quality</label>
                      <input 
                        type="text" 
                        id="gemstoneColorQuality" 
                        name="gemstoneColorQuality" 
                        value={formData.gemstoneColorQuality} 
                        onChange={handleChange}
                        placeholder="e.g., AAA, AA, A"
                        className={validationErrors.gemstoneColorQuality ? 'error-input' : ''}
                      />
                      {validationErrors.gemstoneColorQuality && (
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
                          <span>⚠</span> {validationErrors.gemstoneColorQuality}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group full-width">
                      <label htmlFor="additionalNotes">Additional Notes</label>
                      <textarea 
                        id="additionalNotes" 
                        name="additionalNotes" 
                        value={formData.additionalNotes} 
                        onChange={handleChange}
                        placeholder="Any special instructions or concerns..."
                        rows="3"
                        className={validationErrors.additionalNotes ? 'error-input' : ''}
                      ></textarea>
                      {validationErrors.additionalNotes && (
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
                          <span>⚠</span> {validationErrors.additionalNotes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Cutter & Contact Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cutter">Preferred Cutter*</label>
                      <select 
                        id="cutter" 
                        name="cutter" 
                        value={formData.cutter} 
                        onChange={handleChange}
                        required
                        className={validationErrors.cutter ? 'error-input' : ''}
                      >
                        <option value="">Select Cutter</option>
                        {cutters.map(cutter => (
                          <option key={cutter} value={cutter}>{cutter}</option>
                        ))}
                      </select>
                      {validationErrors.cutter && (
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
                          <span>⚠</span> {validationErrors.cutter}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="userName">Your Name*</label>
                      <input 
                        type="text" 
                        id="userName" 
                        name="userName" 
                        value={formData.userName} 
                        onChange={handleChange}
                        required
                        className={validationErrors.userName ? 'error-input' : ''}
                      />
                      {validationErrors.userName && (
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
                          <span>⚠</span> {validationErrors.userName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email*</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
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
                    <div className="form-group">
                      <label htmlFor="contactNumber">Contact Number</label>
                      <input 
                        type="tel" 
                        id="contactNumber" 
                        name="contactNumber" 
                        value={formData.contactNumber} 
                        onChange={handleChange}
                        maxLength="10"
                        className={validationErrors.contactNumber ? 'error-input' : ''}
                      />
                      {validationErrors.contactNumber && (
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
                          <span>⚠</span> {validationErrors.contactNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-button" 
                    disabled={loading || Object.keys(validationErrors).length > 0}
                  >
                    {loading ? 'Submitting...' : 'Submit Cutting Request'}
                  </button>
                </div>
              </form>

              <div className="gem-preview">
                <h3>Gem Preview</h3>
                <div className="preview-container">
                  {previewImage ? (
                    <img src={previewImage} alt="Gem preview" className="gem-image" />
                  ) : (
                    <div className="gem-placeholder">
                      <div className="gem-icon">💎</div>
                      <p>Select gemstone type and desired shape to see a preview</p>
                    </div>
                  )}
                </div>
                <div className="gem-details">
                  {formData.gemstoneType && formData.desiredShape && (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">Gemstone:</span>
                        <span className="detail-value">{formData.gemstoneType}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Shape:</span>
                        <span className="detail-value">{formData.desiredShape}</span>
                      </div>
                      {formData.roughStoneWeight && (
                        <div className="detail-item">
                          <span className="detail-label">Rough Weight:</span>
                          <span className="detail-value">{formData.roughStoneWeight} carats</span>
                        </div>
                      )}
                      {formData.expectedWeightAfterCutting && (
                        <div className="detail-item">
                          <span className="detail-label">Expected Cut Weight:</span>
                          <span className="detail-value">{formData.expectedWeightAfterCutting} carats</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="gem-cutting-process">
            <h2>Our Cutting Process</h2>
            <div className="process-steps">
              <div className="process-step">
                <div className="step-number">1</div>
                <h3>Assessment</h3>
                <p>We carefully examine your rough stone to determine the optimal cutting approach.</p>
              </div>
              <div className="process-step">
                <div className="step-number">2</div>
                <h3>Planning</h3>
                <p>Our experts create a detailed cutting plan to maximize beauty and value.</p>
              </div>
              <div className="process-step">
                <div className="step-number">3</div>
                <h3>Cutting</h3>
                <p>Precision cutting using advanced techniques and equipment.</p>
              </div>
              <div className="process-step">
                <div className="step-number">4</div>
                <h3>Polishing</h3>
                <p>Meticulous polishing to bring out the gem's natural brilliance.</p>
              </div>
              <div className="process-step">
                <div className="step-number">5</div>
                <h3>Quality Check</h3>
                <p>Rigorous inspection to ensure the highest quality standards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GemCutting;