import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import * as tf from "@tensorflow/tfjs";

/**
 * DEMAND FORECASTING APPLICATION
 * A comprehensive retail demand forecasting system with ML and Big Data capabilities
 * Features: Product category analysis, CSV upload, API integration, authentication
 */

// ==================== AUTHENTICATION COMPONENT ====================
const AuthScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Basic authentication (demo purposes - use proper auth in production)
    if (username === 'admin' && password === 'admin123') {
      onLogin({ username, role: 'admin' });
    } else if (username === 'analyst' && password === 'analyst123') {
      onLogin({ username, role: 'analyst' });
    } else {
      setError('Invalid credentials. Try admin/admin123 or analyst/analyst123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Helvetica Neue", sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        width: '400px',
        maxWidth: '90%'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
        }}>Demand Forecasting</h1>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Sign in to access analytics
        </p>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4A90E2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4A90E2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          
          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '0.75rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.85rem'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }}
          >
            Sign In
          </button>
        </form>
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#666'
        }}>
          <strong>Demo Credentials:</strong><br/>
          Admin: admin / admin123<br/>
          Analyst: analyst / analyst123
        </div>
      </div>
    </div>
  );
};

// ==================== MACHINE LEARNING MODEL ====================
class DemandForecastModel {
  constructor() {
    this.model = null;
    this.isTraining = false;
  }

  /**
   * Create a simple LSTM-like sequential model for time series forecasting
   * Uses TensorFlow.js for client-side ML
   */
  async createModel(inputShape) {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [inputShape], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1 })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return this.model;
  }

  /**
   * Normalize data for better ML performance
   */
  normalizeData(data) {
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return {
      normalized: values.map(v => (v - min) / (max - min)),
      min,
      max
    };
  }

  /**
   * Denormalize predictions back to original scale
   */
  denormalize(value, min, max) {
    return value * (max - min) + min;
  }

  /**
   * Train the model on historical data
   */
  async train(historicalData, epochs = 50) {
    this.isTraining = true;
    const { normalized, min, max } = this.normalizeData(historicalData);
    
    // Create training sequences
    const sequenceLength = 7; // Use 7 days to predict next day
    const xs = [];
    const ys = [];

    for (let i = 0; i < normalized.length - sequenceLength; i++) {
      xs.push(normalized.slice(i, i + sequenceLength));
      ys.push(normalized[i + sequenceLength]);
    }

    const xTensor = tf.tensor2d(xs);
    const yTensor = tf.tensor2d(ys, [ys.length, 1]);

    await this.createModel(sequenceLength);

    await this.model.fit(xTensor, yTensor, {
      epochs,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
        }
      }
    });

    this.isTraining = false;
    this.normalizationParams = { min, max };

    // Cleanup tensors
    xTensor.dispose();
    yTensor.dispose();

    return { min, max };
  }

  /**
   * Generate demand forecast for future periods
   */
  async predict(recentData, periods = 30) {
    if (!this.model) {
      throw new Error('Model not trained yet');
    }

    const { normalized } = this.normalizeData(recentData);
    const predictions = [];
    let sequence = normalized.slice(-7);

    for (let i = 0; i < periods; i++) {
      const inputTensor = tf.tensor2d([sequence]);
      const prediction = this.model.predict(inputTensor);
      const predValue = (await prediction.data())[0];
      
      predictions.push(
        this.denormalize(
          predValue,
          this.normalizationParams.min,
          this.normalizationParams.max
        )
      );

      sequence = [...sequence.slice(1), predValue];
      
      inputTensor.dispose();
      prediction.dispose();
    }

    return predictions;
  }
}

