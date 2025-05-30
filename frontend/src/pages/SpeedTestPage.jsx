//import React from 'react';

const SpeedTestPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Internet Speed Test</h1>
      <p>
        This speed test is provided by LibreSpeed.org. Running the test will measure your download and upload speeds,
        as well as latency (ping).
      </p>
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <iframe
          src="https://librespeed.org/"
          style={{ width: '100%', height: '600px', border: 'none' }}
          title="LibreSpeed Internet Speed Test"
          // sandbox="allow-scripts allow-same-origin allow-forms" // Consider security implications
        >
          Your browser does not support iframes.
        </iframe>
      </div>
      <p style={{ fontSize: '0.9em', color: '#555' }}>
        Note: This test may consume a significant amount of data. Results are provided directly by LibreSpeed.org.
      </p>
    </div>
  );
};

export default SpeedTestPage;
