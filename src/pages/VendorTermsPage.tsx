import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function VendorTermsPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendor Terms and Conditions</h1>
      
      <div className="prose prose-lg">
        <p className="text-gray-600">Last updated: February 2025</p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Vendor Eligibility</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Must be a registered business in Nigeria</li>
            <li>Must provide valid identification and business documentation</li>
            <li>Must maintain proper food handling certifications where applicable</li>
            <li>Must be able to fulfill bulk orders consistently</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Commission and Fees</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Platform commission: 5% of each successful group buy</li>
            <li>Payment processing fees: 1.5% + ₦100</li>
            <li>Optional premium features available for additional fees</li>
            <li>All fees are subject to applicable taxes</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Product Quality Standards</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>All products must meet Nigerian food safety standards</li>
            <li>Clear labeling of ingredients and nutritional information required</li>
            <li>Proper storage and handling procedures must be followed</li>
            <li>Regular quality audits may be conducted</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Delivery and Fulfillment</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Must maintain 95% on-time delivery rate</li>
            <li>Proper packaging for food safety during transport</li>
            <li>Clear communication of delivery schedules</li>
            <li>Compliance with cold chain requirements where applicable</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cancellation and Refunds</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>24-hour notice required for order cancellations</li>
            <li>Full refund policy for quality issues</li>
            <li>Clear documentation of refund processes</li>
            <li>Dispute resolution procedures</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Account Suspension</h2>
          <p className="text-gray-600">
            Foodrient reserves the right to suspend or terminate vendor accounts for:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Repeated quality issues</li>
            <li>Violation of platform policies</li>
            <li>Customer complaints</li>
            <li>Fraudulent activity</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Insurance and Liability</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Vendors must maintain appropriate business insurance</li>
            <li>Liability coverage for food safety incidents</li>
            <li>Compliance with local regulations</li>
            <li>Indemnification of platform from third-party claims</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Protection</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Compliance with Nigerian data protection regulations</li>
            <li>Secure handling of customer information</li>
            <li>Confidentiality requirements</li>
            <li>Data breach notification procedures</li>
          </ul>
        </section>
      </div>
    </div>
  );
}