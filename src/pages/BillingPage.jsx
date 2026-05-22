import { useMemo, useState } from 'react';
import { useHospital } from '../context/HospitalContext.jsx';
import { SearchIcon, PlusIcon } from '../components/Icons.jsx';

const BillingPage = () => {
  const { state, payBilling, addInvoice, addExpense, searchQuery, setSearchQuery } = useHospital();
  
  // Tab states
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'expenses'
  
  // Role checks
  const user = state.user;
  const isAdminOrReceptionist = user && (user.role === 'Admin' || user.role === 'Receptionist');

  // Selected invoice state for receipt printer view
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // New Invoice Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([{ name: 'Consultation Fee', amount: 500 }]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));

  // New Expense Form State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('Medical Equipment');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseError, setExpenseError] = useState('');

  // Local Search state for expenses
  const [expenseSearch, setExpenseSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');

  // Unified Revenue & Invoices logic
  const revenue = useMemo(() => state.billing.reduce((sum, invoice) => sum + invoice.totalAmount, 0), [state.billing]);
  const unpaid = useMemo(() => state.billing.filter((invoice) => invoice.status !== 'Paid'), [state.billing]);

  // Expenses summary metrics
  const totalExpenses = useMemo(() => {
    return (state.expenses || []).reduce((sum, item) => sum + item.amount, 0);
  }, [state.expenses]);

  const netSurplus = useMemo(() => {
    return revenue - totalExpenses;
  }, [revenue, totalExpenses]);

  // Expenses category distribution
  const expenseCategories = useMemo(() => {
    const categories = {
      'Medical Equipment': 0,
      'Pharmaceutical Supplies': 0,
      'Staff Payroll': 0,
      'Utilities & Facilities': 0,
      'Administrative Supplies': 0
    };
    (state.expenses || []).forEach(item => {
      const cat = item.category;
      if (categories[cat] !== undefined) {
        categories[cat] += item.amount;
      } else {
        categories[cat] = item.amount;
      }
    });
    return categories;
  }, [state.expenses]);

  // Invoices filtered by search
  const filteredBilling = useMemo(() => {
    const q = searchQuery || invoiceSearch;
    
    // For patients: filter to show ONLY their invoices
    let baseBilling = state.billing;
    if (user && user.role === 'Patient') {
      // Find patient profile matching user name or id
      const patientProfile = state.patients.find(p => p.name.toLowerCase() === user.name.toLowerCase());
      if (patientProfile) {
        baseBilling = state.billing.filter(invoice => invoice.patientId === patientProfile.id);
      } else {
        // Fallback search by patientName matches
        baseBilling = state.billing.filter(invoice => invoice.patientName.toLowerCase() === user.name.toLowerCase());
      }
    }

    if (!q) return baseBilling;
    return baseBilling.filter((invoice) => 
      invoice.patientName.toLowerCase().includes(q.toLowerCase()) ||
      invoice.id.toLowerCase().includes(q.toLowerCase()) ||
      invoice.status.toLowerCase().includes(q.toLowerCase())
    );
  }, [state.billing, invoiceSearch, searchQuery, user, state.patients]);

  // Expenses filtered by search
  const filteredExpenses = useMemo(() => {
    const q = expenseSearch.trim().toLowerCase();
    if (!q) return state.expenses || [];
    return (state.expenses || []).filter((item) => 
      item.id.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  }, [state.expenses, expenseSearch]);

  // Handle adding a new line item in create form
  const addLineItem = () => {
    setInvoiceItems([...invoiceItems, { name: '', amount: 0 }]);
  };

  // Handle removing a line item in create form
  const removeLineItem = (index) => {
    if (invoiceItems.length === 1) return;
    setInvoiceItems(invoiceItems.filter((_, idx) => idx !== index));
  };

  // Update line item in create form
  const updateLineItem = (index, field, value) => {
    const updated = [...invoiceItems];
    if (field === 'amount') {
      updated[index][field] = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setInvoiceItems(updated);
  };

  // Total calculation for the new invoice
  const newInvoiceTotal = useMemo(() => {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  }, [invoiceItems]);

  const handleSaveInvoice = (event) => {
    event.preventDefault();
    if (!patientId) return;

    const patient = state.patients.find(p => p.id === patientId);
    if (!patient) return;

    const newBill = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      patientId: patient.id,
      patientName: patient.name,
      date: invoiceDate,
      items: invoiceItems.map(item => ({
        description: item.name || 'Clinical Care',
        price: item.amount
      })),
      totalAmount: newInvoiceTotal,
      paidAmount: 0,
      status: 'Unpaid'
    };

    addInvoice(newBill);
    setShowCreateModal(false);
    setPatientId('');
    setInvoiceItems([{ name: 'Consultation Fee', amount: 500 }]);
  };

  // Handle saving operating expense with validation
  const handleSaveExpense = (event) => {
    event.preventDefault();
    setExpenseError('');

    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) {
      setExpenseError('Please enter a valid expense amount greater than zero.');
      return;
    }

    if (!expenseDescription.trim()) {
      setExpenseError('Please enter a description for the operating cost.');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    if (expenseDate > todayStr) {
      setExpenseError('Operating expenses cannot be registered in the future.');
      return;
    }

    const newCost = {
      id: `EXP-${Date.now().toString().slice(-6)}`,
      category: expenseCategory,
      amount: amt,
      date: expenseDate,
      description: expenseDescription.trim()
    };

    addExpense(newCost);
    setShowExpenseModal(false);
    setExpenseAmount('');
    setExpenseDescription('');
    setExpenseCategory('Medical Equipment');
    setExpenseDate(new Date().toISOString().slice(0, 10));
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="page-shell">
      <style>{`
        .finance-tabs-nav {
          display: flex;
          gap: 12px;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 12px;
          margin-bottom: 24px;
        }
        .finance-tab-btn {
          padding: 10px 20px;
          font-weight: 700;
          font-size: 0.88rem;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          border: 1px solid transparent;
        }
        .finance-tab-btn.active {
          color: var(--primary);
          background: var(--primary-glow);
          border-color: rgba(59, 130, 246, 0.15);
        }
        .expense-chart-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 900px) {
          .expense-chart-grid {
            grid-template-columns: 1fr;
          }
        }
        .expense-bar-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: rgba(255, 255, 255, 0.02);
          padding: 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }
      `}</style>

      <div className="page-head page-head-actions">
        <div>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Finance Operations</p>
          <h1>Financial Control & Ledger</h1>
          <p className="page-subtitle">
            {isAdminOrReceptionist 
              ? 'Unified financial dashboard, revenue invoices tracking, and corporate operating expenses ledger.' 
              : 'Secure patient invoice center and receipt collection registry.'}
          </p>
        </div>
        
        {isAdminOrReceptionist && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setShowExpenseModal(true)}>
              💸 Log Operating Cost
            </button>
            <button className="btn btn-primary" onClick={() => {
              if (state.patients.length > 0) {
                setPatientId(state.patients[0].id);
              }
              setShowCreateModal(true);
            }}>
              <PlusIcon size={16} /> Generate Invoice
            </button>
          </div>
        )}
      </div>

      {/* Tabs navigation for authorized roles */}
      {isAdminOrReceptionist && (
        <nav className="finance-tabs-nav">
          <button 
            type="button"
            className={`finance-tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoices')}
          >
            📑 Invoices & Revenue Ledger
          </button>
          <button 
            type="button"
            className={`finance-tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            📊 Operating Expenses & Budget
          </button>
        </nav>
      )}

      {/* RENDER INVOICES TAB */}
      {(activeTab === 'invoices' || !isAdminOrReceptionist) && (
        <>
          <section className="dashboard-grid" style={{ marginBottom: '20px' }}>
            <article className="glass-card metric-card">
              <span className="metric-label">Total Revenue Stream</span>
              <p className="metric-value">₹{revenue.toLocaleString()}</p>
            </article>
            <article className="glass-card metric-card">
              <span className="metric-label">Pending Collection Bills</span>
              <p className="metric-value">{unpaid.length}</p>
            </article>
            <article className="glass-card metric-card">
              <span className="metric-label">Outstanding Balances</span>
              <p className="metric-value">₹{unpaid.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString()}</p>
            </article>
          </section>

          <div className="glass-card search-panel" style={{ marginBottom: '20px' }}>
            <SearchIcon size={18} />
            <input 
              value={searchQuery || invoiceSearch} 
              onChange={(event) => {
                if (searchQuery !== '') {
                  setSearchQuery(event.target.value);
                } else {
                  setInvoiceSearch(event.target.value);
                }
              }} 
              placeholder="Search by invoice ID, patient name or status..." 
            />
          </div>

          <div className="glass-card billing-panel">
            <h3>Master Financial Ledger</h3>
            <div className="billing-table table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Patient Name</th>
                    <th>Issued Date</th>
                    <th>Grand Total</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBilling.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No invoices registered in general ledger.</td>
                    </tr>
                  ) : (
                    filteredBilling.map((invoice) => (
                      <tr className="table-row" key={invoice.id}>
                        <td>
                          <strong 
                            style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            {invoice.id}
                          </strong>
                        </td>
                        <td>{invoice.patientName}</td>
                        <td>{invoice.date}</td>
                        <td><strong>₹{invoice.totalAmount.toLocaleString()}</strong></td>
                        <td>
                          <span className={`badge badge-${invoice.status === 'Paid' ? 'success' : invoice.status === 'Unpaid' ? 'danger' : 'warning'}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="action-cell">
                          <button 
                            className="btn btn-secondary btn-sm" 
                            type="button" 
                            onClick={() => setSelectedInvoice(invoice)}
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            View Receipt &rarr;
                          </button>
                          {invoice.status !== 'Paid' && isAdminOrReceptionist && (
                            <button 
                              className="btn btn-success btn-sm" 
                              type="button" 
                              onClick={() => payBilling(invoice)}
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* RENDER OPERATING EXPENSES TAB (ADMIN & RECEPTIONIST ONLY) */}
      {activeTab === 'expenses' && isAdminOrReceptionist && (
        <>
          <section className="dashboard-grid" style={{ marginBottom: '20px' }}>
            <article className="glass-card metric-card">
              <span className="metric-label">Total Revenue Stream</span>
              <p className="metric-value" style={{ color: 'var(--success)' }}>₹{revenue.toLocaleString()}</p>
            </article>
            <article className="glass-card metric-card">
              <span className="metric-label">Total Operating Expenses</span>
              <p className="metric-value" style={{ color: 'var(--danger)' }}>₹{totalExpenses.toLocaleString()}</p>
            </article>
            <article className="glass-card metric-card">
              <span className="metric-label">{netSurplus >= 0 ? 'Operating Profit Surplus' : 'Operating Deficit / Loss'}</span>
              <p 
                className="metric-value" 
                style={{ 
                  background: netSurplus >= 0 
                    ? 'linear-gradient(135deg, var(--text-main) 30%, var(--success))' 
                    : 'linear-gradient(135deg, var(--text-main) 30%, var(--danger))',
                  WebkitTextFillColor: 'transparent',
                  WebkitBackgroundClip: 'text'
                }}
              >
                {netSurplus < 0 ? '-' : ''}₹{Math.abs(netSurplus).toLocaleString()}
              </p>
            </article>
          </section>

          {/* Breakdown Section */}
          <div className="expense-chart-grid" style={{ marginBottom: '24px' }}>
            <article className="glass-card widget-card">
              <h3>Operating Budget Category Allocation</h3>
              <p className="page-subtitle" style={{ marginBottom: '16px' }}>Dynamic category tracking and cost weight distribution.</p>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {Object.entries(expenseCategories).map(([cat, amount]) => {
                  const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                  let barColor = 'var(--primary)';
                  if (cat === 'Medical Equipment') barColor = 'var(--primary)';
                  else if (cat === 'Pharmaceutical Supplies') barColor = 'var(--success)';
                  else if (cat === 'Staff Payroll') barColor = 'var(--secondary)';
                  else if (cat === 'Utilities & Facilities') barColor = 'var(--warning)';
                  else barColor = 'var(--text-muted)';

                  return (
                    <div className="expense-bar-container" key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <span>{cat}</span>
                        <span>₹{amount.toLocaleString()} <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>({percentage}%)</span></span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                        <div style={{ height: '100%', width: `${percentage}%`, background: barColor, borderRadius: '999px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            {/* Quick Metrics Visualizer */}
            <article className="glass-card widget-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3>Corporate Profit Margin Analysis</h3>
                <p className="page-subtitle" style={{ marginBottom: '20px' }}>Analyzing the total yield performance ratio after logging expenses.</p>
                
                <div style={{ padding: '24px', background: 'rgba(59, 130, 246, 0.04)', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Current Gross Efficiency Yield</span>
                  <strong style={{ fontSize: '2rem', color: netSurplus >= 0 ? 'var(--success)' : 'var(--danger)', fontFamily: 'var(--font-title)', fontWeight: '800' }}>
                    {revenue > 0 ? ((netSurplus / revenue) * 100).toFixed(1) : '0.0'}%
                  </strong>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {netSurplus >= 0 
                      ? 'The hospital operating surplus is within optimized compliance metrics (Target > 15%).'
                      : 'Operating costs are currently exceeding patient billing collection logs.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)', textAlign: 'center' }}>
                  <strong style={{ display: 'block', fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>
                    ₹{(revenue > 0 ? (revenue / state.billing.length) : 0).toFixed(0)}
                  </strong>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Avg Invoice Value</small>
                </div>
                <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--secondary)', textAlign: 'center' }}>
                  <strong style={{ display: 'block', fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>
                    ₹{(state.expenses.length > 0 ? (totalExpenses / state.expenses.length) : 0).toFixed(0)}
                  </strong>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Avg Operating Cost</small>
                </div>
              </div>
            </article>
          </div>

          {/* Master Expenses Ledger Table */}
          <div className="glass-card search-panel" style={{ marginBottom: '20px' }}>
            <SearchIcon size={18} />
            <input 
              value={expenseSearch} 
              onChange={(event) => setExpenseSearch(event.target.value)} 
              placeholder="Search operating expenses by registry ID, category or description..." 
            />
          </div>

          <div className="glass-card billing-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3>Master Operating Expenses Ledger</h3>
              <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{filteredExpenses.length} Logs</span>
            </div>
            
            <div className="billing-table table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Expense ID</th>
                    <th>Category</th>
                    <th>Registered Date</th>
                    <th>Cost Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No expense logs matching your search filters.</td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => {
                      let badgeType = 'primary';
                      if (expense.category === 'Medical Equipment') badgeType = 'primary';
                      else if (expense.category === 'Pharmaceutical Supplies') badgeType = 'success';
                      else if (expense.category === 'Staff Payroll') badgeType = 'secondary';
                      else if (expense.category === 'Utilities & Facilities') badgeType = 'warning';
                      else badgeType = 'danger';

                      return (
                        <tr className="table-row" key={expense.id}>
                          <td><strong style={{ color: 'var(--primary)' }}>{expense.id}</strong></td>
                          <td>
                            <span className={`badge badge-${badgeType}`} style={{ fontSize: '0.65rem' }}>
                              {expense.category}
                            </span>
                          </td>
                          <td>{expense.date}</td>
                          <td style={{ color: 'var(--text-color)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={expense.description}>
                            {expense.description}
                          </td>
                          <td><strong style={{ color: 'var(--danger)' }}>₹{expense.amount.toLocaleString()}</strong></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* CREATE NEW INVOICE MODAL */}
      {showCreateModal && isAdminOrReceptionist && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>Issue Dynamic Billing Invoice</h2>
              <button className="icon-button" type="button" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <form className="auth-form" onSubmit={handleSaveInvoice}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label className="form-label">Select Patient</label>
                  <select 
                    className="form-input" 
                    value={patientId} 
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Patient --</option>
                    {state.patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id} - {p.status})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Invoice Date</label>
                  <input 
                    className="form-input" 
                    type="date" 
                    value={invoiceDate} 
                    onChange={(e) => setInvoiceDate(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {/* Line Items Builder */}
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0 }}>Invoice Line Items</h4>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={addLineItem}>
                    + Add Row
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '6px' }}>
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        className="form-input" 
                        placeholder="Item Description (e.g. Ward Charge)" 
                        value={item.name} 
                        onChange={e => updateLineItem(idx, 'name', e.target.value)}
                        required 
                        style={{ flex: 2 }}
                      />
                      <input 
                        className="form-input" 
                        type="number" 
                        placeholder="Price in ₹" 
                        value={item.amount || ''} 
                        onChange={e => updateLineItem(idx, 'amount', e.target.value)}
                        required 
                        style={{ flex: 1 }}
                      />
                      <button 
                        className="icon-button danger" 
                        type="button" 
                        onClick={() => removeLineItem(idx)}
                        disabled={invoiceItems.length === 1}
                        style={{ fontSize: '1.2rem', padding: '0 8px' }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '12px 0', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Grand Total</span>
                  <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{newInvoiceTotal.toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button className="btn btn-primary" type="submit">Publish Invoice</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG OPERATING EXPENSE MODAL */}
      {showExpenseModal && isAdminOrReceptionist && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>💸 Log Operating Cost Record</h2>
              <button className="icon-button" type="button" onClick={() => setShowExpenseModal(false)}>&times;</button>
            </div>
            
            <form className="auth-form" onSubmit={handleSaveExpense}>
              <div className="form-group">
                <label className="form-label">Expense Category</label>
                <select 
                  className="form-input"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                >
                  <option value="Medical Equipment">Medical Equipment</option>
                  <option value="Pharmaceutical Supplies">Pharmaceutical Supplies</option>
                  <option value="Staff Payroll">Staff Payroll</option>
                  <option value="Utilities & Facilities">Utilities & Facilities</option>
                  <option value="Administrative Supplies">Administrative Supplies</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Expense Amount (₹)</label>
                  <input 
                    className="form-input"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 15000"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expense Logged Date</label>
                  <input 
                    className="form-input"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cost / Service Description</label>
                <textarea 
                  className="form-input"
                  rows="3"
                  placeholder="Describe the operational cost in detail (e.g. ward calibration)..."
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  required
                />
              </div>

              {expenseError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.82rem', fontWeight: 'bold', margin: '8px 0' }}>
                  ⚠️ {expenseError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button className="btn btn-secondary" type="button" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit">Log Expense Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT-COMPATIBLE DETAILED RECEIPT MODAL */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content glass-card print-target" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: '30px' }}>
            {/* Printable Area Wrapper */}
            <div id="printable-receipt">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--primary)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ color: 'var(--primary)', margin: '0 0 4px 0', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Dhanvantari Health</h2>
                  <small style={{ color: 'var(--text-muted)' }}>Sector 12, Dwarka, New Delhi</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-color)' }}>INVOICE RECEIPT</h3>
                  <small style={{ color: 'var(--text-muted)' }}>ID: {selectedInvoice.id}</small>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Billed To:</span>
                  <strong>{selectedInvoice.patientName}</strong>
                  <div style={{ color: 'var(--text-muted)' }}>Patient ID: {selectedInvoice.patientId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Issued Date:</span>
                  <strong>{selectedInvoice.date}</strong>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`badge badge-${selectedInvoice.status === 'Paid' ? 'success' : 'danger'}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0' }}>Line Item Description</th>
                    <th style={{ textAlign: 'right', padding: '8px 0' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 0', color: 'var(--text-color)' }}>{item.description || item.desc}</td>
                        <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold' }}>₹{(item.price || item.cost).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 0', color: 'var(--text-color)' }}>General Hospitalization Charges</td>
                      <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold' }}>₹{selectedInvoice.totalAmount.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '16px 0 0 0', fontWeight: 'bold', fontSize: '1.1rem' }}>Grand Total Due (INR)</td>
                    <td style={{ padding: '16px 0 0 0', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>
                      ₹{selectedInvoice.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <p style={{ margin: '0 0 4px 0' }}>Thank you for choosing Dhanvantari Healthcare Services.</p>
                <small>This is a computer generated clinical invoice and does not require a physical seal.</small>
              </div>
            </div>

            {/* Actions Panel (Hidden during printing) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>Close Invoice</button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" onClick={triggerPrint}>🖨 Print Invoice</button>
                {selectedInvoice.status !== 'Paid' && isAdminOrReceptionist && (
                  <button className="btn btn-success" onClick={() => {
                    payBilling(selectedInvoice);
                    setSelectedInvoice(prev => ({ ...prev, status: 'Paid' }));
                  }}>Mark Paid</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
