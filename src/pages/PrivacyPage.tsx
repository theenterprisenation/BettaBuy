import React from 'react';

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg">
        <p className="text-gray-600">Last updated: February 2025</p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-600">
            This Privacy Policy explains how Foodrient ("we", "us", "our") collects, uses, and protects your personal information in accordance with the Nigeria Data Protection Regulation (NDPR).
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Personal identification information (Name, email address, phone number)</li>
            <li>Delivery address and preferences</li>
            <li>Payment information</li>
            <li>Usage data and preferences</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>To process and fulfill your orders</li>
            <li>To communicate about group buys and delivery</li>
            <li>To improve our services</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Protection</h2>
          <p className="text-gray-600">
            We implement appropriate security measures to protect your personal information in accordance with the NDPR and industry standards.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
          <p className="text-gray-600">
            Under the NDPR, you have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
          </ul>
        </section>
      </div>
    </div>
  );
}