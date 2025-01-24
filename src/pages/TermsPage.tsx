import React from 'react';

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
      
      <div className="prose prose-lg">
        <p className="text-gray-600">Last updated: February 2025</p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
          <p className="text-gray-600">
            These Terms and Conditions are governed by Nigerian law and comply with the Consumer Protection Council Act and other relevant Nigerian legislation.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Group Buying Process</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Minimum participant requirements must be met for group buys to proceed</li>
            <li>Payment must be made 2 days before the product sharing day</li>
            <li>Cancellations must be made at least 3 days before the purchase window closes</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Delivery and Pickup</h2>
          <p className="text-gray-600">
            We offer three delivery options:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Pickup from designated locations</li>
            <li>Door-step delivery (additional fees apply)</li>
            <li>Stockpiling (non-perishable items only)</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Policy</h2>
          <p className="text-gray-600">
            Refunds will be processed within 3-5 business days in the following cases:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Group buy minimum not met</li>
            <li>Vendor cancellation</li>
            <li>Customer cancellation (if made 3+ days before window closes)</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Dispute Resolution</h2>
          <p className="text-gray-600">
            Any disputes will be resolved in accordance with Nigerian law and the Consumer Protection Council's guidelines. Users have the right to file complaints with the Consumer Protection Council.
          </p>
        </section>
      </div>
    </div>
  );
}