"use client";

import React, { useState } from "react";

const Settings = () => {
  const [siteTitle, setSiteTitle] = useState(
    "Build To Learn: Development Tips, Personal Insights & Case Studies | Tabsir's Blog"
  );
  const [siteDescription, setSiteDescription] = useState(
    "Explore practical development tips, personal insights & case studies on Tabsir's blog. Learn from personal stories, find helpful tech content & get solutions to common web development challenges."
  );
  const [metaTags, setMetaTags] = useState(
    "personal tech blog, web development tips, coding solutions, tech case studies, programming tutorials, technology insights, personal development stories, developer experiences, coding best practices, tech blog for enthusiasts, software engineering advice, coding examples, technology trends, programming guides"
  );

  const handleSaveSettings = () => {
    
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Homepage Metadata Settings</h1>

        {/* Site Title */}
        <div className="mb-4">
          <label className="block mb-2">Site Title</label>
          <input
            type="text"
            className="w-full px-3 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
          />
        </div>

        {/* Site Description */}
        <div className="mb-4">
          <label className="block mb-2">Site Description</label>
          <textarea
            className="w-full px-3 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
          />
        </div>

        {/* Meta Tags */}
        <div className="mb-4">
          <label className="block mb-2">Meta Tags (comma-separated)</label>
          <input
            type="text"
            className="w-full px-3 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            value={metaTags}
            onChange={(e) => setMetaTags(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