// ==================== MOCK DATA GENERATOR ====================
const generateMockData = () => {
  const categories = ['Electronics', 'Clothing', 'Food & Beverage', 'Home & Garden', 'Sports'];
  const products = {
    'Electronics': ['Smartphones', 'Laptops', 'Tablets', 'Headphones', 'Smart Watches'],
    'Clothing': ['T-Shirts', 'Jeans', 'Dresses', 'Shoes', 'Jackets'],
    'Food & Beverage': ['Snacks', 'Beverages', 'Dairy', 'Frozen Foods', 'Fresh Produce'],
    'Home & Garden': ['Furniture', 'Decor', 'Kitchen', 'Garden Tools', 'Lighting'],
    'Sports': ['Gym Equipment', 'Outdoor Gear', 'Athletic Wear', 'Bikes', 'Accessories']
  };

  const data = [];
  const startDate = new Date('2024-01-01');

  categories.forEach(category => {
    products[category].forEach(product => {
      for (let day = 0; day < 90; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + day);
        
        // Generate realistic sales patterns with seasonality and trends
        const baseValue = 100 + Math.random() * 50;
        const trend = day * 0.5;
        const seasonality = Math.sin(day / 7) * 20;
        const noise = (Math.random() - 0.5) * 30;
        
        data.push({
          date: date.toISOString().split('T')[0],
          category,
          product,
          sales: Math.max(0, Math.round(baseValue + trend + seasonality + noise)),
          revenue: Math.round((baseValue + trend + seasonality + noise) * (10 + Math.random() * 40)),
          inventory: Math.round(200 + Math.random() * 100)
        });
      }
    });
  });

  return data;
};

