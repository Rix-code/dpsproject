import React, { useState, useEffect } from 'react';
import { User, DollarSign, Send, TrendingUp, Clock, Shield, Zap } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const VelocityBank = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    email: '', password: '', full_name: '', phone: '' 
  });
  const [transferForm, setTransferForm] = useState({
    from_account: '', to_account: '', amount: '', description: ''
  });

  useEffect(() => {
    if (token) {
      loadDashboard();
    }
  }, [token]);

  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiCall('/login', {
        method: 'POST',
        body: JSON.stringify(loginForm)
      });
      
      setToken(response.token);
      setUser({ id: response.user_id });
      setCurrentPage('dashboard');
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiCall('/register', {
        method: 'POST',
        body: JSON.stringify(registerForm)
      });
      
      setToken(response.token);
      setUser({ id: response.user_id });
      setCurrentPage('dashboard');
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
    setLoading(false);
  };

  const loadDashboard = async () => {
    if (!user?.id) return;
    
    try {
      const data = await apiCall(`/dashboard/${user.id}`);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiCall('/transfer', {
        method: 'POST',
        body: JSON.stringify({
          ...transferForm,
          amount: parseFloat(transferForm.amount)
        })
      });
      
      alert('Transfer successful!');
      setTransferForm({ from_account: '', to_account: '', amount: '', description: '' });
      loadDashboard();
    } catch (error) {
      alert('Transfer failed: ' + error.message);
    }
    setLoading(false);
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setDashboardData(null);
    setCurrentPage('landing');
  };

  const LandingPage = () => (
    <div className="landing-container">
      <div className="container">
        <nav className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <Zap className="form-icon" />
            <h1 className="text-3xl font-bold">VelocityBank</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentPage('login')}
              className="form-button"
            >
              Login
            </button>
            <button 
              onClick={() => setCurrentPage('register')}
              className="form-button"
            >
              Get Started
            </button>
          </div>
        </nav>

        <div className="text-center mb-16">
          <h2 className="landing-title">
            Banking at the speed of your ambition
          </h2>
          <p className="landing-subtitle">
            Join the financial revolution designed for digital-first professionals. 
            Experience instant everything, AI-powered wealth building, and career-linked banking.
          </p>
        </div>

        <div className="grid-container">
          <div className="grid-item">
            <TrendingUp className="form-icon" />
            <div>
              <h3 className="form-title">Instant Wealth Building</h3>
              <p className="form-subtitle">AI-powered micro-investing that works 24/7 to optimize your financial growth</p>
            </div>
          </div>
          
          <div className="grid-item">
            <Zap className="form-icon" />
            <div>
              <h3 className="form-title">Lightning-Fast Everything</h3>
              <p className="form-subtitle">Sub-second account opening, instant transfers, and real-time credit improvements</p>
            </div>
          </div>
          
          <div className="grid-item">
            <User className="form-icon" />
            <div>
              <h3 className="form-title">Career-Linked Banking</h3>
              <p className="form-subtitle">Specialized accounts that grow with your career and professional network</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LoginPage = () => (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-header">
          <Zap className="login-icon" />
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your VelocityBank account</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="form-input"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="form-button"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button
            onClick={() => setCurrentPage('register')}
            className="form-link"
          >
            Don't have an account? Sign up
          </button>
        </div>
        
        <div className="text-center mt-4">
          <button
            onClick={() => setCurrentPage('landing')}
            className="form-link"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  const RegisterPage = () => (
    <div className="landing-container">
      <div className="form-container">
        <div className="form-header">
          <Zap className="form-icon" />
          <h2 className="form-title">Join VelocityBank</h2>
          <p className="form-subtitle">Create your account in seconds</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={registerForm.full_name}
              onChange={(e) => setRegisterForm({...registerForm, full_name: e.target.value})}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <input
              type="tel"
              placeholder="Phone Number"
              value={registerForm.phone}
              onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
              className="form-input"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="form-button"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button
            onClick={() => setCurrentPage('login')}
            className="form-link"
          >
            Already have an account? Sign in
          </button>
        </div>
        
        <div className="text-center mt-4">
          <button
            onClick={() => setCurrentPage('landing')}
            className="form-link"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  const DashboardPage = () => (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <nav className="dashboard-header">
          <div className="flex items-center space-x-2">
            <Zap className="dashboard-subtitle" />
            <h1 className="text-3xl font-bold">VelocityBank</h1>
          </div>
          <div className="stat-card">
            <span className="text-gray-300">Welcome!</span>
            <button
              onClick={() => setCurrentPage('transfer')}
              className="form-button"
            >
              Transfer Money
            </button>
            <button
              onClick={logout}
              className="form-button"
            >
              Logout
            </button>
          </div>
        </nav>

        {dashboardData && (
          <div className="transactions-section">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Total Balance</h3>
                <DollarSign className="h-6 w-6 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-yellow-400">
                ${dashboardData.total_balance.toFixed(2)}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Active Accounts</h3>
                <Shield className="h-6 w-6 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-yellow-400">
                {dashboardData.accounts.length}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recent Activity</h3>
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-yellow-400">
                {dashboardData.recent_transactions.length}
              </p>
            </div>
          </div>
        )}

        <div className="transactions-section">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-6">Your Accounts</h3>
            {dashboardData?.accounts.map((account) => (
              <div key={account.id} className="bg-white/20 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-300">{account.account_type.toUpperCase()}</p>
                    <p className="font-mono text-sm">{account.account_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-400">
                      ${account.balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-6">Recent Transactions</h3>
            <div className="space-y-4">
              {dashboardData?.recent_transactions.map((transaction) => (
                <div key={transaction.id} className="bg-white/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-sm text-gray-300">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`text-right ${
                      transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <p className="font-bold">
                        {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TransferPage = () => (
    <div className="dashboard-container">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Send className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white">Transfer Money</h2>
          <p className="text-gray-300">Send money instantly</p>
        </div>
        
        <form onSubmit={handleTransfer} className="form-container">
          <div>
            <input
              type="text"
              placeholder="From Account Number"
              value={transferForm.from_account}
              onChange={(e) => setTransferForm({...transferForm, from_account: e.target.value})}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <input
              type="text"
              placeholder="To Account Number"
              value={transferForm.to_account}
              onChange={(e) => setTransferForm({...transferForm, to_account: e.target.value})}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <input
              type="number"
              placeholder="Amount"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <input
              type="text"
              placeholder="Description"
              value={transferForm.description}
              onChange={(e) => setTransferForm({...transferForm, description: e.target.value})}
              className="form-input"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="form-button"
          >
            {loading ? 'Processing...' : 'Send Money'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="form-link"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  // Main render logic
  if (token && user) {
    if (currentPage === 'transfer') {
      return <TransferPage />;
    }
    return <DashboardPage />;
  }

  switch (currentPage) {
    case 'login':
      return <LoginPage />;
    case 'register':
      return <RegisterPage />;
    default:
      return <LandingPage />;
  }
};

export default VelocityBank;