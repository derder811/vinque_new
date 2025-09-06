import React, { useEffect, useState } from 'react';
import Header from "../../Compo/Header/Header";
import Sidebar from "../../Compo/Sidebar/Sidebar";
import styles from "./SellerPage.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
);

export default function SellerPage() {
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState({
    totalProducts: 0,
    visitors: 0,
    trending: "N/A",
    popular: "N/A",
    categories: [],
    mostViewedItem: null,
  });
  const [monthlyVisits, setMonthlyVisits] = useState(Array(12).fill(0));
  const [revenueData, setRevenueData] = useState({
    revenueByCategory: [],
    monthlyRevenue: Array(12).fill(0),
    totalRevenue: 0,
    totalOrders: 0,
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const sellerId = user?.seller_id || localStorage.getItem("seller_id") || "14";

  const pieData = {
    labels: stats.categories.map(c => c.category),
    datasets: [
      {
        data: stats.categories.map(c => c.count),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Visits',
        data: monthlyVisits,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Revenue by Category Chart Data
  const revenueByCategoryData = {
    labels: revenueData.revenueByCategory.map(item => item.category),
    datasets: [
      {
        label: 'Revenue by Category',
        data: revenueData.revenueByCategory.map(item => parseFloat(item.revenue)),
        backgroundColor: '#8B4513',
        borderColor: '#654321',
        borderWidth: 1,
      },
    ],
  };

  // Monthly Revenue Chart Data
  const monthlyRevenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: revenueData.monthlyRevenue,
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        borderColor: '#8B4513',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  useEffect(() => {
    console.log('SellerPage component mounted, sellerId:', sellerId);
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching data from API endpoints...');
        // Fetch both stats and revenue data
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const statsEndpoint = `${apiUrl}/api/seller-stats/${sellerId}`;
        const revenueEndpoint = `${apiUrl}/api/seller-revenue/${sellerId}`;
        
        console.log('Stats endpoint:', statsEndpoint);
        console.log('Revenue endpoint:', revenueEndpoint);
        
        const [statsRes, revenueRes] = await Promise.all([
          fetch(statsEndpoint),
          fetch(revenueEndpoint)
        ]);
        
        console.log('Stats response status:', statsRes.status);
        console.log('Revenue response status:', revenueRes.status);
        
        const statsJson = await statsRes.json();
        const revenueJson = await revenueRes.json();
        
        console.log('Stats response data:', statsJson);
        console.log('Revenue response data:', revenueJson);

        if (statsJson.status === "success") {
          const {
            businessName,
            totalProducts,
            visitors,
            trending,
            popular,
            categories,
            mostViewedItem,
            visitsByMonth,
          } = statsJson.data;

          setUsername(businessName);
          setStats({
            totalProducts,
            visitors,
            trending,
            popular,
            categories,
            mostViewedItem,
          });
          setMonthlyVisits(visitsByMonth || []);
          console.log('Stats data processed successfully');
        } else {
          console.error('Stats data error:', statsJson.message);
          setError(statsJson.message || "Failed to load stats.");
        }

        if (revenueJson.status === "success") {
          setRevenueData(revenueJson.data);
          console.log('Revenue data processed successfully');
        } else {
          console.warn("Revenue data not available:", revenueJson.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to fetch data.");
      } finally {
        setLoading(false);
        console.log('Data fetching completed, loading state set to false');
      }
    };

    fetchData();
  }, [sellerId]);

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className={styles.container}>
        <Header showSearchBar={false} showItems={false} isSeller={true} />
        <div className={styles.content}>
          <Sidebar />
          <main className={styles.dashboardMain}>
            <div className="d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading your dashboard...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className={styles.container}>
        <Header showSearchBar={false} showItems={false} isSeller={true} />
        <div className={styles.content}>
          <Sidebar />
          <main className={styles.dashboardMain}>
            <div className="d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
              <div className="text-center text-danger">
                <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "3rem" }}></i>
                <p className="mt-3">{error}</p>
                <button
                  className="btn btn-outline-danger mt-2"
                  onClick={() => window.location.reload()}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  console.log('Rendering SellerPage component with state:', {
    username,
    stats,
    monthlyVisits,
    revenueData,
    loading,
    error,
    sellerId
  });
  
  return (
    <div className={styles.container}>
      {console.log('Rendering container')}
      <Header showSearchBar={false} showItems={false} isSeller={true} />
      {console.log('Rendered Header')}
      <div className={styles.content}>
        {console.log('Rendering content')}
        <Sidebar />
        {console.log('Rendered Sidebar')}
        <main className={styles.dashboardMain}>
          <div className="container-fluid py-3">
            <h2 className="text-center mb-4">{username}'s Dashboard</h2>
            <p className="text-muted text-center">Welcome {username}! Here's your dashboard overview.</p>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              {[
                { icon: "bi-box-seam-fill", label: "Total Products", value: stats.totalProducts, color: "text-success" },
                { icon: "bi-eye-fill", label: "Shop Visitors", value: stats.visitors, color: "text-primary" },
                { icon: "bi-star-fill", label: "Best-Selling", value: stats.popular, color: "text-warning" },
                { icon: "bi-fire", label: "Trending", value: stats.trending, color: "text-danger" },
              ].map((item, i) => (
                <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={i}>
                  <div className="card text-center shadow-sm h-100" style={{ backgroundColor: '#f8f5e6', borderRadius: '12px' }}>
                    <div className="card-body">
                      <h5 className={`card-title ${item.color}`}>
                        <i className={`bi ${item.icon} me-2`}></i>{item.label}
                      </h5>
                      <p className="fs-3 fw-bold" style={{ color: '#3a3320' }}>{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Most Viewed + Categories */}
            <div className="row g-3 mb-4">
              <div className="col-lg-8">
                <div className="card h-100 shadow-sm" style={{ backgroundColor: '#f8f5e6', borderRadius: '12px' }}>
                  <div className="card-header" style={{ backgroundColor: '#3a3320', color: '#fff', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>Most Viewed Item</div>
                  <div className="card-body text-center">
                    {stats.mostViewedItem ? (
                      <>
                        <img
                          src={stats.mostViewedItem.image1_path && stats.mostViewedItem.image1_path.startsWith('/uploads/') 
                            ? stats.mostViewedItem.image1_path 
                            : stats.mostViewedItem.image1_path 
                              ? `/uploads/${stats.mostViewedItem.image1_path}` 
                              : 'https://placehold.co/400x300?text=No+Image'}
                          alt={stats.mostViewedItem.product_name || 'Product'}
                          className="img-fluid mb-3"
                          style={{ maxHeight: "300px" }}
                        />
                        <h5>{stats.mostViewedItem.product_name || 'Unnamed Product'}</h5>
                        <p>{stats.mostViewedItem.description || 'No description available.'}</p>
                      </>
                    ) : (
                      <p>No most viewed item data.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card h-100 shadow-sm" style={{ backgroundColor: '#f8f5e6', borderRadius: '12px' }}>
                  <div className="card-header" style={{ backgroundColor: '#3a3320', color: '#fff', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>Product Categories</div>
                  <div className="card-body d-flex justify-content-center align-items-center">
                    {stats.categories.length > 0 ? (
                      <Pie data={pieData} />
                    ) : <p>No category data available.</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Visitors */}
            <div className="row g-3 mb-4">
              <div className="col-lg-12">
                <div className="card h-100 shadow-sm">
                  <div className="card-header bg-primary text-white">Monthly Visitor Count</div>
                  <div className="card-body" style={{ height: "400px" }}>
                    {monthlyVisits.some(v => v > 0)
                      ? <Bar data={barData} options={{ maintainAspectRatio: false }} />
                      : <p className="text-center">No monthly visit data yet.</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Analytics */}
            <div className="row g-3 mb-4">
              {/* Revenue Summary Cards */}
              <div className="col-lg-6">
                <div className="card h-100 shadow-sm">
                  <div className="card-header text-white" style={{ backgroundColor: '#8B4513' }}>Revenue Summary</div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-6">
                        <h4 className="text-success">₱{revenueData.totalRevenue.toFixed(2)}</h4>
                        <p className="text-muted">Total Revenue</p>
                      </div>
                      <div className="col-6">
                        <h4 className="text-info">{revenueData.totalOrders}</h4>
                        <p className="text-muted">Total Orders</p>
                      </div>
                    </div>
                    {revenueData.topProducts.length > 0 && (
                      <div className="mt-3">
                        <h6>Top Selling Products:</h6>
                        <ul className="list-unstyled">
                          {revenueData.topProducts.slice(0, 3).map((product, index) => (
                            <li key={index} className="d-flex justify-content-between">
                              <span>{product.product_name}</span>
                              <span className="text-success">₱{parseFloat(product.revenue).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Revenue by Category */}
              <div className="col-lg-6">
                <div className="card h-100 shadow-sm">
                  <div className="card-header text-white" style={{ backgroundColor: '#8B4513' }}>Revenue by Category</div>
                  <div className="card-body" style={{ height: "300px" }}>
                    {revenueData.revenueByCategory.length > 0 ? (
                      <Bar data={revenueByCategoryData} options={chartOptions} />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <p className="text-muted">No revenue data yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="row g-3 mb-4">
              <div className="col-lg-12">
                <div className="card h-100 shadow-sm">
                  <div className="card-header text-white" style={{ backgroundColor: '#8B4513' }}>Monthly Revenue</div>
                  <div className="card-body" style={{ height: "400px" }}>
                    {revenueData.monthlyRevenue.some(v => v > 0) ? (
                      <Line data={monthlyRevenueData} options={chartOptions} />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <p className="text-muted">No monthly revenue data yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div className="row g-3">
              <div className="col-lg-12">
                <div className="card shadow-sm" style={{ backgroundColor: '#f8f5e6', borderRadius: '12px' }}>
                  <div className="card-header" style={{ backgroundColor: '#3a3320', color: '#fff', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>Quick Access</div>
                  <div className="list-group list-group-flush" style={{ backgroundColor: '#f8f5e6' }}>
                    <a href={`/seller/add-item/${sellerId}`} className="list-group-item list-group-item-action" style={{ backgroundColor: '#f8f5e6', color: '#3a3320', borderColor: '#e5dfc4' }}>
                      <i className="bi bi-plus-circle me-2"></i> Add New Product
                    </a>
                    <a href={`/seller/view-items/${sellerId}`} className="list-group-item list-group-item-action" style={{ backgroundColor: '#f8f5e6', color: '#3a3320', borderColor: '#e5dfc4' }}>
                      <i className="bi bi-list-check me-2"></i> Manage Products
                    </a>
                    <a href={`/seller/orders/${sellerId}`} className="list-group-item list-group-item-action" style={{ backgroundColor: '#f8f5e6', color: '#3a3320', borderColor: '#e5dfc4' }}>
                      <i className="bi bi-clipboard-check me-2"></i> View Orders
                    </a>
                    <a href="#" className="list-group-item list-group-item-action" style={{ backgroundColor: '#f8f5e6', color: '#3a3320', borderColor: '#e5dfc4' }}>
                      <i className="bi bi-graph-up me-2"></i> View Sales Reports
                    </a>
                    <a href="#" className="list-group-item list-group-item-action" style={{ backgroundColor: '#f8f5e6', color: '#3a3320', borderColor: '#e5dfc4' }}>
                      <i className="bi bi-gear me-2"></i> Account Settings
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