// ==================== MAIN DASHBOARD COMPONENT ====================
const DemandForecastingDashboard = ({ user, onLogout }) => {
  const [data, setData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [forecastData, setForecastData] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const mlModel = useRef(new DemandForecastModel());
  const fileInputRef = useRef(null);

  // Load mock data on mount
  useEffect(() => {
    const mockData = generateMockData();
    setData(mockData);
  }, []);

  // ==================== DATA FILTERING ====================
  const filteredData = data.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedProduct !== 'All' && item.product !== selectedProduct) return false;
    return true;
  });

  // ==================== AGGREGATIONS ====================
  const categories = ['All', ...new Set(data.map(d => d.category))];
  const products = selectedCategory === 'All' 
    ? ['All'] 
    : ['All', ...new Set(data.filter(d => d.category === selectedCategory).map(d => d.product))];

  // Category performance
  const categoryPerformance = categories.slice(1).map(cat => {
    const catData = data.filter(d => d.category === cat);
    return {
      category: cat,
      totalSales: catData.reduce((sum, d) => sum + d.sales, 0),
      totalRevenue: catData.reduce((sum, d) => sum + d.revenue, 0),
      avgInventory: catData.reduce((sum, d) => sum + d.inventory, 0) / catData.length
    };
  });

  // Time series aggregation
  const timeSeriesData = Object.values(
    filteredData.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = { date: item.date, sales: 0, revenue: 0, inventory: 0, count: 0 };
      }
      acc[item.date].sales += item.sales;
      acc[item.date].revenue += item.revenue;
      acc[item.date].inventory += item.inventory;
      acc[item.date].count += 1;
      return acc;
    }, {})
  ).map(d => ({
    ...d,
    avgInventory: Math.round(d.inventory / d.count)
  })).sort((a, b) => a.date.localeCompare(b.date));

  // ==================== ML TRAINING & PREDICTION ====================
  const trainModel = async () => {
    setIsTraining(true);
    try {
      const historicalSales = timeSeriesData.map(d => ({ value: d.sales }));
      await mlModel.current.train(historicalSales, 30);
      setModelTrained(true);
      
      // Generate forecast
      const predictions = await mlModel.current.predict(historicalSales, 30);
      const lastDate = new Date(timeSeriesData[timeSeriesData.length - 1].date);
      
      const forecast = predictions.map((sales, i) => {
        const forecastDate = new Date(lastDate);
        forecastDate.setDate(forecastDate.getDate() + i + 1);
        return {
          date: forecastDate.toISOString().split('T')[0],
          forecastedSales: Math.round(sales),
          type: 'forecast'
        };
      });
      
      setForecastData(forecast);
    } catch (error) {
      console.error('Training error:', error);
      alert('Error training model. Please try again.');
    }
    setIsTraining(false);
  };

  // ==================== CSV FILE UPLOAD ====================
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const parsedData = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((header, i) => {
              obj[header] = values[i]?.trim();
            });
            return obj;
          });

        setUploadedData(parsedData);
        alert(`Successfully uploaded ${parsedData.length} records from CSV`);
      } catch (error) {
        alert('Error parsing CSV file. Please check format.');
      }
    };
    reader.readAsText(file);
  };

  // ==================== API INTEGRATION ====================
  const fetchFromAPI = async () => {
    try {
      // Simulated API call (replace with actual endpoint)
      const simulatedAPIResponse = {
        success: true,
        data: generateMockData().slice(0, 50),
        timestamp: new Date().toISOString()
      };
      
      setApiData(simulatedAPIResponse.data);
      alert('Successfully fetched data from API');
    } catch (error) {
      alert('Error fetching from API. Using cached data.');
    }
  };

  // ==================== COMBINE FORECAST WITH HISTORICAL ====================
  const combinedChartData = [
    ...timeSeriesData.map(d => ({ ...d, type: 'historical' })),
    ...forecastData
  ];

  // ==================== CALCULATE KPIs ====================
  const totalSales = filteredData.reduce((sum, d) => sum + d.sales, 0);
  const totalRevenue = filteredData.reduce((sum, d) => sum + d.revenue, 0);
  const avgInventory = filteredData.reduce((sum, d) => sum + d.inventory, 0) / filteredData.length;
  const forecastedTotalSales = forecastData.reduce((sum, d) => sum + d.forecastedSales, 0);

  // ==================== UI COMPONENTS ====================
  const KPICard = ({ title, value, subtitle, color }) => (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      borderLeft: `4px solid ${color}`,
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
    }}>
      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: '500' }}>
        {title}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.25rem' }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.8rem', color: '#999' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  const TabButton = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      style={{
        padding: '0.75rem 1.5rem',
        background: isActive ? 'white' : 'transparent',
        color: isActive ? '#667eea' : '#666',
        border: 'none',
        borderBottom: isActive ? '3px solid #667eea' : '3px solid transparent',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: isActive ? '600' : '400',
        transition: 'all 0.2s',
        outline: 'none'
      }}
      onMouseOver={(e) => {
        if (!isActive) e.target.style.color = '#333';
      }}
      onMouseOut={(e) => {
        if (!isActive) e.target.style.color = '#666';
      }}
    >
      {label}
    </button>
  );

  // ==================== RENDER ====================
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fb',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1.5rem 2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
              Demand Forecasting Analytics
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
              Machine Learning Powered Retail Intelligence
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Welcome, {user.username}
            </span>
            <button
              onClick={onLogout}
              style={{
                padding: '0.5rem 1.25rem',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Tabs */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          gap: '0.5rem',
          padding: '0.5rem'
        }}>
          <TabButton label="Overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <TabButton label="Category Analysis" isActive={activeTab === 'category'} onClick={() => setActiveTab('category')} />
          <TabButton label="ML Forecasting" isActive={activeTab === 'forecast'} onClick={() => setActiveTab('forecast')} />
          <TabButton label="Data Sources" isActive={activeTab === 'data'} onClick={() => setActiveTab('data')} />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Filters */}
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#333'
                }}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedProduct('All');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#333'
                }}>Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                >
                  {products.map(prod => (
                    <option key={prod} value={prod}>{prod}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* KPIs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <KPICard
                title="Total Sales"
                value={totalSales.toLocaleString()}
                subtitle="units sold"
                color="#667eea"
              />
              <KPICard
                title="Total Revenue"
                value={`$${totalRevenue.toLocaleString()}`}
                subtitle="gross revenue"
                color="#f093fb"
              />
              <KPICard
                title="Avg Inventory"
                value={Math.round(avgInventory).toLocaleString()}
                subtitle="units in stock"
                color="#4facfe"
              />
              {modelTrained && (
                <KPICard
                  title="30-Day Forecast"
                  value={forecastedTotalSales.toLocaleString()}
                  subtitle="predicted sales"
                  color="#43e97b"
                />
              )}
            </div>

            {/* Sales Trend Chart */}
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{
                margin: '0 0 1.5rem 0',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1a1a1a'
              }}>Sales Trend Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#667eea"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Chart */}
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{
                margin: '0 0 1.5rem 0',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1a1a1a'
              }}>Revenue Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeriesData.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="revenue" fill="#f093fb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Category Analysis Tab */}
        {activeTab === 'category' && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {/* Category Performance Table */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                gridColumn: 'span 2'
              }}>
                <h3 style={{
                  margin: '0 0 1.5rem 0',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>Category Performance Comparison</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.9rem'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Category</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#333' }}>Total Sales</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#333' }}>Revenue</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#333' }}>Avg Inventory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryPerformance.map((cat, idx) => (
                        <tr
                          key={cat.category}
                          style={{
                            borderBottom: '1px solid #f0f0f0',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fb'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                        >
                          <td style={{ padding: '0.75rem', fontWeight: '500' }}>{cat.category}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>{cat.totalSales.toLocaleString()}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>${cat.totalRevenue.toLocaleString()}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>{Math.round(cat.avgInventory).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Category Distribution Charts */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{
                  margin: '0 0 1.5rem 0',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>Sales Distribution by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryPerformance}
                      dataKey="totalSales"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => entry.category}
                    >
                      {categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{
                  margin: '0 0 1.5rem 0',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>Revenue by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="totalRevenue" fill="#667eea" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* ML Forecasting Tab */}
        {activeTab === 'forecast' && (
          <>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>Machine Learning Demand Forecasting</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                  Train a neural network model on historical data to predict future demand
                </p>
              </div>

              <button
                onClick={trainModel}
                disabled={isTraining}
                style={{
                  padding: '0.875rem 2rem',
                  background: isTraining ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isTraining ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
                onMouseOver={(e) => {
                  if (!isTraining) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isTraining) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                  }
                }}
              >
                {isTraining ? 'Training Model...' : modelTrained ? 'Retrain Model' : 'Train ML Model'}
              </button>

              {isTraining && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#f0f7ff',
                  borderRadius: '8px',
                  color: '#0066cc',
                  fontSize: '0.9rem'
                }}>
                  🔄 Training neural network... This may take a moment.
                </div>
              )}

              {modelTrained && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#f0fff4',
                  borderRadius: '8px',
                  color: '#059669',
                  fontSize: '0.9rem'
                }}>
                  ✓ Model trained successfully! 30-day forecast generated.
                </div>
              )}
            </div>

            {modelTrained && (
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{
                  margin: '0 0 1.5rem 0',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>Historical Data vs ML Forecast</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={combinedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#667eea"
                      strokeWidth={2}
                      name="Historical Sales"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecastedSales"
                      stroke="#43e97b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Forecasted Sales"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* Data Sources Tab */}
        {activeTab === 'data' && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* CSV Upload */}
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  📄
                </div>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>CSV File Upload</h3>
                <p style={{
                  margin: '0 0 1.5rem 0',
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  Import historical sales data from CSV files
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Upload CSV
                </button>
                {uploadedData && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: '#f0fff4',
                    borderRadius: '6px',
                    color: '#059669',
                    fontSize: '0.85rem'
                  }}>
                    ✓ {uploadedData.length} records uploaded
                  </div>
                )}
              </div>

              {/* API Integration */}
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  borderRadius: '50%',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  🔌
                </div>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>REST API Integration</h3>
                <p style={{
                  margin: '0 0 1.5rem 0',
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  Fetch real-time data from external APIs
                </p>
                <button
                  onClick={fetchFromAPI}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Fetch from API
                </button>
                {apiData && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: '#f0fff4',
                    borderRadius: '6px',
                    color: '#059669',
                    fontSize: '0.85rem'
                  }}>
                    ✓ {apiData.length} records fetched
                  </div>
                )}
              </div>

              {/* Mock Data Generator */}
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: '50%',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  🎲
                </div>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>Mock Data</h3>
                <p style={{
                  margin: '0 0 1.5rem 0',
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  Generate simulated retail data for testing
                </p>
                <div style={{
                  padding: '0.75rem',
                  background: '#f8f9fb',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#666'
                }}>
                  ✓ Currently using {data.length.toLocaleString()} mock records
                </div>
              </div>
            </div>

            {/* Data Source Info */}
            <div style={{
              marginTop: '2rem',
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1a1a1a'
              }}>CSV Upload Format</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#666' }}>
                Your CSV file should contain the following columns:
              </p>
              <div style={{
                background: '#f8f9fb',
                padding: '1rem',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: '#333',
                overflowX: 'auto'
              }}>
                date,category,product,sales,revenue,inventory<br/>
                2024-01-01,Electronics,Smartphones,150,7500,250<br/>
                2024-01-02,Electronics,Smartphones,145,7250,248
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN APP COMPONENT ====================
export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <DemandForecastingDashboard user={user} onLogout={handleLogout} />;
}
