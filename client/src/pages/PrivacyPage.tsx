/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

// import Footer from "@/components/Footer";
// import Header from "@/components/Header";

// export const PrivacyPage = () => {
//   return (
//     <div className="min-h-screen bg-background">
//       {/* Hero Section */}
//       <section className="py-40 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 via-green-500 to-blue-600 t text-white">
//         <div className="container mx-auto px-4 text-center">
//           <h1 className="text-6xl font-bold mb-6">Privacy Policy</h1>
//         </div>
//       </section>

//       {/* Privacy Content */}
//       <section className="py-20 bg-white">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl mx-auto prose prose-lg">
//             {/* Intro Section */}
//             <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl mb-12">
//               <p className="text-lg text-gray-700 leading-relaxed m-0">
//                 At StyleHub, we are committed to protecting your privacy. This
//                 policy explains how we collect, use, and safeguard your personal
//                 information when you visit and make purchases from our website
//               </p>
//             </div>

//             <div className="space-y-12">
//               {/* 1. Information We Collect */}
//               <div>
//                 <h2 className="text-3xl font-bold mb-4 text-gray-900">
//                   1. Information We Collect
//                 </h2>

//                 <div className="space-y-4 text-gray-700">
//                   <p className="leading-relaxed">
//                     We collect information you directly provide to us:
//                   </p>

//                   <p className="leading-relaxed">
//                     <strong className="text-gray-900">
//                       Personal Identifiers:
//                     </strong>{" "}
//                     Name, shipping address, email address, and phone number when
//                     you place an order or create an account.
//                   </p>

//                   <p className="leading-relaxed">
//                     <strong className="text-gray-900">
//                       Payment Information:
//                     </strong>{" "}
//                     Credit/debit card details or other payment information.
//                     Payments are processed securely by our payment processors
//                     (e.g., Stripe, PayPal). We do not store full card details on
//                     our servers.
//                   </p>

//                   <p className="leading-relaxed">
//                     <strong className="text-gray-900">Order History:</strong> A
//                     record of the products you purchase.
//                   </p>

//                   <p className="leading-relaxed">
//                     <strong className="text-gray-900">Communication:</strong>{" "}
//                     Any communication you send us, including support requests.
//                   </p>

//                   <p className="leading-relaxed">
//                     We also automatically collect certain information when you
//                     visit our site:
//                   </p>

//                   <p className="leading-relaxed">
//                     <strong className="text-gray-900">Technical Data:</strong>{" "}
//                     IP address, browser type, device info, and your interactions
//                     with our website (e.g., pages viewed), collected via cookies
//                     and similar technologies.
//                   </p>
//                 </div>
//               </div>

//               {/* 2. How We Use Your Information */}
//               <div>
//                 <h2 className="text-3xl font-bold mb-4 text-gray-900">
//                   2. How We Use Your Information
//                 </h2>

//                 <ul className="space-y-2 text-gray-700">
//                   <li className="leading-relaxed">
//                     To process and fulfill your orders
//                   </li>
//                   <li className="leading-relaxed">
//                     To provide invoices, receipts, and order confirmations
//                   </li>
//                   <li className="leading-relaxed">
//                     To respond to inquiries and provide customer support
//                   </li>
//                   <li className="leading-relaxed">
//                     To analyze site usage and improve our store
//                   </li>
//                   <li className="leading-relaxed">
//                     For marketing (only with your consent). You can opt out
//                     anytime.
//                   </li>
//                 </ul>
//               </div>

//               {/* 3. Sharing Information */}
//               <div>
//                 <h2 className="text-3xl font-bold mb-4 text-gray-900">
//                   3. Sharing Your Information
//                 </h2>

//                 <p className="text-gray-700 leading-relaxed mb-4">
//                   We do not sell your personal information. We share it only in
//                   limited circumstances:
//                 </p>

//                 <ul className="space-y-2 text-gray-700">
//                   <li className="leading-relaxed">
//                     <strong className="text-gray-900">
//                       Service Providers:
//                     </strong>{" "}
//                     Shipping carriers, payment processors, email platforms, etc.
//                   </li>
//                   <li className="leading-relaxed">
//                     <strong className="text-gray-900">
//                       Legal Obligations:
//                     </strong>{" "}
//                     When required by law or legal proceedings.
//                   </li>
//                 </ul>
//               </div>

