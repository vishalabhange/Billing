import React from "react";
import "../Home/Home.css";

const TwoComponentRows = () => {

  return (
    <>
      <div className="AdminDash-container">
      <div className="AdminDash-welcome">Welcome back</div>

      {/* Top Cards */}
      <div className="AdminDash-top-cards">
        {/* Total Clients */}
        <div className="AdminDash-card AdminDash-card-purple">
          <p className="AdminDash-card-title">Total Clients</p>
          <p className="AdminDash-card-value">3,248</p>
          <img
            src="https://storage.googleapis.com/a1aa/image/6cda91e8-aa26-470b-ae17-dbea64116259.jpg"
            alt="Background shape"
            className="AdminDash-card-img"
          />
        </div>

        {/* Total Orders */}
        <div className="AdminDash-card AdminDash-card-gray">
          <div>
            <p className="AdminDash-card-title-gray">Total Orders</p>
            <p className="AdminDash-card-value-dark">2,492</p>
          </div>
          <img
            src="https://storage.googleapis.com/a1aa/image/ed6480aa-d4cb-49bf-c288-dee9aafd72f9.jpg"
            alt="Icon"
            className="AdminDash-icon"
          />
        </div>

        {/* Total Revenue */}
        <div className="AdminDash-card AdminDash-card-gray">
          <div>
            <p className="AdminDash-card-title-gray">Total Revenue</p>
            <p className="AdminDash-card-value-dark">₹5,742</p>
          </div>
          <img
            src="https://storage.googleapis.com/a1aa/image/9889df0d-3733-45ef-af8f-1bac2ff54e8d.jpg"
            alt="Icon"
            className="AdminDash-icon"
          />
        </div>
      </div>

      {/* Middle Section */}
      <div className="AdminDash-middle">
        {/* Monthly Revenue */}
        <div className="AdminDash-monthly">
          <div className="AdminDash-section-header">
            <h2>Monthly Revenue</h2>
            <button className="AdminDash-icon-btn">
              <i className="fas fa-ellipsis-h" />
            </button>
          </div>

          <div className="AdminDash-revenue-info">
            <div>
              <span className="AdminDash-muted">Rate</span>
              <span> 2.0%</span>
              <span className="AdminDash-badge up">
                <i className="fas fa-arrow-up" /> 6%
              </span>
            </div>
            <div>
              <span className="AdminDash-muted">Total Revenue</span>
              <span> ₹23,456</span>
              <span className="AdminDash-badge down">
                <i className="fas fa-arrow-down" /> 2%
              </span>
            </div>
          </div>

          <div className="AdminDash-chart-bars">
            <div className="AdminDash-bar-group">
              <div className="AdminDash-tooltip">₹10,345</div>
              <div className="AdminDash-bar highlight" />
              <span>Jan 8</span>
            </div>
            {["Jan 6", "Jan 7", "Jan 9", "Jan 10", "Jan 11", "Jan 12", "Jan 13", "Jan 14", "Jan 15", "Jan 16"].map(
              (date, i) => (
                <div key={i} className="AdminDash-bar-group">
                  <div className={`AdminDash-bar h${i + 1}`} />
                  <span>{date}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Business MMR */}
        <div className="AdminDash-mmr">
          <h2>Business MMR</h2>
          <div className="AdminDash-circles">
            <div className="AdminDash-circle blue" />
            <div className="AdminDash-circle purple" />
            <div className="AdminDash-circle gray" />
          </div>

          <div className="AdminDash-mmr-info">
            <div className="AdminDash-mmr-row">
              <div className="AdminDash-mini-circle blue" />
              <span>₹38,746</span>
              <span className="AdminDash-muted-sm">Jan 2024</span>
              <span className="AdminDash-badge down">
                <i className="fas fa-arrow-down" /> 6%
              </span>
            </div>
            <div className="AdminDash-mmr-row">
              <div className="AdminDash-mini-circle purple" />
              <span>₹21,647</span>
              <span className="AdminDash-muted-sm">Dec 2023</span>
              <span className="AdminDash-badge up">
                <i className="fas fa-arrow-up" /> 4%
              </span>
            </div>
            <div className="AdminDash-mmr-row">
              <div className="AdminDash-mini-circle gray" />
              <span>₹19,546</span>
              <span className="AdminDash-muted-sm">Nov 2023</span>
              <span className="AdminDash-badge down">
                <i className="fas fa-arrow-down" /> 3%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Order List */}
      <div className="AdminDash-orders">
        <div className="AdminDash-section-header">
          <h2>Daily Order List</h2>
          <button className="AdminDash-filter-btn">
            <i className="fas fa-filter" />
            <span>Filter</span>
          </button>
        </div>

        <table className="AdminDash-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Product Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="AdminDash-user">
                  <img
                    src="https://storage.googleapis.com/a1aa/image/7a322935-85a8-468d-4c5e-8466b37f2a87.jpg"
                    alt="Darrell Steward"
                  />
                  <span>Darrell Steward</span>
                </div>
              </td>
              <td>#KS12345</td>
              <td>12 Jan 2024</td>
              <td>₹45.00</td>
              <td>
                <span className="AdminDash-status">On Delivery</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default TwoComponentRows;
