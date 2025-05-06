import React from "react";
import "../pages/css/shipping-policy.css";
import Navbar from "../pages/Navbar";
import Footer from "../pages/footer";

const ShippingPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="shipping-policy-container">
        <div className="shipping-policy-content">
          <h1 className="shipping-policy-title">Shipping Policy</h1>
          
          <p className="shipping-policy-text">
            <strong>Free Shipping Worldwide</strong> 
            We offer FREE Shipping by EMS (Express Mailing System) for orders above $1,000 to all countries. 
            Items are shipped from Colombo, Sri Lanka (In Asia), and delivery time is 7–14 days with tracking. 
            This will also include a 1% insurance cost.
          </p>

          <p className="shipping-policy-text">
            In addition to our FREE shipping option by EMS, to cater to your urgent requirements, 
            we also support shipping through globally reputed FedEx at an additional cost of $200. 
            FedEx will typically ship the product within 3 days to anywhere.
          </p>

          <div className="image-container">
          <img src={require('./images/123.jpeg')} alt="123" />
          </div>

          <p className="shipping-policy-text">
            After the payment has been cleared, your order will be shipped from Colombo, Sri Lanka within two working days. 
            Tracking details and a scan of the postal receipt will be sent soon after shipment. 
            Customers are liable for import taxes if any at the destination.
          </p>

          <h2 className="shipping-policy-subtitle">Process</h2>
          <p className="shipping-policy-text">
            Gem stones are submitted to the National Gem and Jewelry Authority (NGJA) with a normal Customs Declaration (CUSDEC). 
            NGJA Valuer and Customs Gem Appraiser examine the Gem Stones and allow the sealed shipment to be transferred to the Air Cargo terminal by a bonded carrier.
          </p>

          <h2 className="shipping-policy-subtitle">Insurance</h2>
          <p className="shipping-policy-text">
            All shipped goods are subjected to an extra charge of 1% for insurance.
          </p>

          <h2 className="shipping-policy-subtitle">Damaged Shipment</h2>
          <p className="shipping-policy-text">
            If the parcel being sent has been emptied or damaged, DO NOT ACCEPT the parcel. Any evidence of tampering should be reported to the carrier. 
            All damage and loss claims must be reported to us within 24 hours after the parcel has been collected.
          </p>

          <h2 className="shipping-policy-subtitle">Return & Refund</h2>
          <p className="shipping-policy-text">
            If you wish to return an item, please inform Customer Service for the return address. 
            You may return the item in the same packaging and condition within a seven-day period. 
            The buyer pays return shipping. Refunds will be made within two days upon receipt of the item.
          </p>

          <h2 className="shipping-policy-subtitle">Payment Options</h2>
          <ul className="shipping-policy-list">
            <li><strong>Credit Card Payment</strong></li>
            <li><strong>Wire Transfer</strong></li>
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShippingPolicy;
