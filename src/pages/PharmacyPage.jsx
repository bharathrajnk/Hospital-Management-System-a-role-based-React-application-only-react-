import { useMemo, useState } from 'react';
import { useHospital } from '../context/HospitalContext.jsx';
import { SearchIcon, PlusIcon } from '../components/Icons.jsx';

const PharmacyPage = () => {
  const { state, addMedicine, payBilling, searchQuery, setSearchQuery } = useHospital();
  const [query, setQuery] = useState('');
  const [showStock, setShowStock] = useState(true);
  
  // Add medicine form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cardiovascular');
  const [stock, setStock] = useState('50');
  const [threshold, setThreshold] = useState('20');
  const [price, setPrice] = useState('15.0');

  const inventory = useMemo(() => {
    const q = searchQuery || query;
    return state.pharmacy.filter((item) => 
      item.name.toLowerCase().includes(q.toLowerCase()) || 
      item.category.toLowerCase().includes(q.toLowerCase())
    );
  }, [state.pharmacy, query, searchQuery]);

  const handleSaveMedicine = (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    addMedicine({
      id: `M${Date.now()}`,
      name: name.trim(),
      category,
      stock: parseInt(stock, 10) || 0,
      threshold: parseInt(threshold, 10) || 0,
      price: parseFloat(price) || 0
    });

    setShowAddForm(false);
    setName('');
    setCategory('Cardiovascular');
    setStock('50');
    setThreshold('20');
    setPrice('15.0');
  };

  return (
    <div className="page-shell">
      <div className="page-head page-head-actions">
        <div>
          <p className="eyebrow">Pharmacy & Billing</p>
          <h1>Inventory and Revenue</h1>
          <p className="page-subtitle">Track medication stock, billing status, and expense analytics in one control surface.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <PlusIcon size={16} /> Add Medicine
        </button>
      </div>

      <div className="glass-card search-panel">
        <SearchIcon size={18} />
        <input 
          value={searchQuery || query} 
          onChange={(event) => {
            if (searchQuery !== '') {
              setSearchQuery(event.target.value);
            } else {
              setQuery(event.target.value);
            }
          }} 
          placeholder="Search medicine or category..." 
        />
        <button type="button" className="btn btn-secondary" onClick={() => setShowStock((value) => !value)}>{showStock ? 'Hide Low Stock' : 'Show Low Stock'}</button>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card inventory-card">
          <h3>Medicine Inventory</h3>
          <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const lowStock = item.stock <= item.threshold;
                  if (!showStock && lowStock) return null;
                  return (
                    <tr className="table-row" key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.category}</td>
                      <td><span className={`badge badge-${lowStock ? 'danger' : 'success'}`}>{item.stock}</span></td>
                      <td>₹{item.price.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card analytics-card">
          <h3>Billing Snapshot</h3>
          <div className="billing-summary">
            <div>
              <span>Total Revenue</span>
              <strong>₹{state.billing.reduce((sum, invoice) => sum + invoice.totalAmount, 0).toLocaleString()}</strong>
            </div>
            <div>
              <span>Unpaid Invoices</span>
              <strong>{state.billing.filter((invoice) => invoice.status !== 'Paid').length}</strong>
            </div>
          </div>
          <div className="billing-list">
            {state.billing.slice(0, 4).map((invoice) => (
              <div key={invoice.id} className="billing-item" style={{ background: 'var(--bg-app)' }}>
                <div>
                  <strong>{invoice.id}</strong>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>{invoice.patientName}</p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                  <span>₹{invoice.totalAmount.toFixed(2)}</span>
                  <span className={`badge badge-${invoice.status === 'Paid' ? 'success' : invoice.status === 'Unpaid' ? 'danger' : 'warning'}`}>{invoice.status}</span>
                </div>
                {invoice.status !== 'Paid' && (
                  <button className="btn btn-secondary" type="button" onClick={() => payBilling(invoice)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Mark Paid</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Add Medicine to Inventory</h2>
              <button className="icon-button" type="button" onClick={() => setShowAddForm(false)}>&times;</button>
            </div>
            <form className="auth-form" onSubmit={handleSaveMedicine}>
              <div className="form-group">
                <label className="form-label">Medicine Name</label>
                <input 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="e.g. Paracetamol 650mg" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-input" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Cardiovascular</option>
                  <option>Cardiology</option>
                  <option>Analgesics</option>
                  <option>Respiratory</option>
                  <option>Endocrine</option>
                  <option>Antibiotics</option>
                  <option>General</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input 
                    className="form-input" 
                    type="number" 
                    value={stock} 
                    onChange={(e) => setStock(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Alert Threshold</label>
                  <input 
                    className="form-input" 
                    type="number" 
                    value={threshold} 
                    onChange={(e) => setThreshold(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Price per unit (₹)</label>
                <input 
                  className="form-input" 
                  type="number" 
                  step="0.01" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button className="btn btn-secondary" type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit">Save Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyPage;
