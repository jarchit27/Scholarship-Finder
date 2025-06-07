import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/get-user')
      .then(res => setUser(res.data.user))
      .catch(() => navigate('/login'));
  }, []);

  useEffect(() => {
    if (user) setForm({
      fullName: user.fullName || '',
      email:    user.email    || '',
      address:  user.address  || '',
      gender:   user.gender   || '',
      // …any other fields  
    });
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axiosInstance.put('/update-user', form);
      setUser({ ...user, ...form });
      setEditMode(false);
    } catch (err) {
      alert('Update failed');
    }
  };

  if (!user) return <p>Loading profile…</p>;

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      {!editMode ? (
        <div className="profile-view">
          <p><strong>Name:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Address:</strong> {user.address}</p>
          <p><strong>Gender:</strong> {user.gender}</p>
          {/* … */}
          <button onClick={() => setEditMode(true)}>Edit Details</button>
        </div>
      ) : (
        <div className="profile-edit">
          <label>
            Name<br/>
            <input name="fullName" value={form.fullName} onChange={handleChange}/>
          </label>
          <label>
            Address<br/>
            <input name="address" value={form.address} onChange={handleChange}/>
          </label>
          <label>
            Gender<br/>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          {/* …other fields */}
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