//               {/* 4. Cookies */}
//               <div>
//                 <h2 className="text-3xl font-bold mb-4 text-gray-900">
//                   4. Cookies
//                 </h2>

//                 <p className="text-gray-700 leading-relaxed">
//                   We use cookies to remember preferences, analyze traffic, and
//                   improve your shopping experience. You can disable cookies in
//                   your browser settings, but some site features may not work
//                   properly.
//                 </p>
//               </div>

//               {/* 5. Data Retention */}
//               <div>
//                 <h2 className="text-3xl font-bold mb-4 text-gray-900">
//                   5. Data Retention
//                 </h2>

//                 <p className="text-gray-700 leading-relaxed">
//                   We retain your information only as long as necessary to
//                   fulfill the purposes for which it was collected, including
//                   legal, accounting, or reporting requirements.
//                 </p>
//               </div>

//               {/* 6. Your Rights */}
//               <div>
//                 <h2 className="text-3xl font-bold mb-4 text-gray-900">
//                   6. Your Rights
//                 </h2>

//                 <p className="text-gray-700 leading-relaxed mb-4">
//                   You may have rights depending on your location:
//                 </p>

//                 <ul className="space-y-2 text-gray-700">
//                   <li className="leading-relaxed">
//                     Access and correct personal information
//                   </li>
//                   <li className="leading-relaxed">
//                     Request deletion of your data
//                   </li>
//                   <li className="leading-relaxed">
//                     Opt out of marketing emails anytime
//                   </li>
//                   <li className="leading-relaxed">
//                     Request your information in a portable format
//                   </li>
//                 </ul>

//                 <p className="leading-relaxed text-gray-700">
//                   To exercise these rights, contact us at:{" "}
//                 </p>
//               </div>

//               {/* 7. Data Security */}
//               <div>
//                 <h2 className="text-3xl font-bold mb-4 text-gray-900">
//                   7. Data Security
//                 </h2>

//                 <p className="text-gray-700 leading-relaxed">
//                   We use industry-standard security measures to protect your
//                   data. However, no method of transmission over the internet is
//                   100% secure.
//                 </p>
//               </div>

//               {/* 8. Changes to Policy */}
//               <div>
//                 <h2 className="text-3xl font-bold mb-4 text-gray-900">
//                   8. Changes to This Policy
//                 </h2>

//                 <p className="text-gray-700 leading-relaxed">
//                   We may update this policy from time to time. Updates will be
//                   shown on this page along with a revised "Last Updated" date.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-40 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Last Updated: January 01, 2025
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            {/* Intro Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl mb-12">
              <p className="text-lg text-gray-700 leading-relaxed m-0">
                At Botfizz.com, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our chatbot platform.
              </p>
            </div>

            <div className="space-y-12">
              {/* 1. Information We Collect */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  1. Information We Collect
                </h2>
                <ul className="space-y-2 text-gray-700 list-disc pl-5">
                  <li>Personal Information (Name, Email, Contact Details) provided during registration.</li>
                  <li>Usage Data (IP addresses, browser type, interaction with our platform).</li>
                  <li>Integration Data (Tokens and configurations for WhatsApp Business API).</li>
                </ul>
              </div>

              {/* 2. How We Use Your Data */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  2. How We Use Your Data
                </h2>
                <ul className="space-y-2 text-gray-700 list-disc pl-5">
                  <li>To provide, maintain, and improve our platform and services.</li>
                  <li>To process payments and manage your subscription.</li>
                  <li>To send administrative communications, technical notices, and alerts.</li>
                  <li>To provide customer support.</li>
                </ul>
              </div>

              {/* 3. Sharing of Information */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  3. Sharing of Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell your personal data. We may share information with trusted third-party service providers (like payment processors and cloud hosting) who assist us in operating our platform.
                </p>
              </div>

              {/* 4. Data Security */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  4. Data Security
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement industry-standard security measures to protect your data. However, no method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
                </p>
              </div>

              {/* 5. Cookies and Tracking */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  5. Cookies and Tracking
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies to enhance your experience, analyze usage, and remember your preferences. You can control cookie settings through your browser.
                </p>
              </div>

              {/* 6. Your Rights */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  6. Your Rights
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to access, update, or delete your personal information. If you wish to exercise these rights, please contact our support team.
                </p>
              </div>

              {/* 7. Contact Us */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  7. Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at support@botfizz.com.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
