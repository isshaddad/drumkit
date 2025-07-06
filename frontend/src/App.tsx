import React, { useState } from 'react';
import LoadList from './components/LoadList';
import CreateLoadForm from './components/CreateLoadForm';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLoadCreated = () => {
    // Trigger a refresh of the load list
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Turvo Load Manager
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Load Form */}
            <div className="lg:col-span-1">
              <CreateLoadForm onLoadCreated={handleLoadCreated} />
            </div>

            {/* Load List */}
            <div className="lg:col-span-2">
              <LoadList key={refreshKey} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>Drumkit &lt;&gt; Iss</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
