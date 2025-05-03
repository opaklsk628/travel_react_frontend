import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface LoginRecord {
  _id: string;
  ip: string;
  userAgent: string;
  loggedAt: string;
  userId: { username: string; email: string; role: string };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      // 沒登入就導向登入頁
      navigate('/login');
      return;
    }

    // 取使用者, 登入紀錄
    adminService.getUsers().then(r => setUsers(r.data));
    adminService.getLoginRecords().then(r => setRecords(r.data));
  }, [token, navigate]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>

      <h2>User list</h2>
      <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{new Date(u.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '2rem' }}>Login redcord</h2>
      <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>IP</th>
            <th>User-Agent</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r._id}>
              <td>{r.userId?.username}</td>
              <td>{r.userId?.email}</td>
              <td>{r.ip}</td>
              <td style={{ maxWidth: 250, wordBreak: 'break-all' }}>{r.userAgent}</td>
              <td>{new Date(r.loggedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
