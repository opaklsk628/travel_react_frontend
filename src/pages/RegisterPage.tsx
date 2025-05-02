import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'operator'>('customer');
  const [operatorCode, setOperatorCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  const { register, isAuthenticated, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    clearError();
  }, [clearError]);
  
  const validateForm = () => {
    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return false;
    }
    
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return false;
    }
    
    if (role === 'operator' && !operatorCode) {
      setFormError("Operator code is required");
      return false;
    }
    
    setFormError(null);
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const userData = {
        username,
        email,
        password,
        role,
        ...(role === 'operator' && { operatorCode })
      };
      
      await register(userData);
    } catch (err) {
    }
  };
  
  return (
    <div>
      <h1>Create an Account</h1>
      
      {(error || formError) && (
        <div>
          {formError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input 
            type="text" 
            id="username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            minLength={6}
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label>Account Type</label>
          <div>
            <label>
              <input 
                type="radio" 
                name="role" 
                value="customer" 
                checked={role === 'customer'} 
                onChange={() => setRole('customer')} 
              />
              Customer
            </label>
            <label>
              <input 
                type="radio" 
                name="role" 
                value="operator" 
                checked={role === 'operator'} 
                onChange={() => setRole('operator')} 
              />
              Hotel Operator
            </label>
          </div>
        </div>
        
        {role === 'operator' && (
          <div>
            <label htmlFor="operatorCode">Operator Code</label>
            <input 
              type="text" 
              id="operatorCode" 
              value={operatorCode} 
              onChange={(e) => setOperatorCode(e.target.value)} 
              required={role === 'operator'} 
            />
            <small>This code is provided by the administrator.</small>
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      
      <div>
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;