import React from 'react';
import Navbar from '../Navbar';

export default function Header() {
  return (
    <header style={{ borderBottom: '1px solid #ccc' }}>

      <h1 style={{ margin: '0.5rem 1rem' }}>Travel Site</h1>


      <Navbar />
    </header>
  );
}
