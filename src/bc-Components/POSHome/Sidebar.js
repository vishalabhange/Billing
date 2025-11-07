import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="POS-sidebar">
      <div className="barcode-section">
        <h2 className="sidebar-title">Scan Product</h2>
        <input
          type="text"
          placeholder="Scan or enter barcode..."
          className="barcode-input"
          disabled
        />
        <p className="barcode-info">
          This section is for scanning products using a barcode reader. 
          When a barcode is scanned, the product details will appear here.
        </p>

        <div className="product-placeholder">
          <div className="placeholder-img">📦</div>
          <p>Product info will show here after scanning.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
