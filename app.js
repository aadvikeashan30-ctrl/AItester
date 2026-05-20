/* ============================================================
   KOF CHITRADURGA - EMPLOYEE PORTAL APPLICATION
   Karnataka Co-operative Oilseeds Growers' Federation Ltd.
   ============================================================ */

const App = {
  currentUser: null,
  currentPage: 'dashboard',
  
  // Admin creates all credentials - no dummy data auto-creation
  // This stores admin-created employees
  employees: JSON.parse(localStorage.getItem('kof_employees') || '[]'),
  payslips: JSON.parse(localStorage.getItem('kof_payslips') || '[]'),
  leaves: JSON.parse(localStorage.getItem('kof_leaves') || '[]'),
  attendance: JSON.parse(localStorage.getItem('kof_attendance') || '[]'),
  announcements: JSON.parse(localStorage.getItem('kof_announcements') || '[]'),

  // Admin credentials (only admin can login initially and create employee accounts)
  adminCredentials: {
    username: 'admin',
    password: 'kof@admin2024'
  },

  init() {
    this.render();
    this.startClock();
  },

  save() {
    localStorage.setItem('kof_employees', JSON.stringify(this.employees));
    localStorage.setItem('kof_payslips', JSON.stringify(this.payslips));
    localStorage.setItem('kof_leaves', JSON.stringify(this.leaves));
    localStorage.setItem('kof_attendance', JSON.stringify(this.attendance));
    localStorage.setItem('kof_announcements', JSON.stringify(this.announcements));
  },

  render() {
    const app = document.getElementById('app');
    if (!this.currentUser) {
      app.innerHTML = this.renderLogin();
      this.bindLoginEvents();
    } else {
      app.innerHTML = this.renderDashboard();
      this.bindDashboardEvents();
      this.showPage(this.currentPage);
    }
  },


  renderLogin() {
    return `
      <div class="tricolor-bar"></div>
      <div class="login-page">
        <div class="floating-shapes">
          <div class="shape"></div>
          <div class="shape"></div>
          <div class="shape"></div>
        </div>
        <div class="login-container">
          <div class="login-header">
            <div class="govt-emblem"><i class="fas fa-seedling"></i></div>
            <h1>Employee Portal</h1>
            <p class="subtitle">Karnataka Co-operative Oilseeds Growers' Federation Ltd.</p>
            <p class="org-name">KOF Chitradurga Unit</p>
          </div>

          <div class="role-tabs">
            <button class="role-tab active" data-role="admin">
              <i class="fas fa-user-shield"></i> Admin
            </button>
            <button class="role-tab" data-role="employee">
              <i class="fas fa-user"></i> Employee
            </button>
          </div>

          <div class="login-error" id="loginError">
            <i class="fas fa-exclamation-circle"></i>
            <span id="errorText">Invalid credentials</span>
          </div>

          <form id="loginForm">
            <div class="form-group">
              <label>Username / Employee ID</label>
              <i class="fas fa-user input-icon"></i>
              <input type="text" id="loginUsername" placeholder="Enter your username" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <i class="fas fa-lock input-icon"></i>
              <input type="password" id="loginPassword" placeholder="Enter your password" required>
            </div>
            <button type="submit" class="login-btn">
              <i class="fas fa-sign-in-alt"></i> Sign In
            </button>
          </form>

          <div class="login-footer">
            <p><i class="fas fa-shield-alt"></i> Only administrators can create employee accounts.<br>
            Contact your administrator for login credentials.</p>
            <p style="margin-top: 10px; font-size: 10px; color: #bbb;">
              &copy; 2024 KOF Chitradurga | Government of Karnataka
            </p>
          </div>
        </div>
      </div>
    `;
  },


  renderDashboard() {
    const isAdmin = this.currentUser.role === 'admin';
    const userName = isAdmin ? 'Administrator' : this.currentUser.name;
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

    return `
      <div class="tricolor-bar"></div>
      <div class="dashboard active">
        <header class="top-header">
          <div class="header-left">
            <div class="header-logo"><i class="fas fa-seedling"></i></div>
            <div class="header-info">
              <h2>KOF Chitradurga</h2>
              <p>Karnataka Co-operative Oilseeds Growers' Federation</p>
            </div>
          </div>
          <div class="header-right">
            <div class="header-clock" id="headerClock">--:--:--</div>
            <div class="user-badge">
              <div class="user-avatar">${initials}</div>
              <span>${userName}</span>
            </div>
            <button class="logout-btn" id="logoutBtn">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>

        <aside class="sidebar">
          <nav class="sidebar-nav">
            <div class="nav-section">
              <div class="nav-section-title">Main Menu</div>
              <button class="nav-item active" data-page="dashboard">
                <i class="fas fa-home"></i> Dashboard
              </button>
              ${isAdmin ? this.getAdminNav() : this.getEmployeeNav()}
            </div>
            <div class="nav-section">
              <div class="nav-section-title">Information</div>
              <button class="nav-item" data-page="products">
                <i class="fas fa-boxes-stacked"></i> Our Products
              </button>
              <button class="nav-item" data-page="announcements">
                <i class="fas fa-bullhorn"></i> Announcements
                ${this.announcements.length > 0 ? '<span class="badge">' + this.announcements.length + '</span>' : ''}
              </button>
            </div>
          </nav>
        </aside>

        <div class="main-content">
          <div id="pageContent"></div>
        </div>
      </div>

      <div class="notification-toast" id="toast">
        <i class="fas fa-check-circle"></i>
        <span id="toastText">Success!</span>
      </div>
    `;
  },

  getAdminNav() {
    return `
      <button class="nav-item" data-page="manage-employees">
        <i class="fas fa-users-gear"></i> Manage Employees
      </button>
      <button class="nav-item" data-page="create-employee">
        <i class="fas fa-user-plus"></i> Create Employee
      </button>
      <button class="nav-item" data-page="manage-payslips">
        <i class="fas fa-file-invoice-dollar"></i> Manage Payslips
      </button>
      <button class="nav-item" data-page="manage-leaves">
        <i class="fas fa-calendar-check"></i> Manage Leaves
      </button>
      <button class="nav-item" data-page="manage-attendance">
        <i class="fas fa-clipboard-list"></i> Attendance
      </button>
      <button class="nav-item" data-page="post-announcement">
        <i class="fas fa-megaphone"></i> Post Announcement
      </button>
    `;
  },

  getEmployeeNav() {
    return `
      <button class="nav-item" data-page="my-payslips">
        <i class="fas fa-file-invoice-dollar"></i> My Payslips
      </button>
      <button class="nav-item" data-page="my-leaves">
        <i class="fas fa-calendar-alt"></i> My Leaves
      </button>
      <button class="nav-item" data-page="my-attendance">
        <i class="fas fa-clipboard-check"></i> My Attendance
      </button>
      <button class="nav-item" data-page="my-profile">
        <i class="fas fa-id-card"></i> My Profile
      </button>
    `;
  },


  showPage(page) {
    this.currentPage = page;
    const content = document.getElementById('pageContent');
    if (!content) return;

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    const isAdmin = this.currentUser.role === 'admin';
    
    switch(page) {
      case 'dashboard':
        content.innerHTML = isAdmin ? this.renderAdminDashboard() : this.renderEmployeeDashboard();
        break;
      case 'manage-employees':
        content.innerHTML = this.renderManageEmployees();
        break;
      case 'create-employee':
        content.innerHTML = this.renderCreateEmployee();
        this.bindCreateEmployeeEvents();
        break;
      case 'manage-payslips':
        content.innerHTML = this.renderManagePayslips();
        this.bindPayslipEvents();
        break;
      case 'manage-leaves':
        content.innerHTML = this.renderManageLeaves();
        this.bindLeaveManageEvents();
        break;
      case 'manage-attendance':
        content.innerHTML = this.renderManageAttendance();
        this.bindAttendanceEvents();
        break;
      case 'post-announcement':
        content.innerHTML = this.renderPostAnnouncement();
        this.bindAnnouncementEvents();
        break;
      case 'my-payslips':
        content.innerHTML = this.renderMyPayslips();
        break;
      case 'my-leaves':
        content.innerHTML = this.renderMyLeaves();
        this.bindLeaveRequestEvents();
        break;
      case 'my-attendance':
        content.innerHTML = this.renderMyAttendance();
        break;
      case 'my-profile':
        content.innerHTML = this.renderMyProfile();
        break;
      case 'products':
        content.innerHTML = this.renderProducts();
        break;
      case 'announcements':
        content.innerHTML = this.renderAnnouncements();
        break;
      default:
        content.innerHTML = '<p>Page not found</p>';
    }
  },


  renderAdminDashboard() {
    const totalEmp = this.employees.length;
    const pendingLeaves = this.leaves.filter(l => l.status === 'pending').length;
    const thisMonth = new Date().getMonth();
    const payslipsThisMonth = this.payslips.filter(p => new Date(p.date).getMonth() === thisMonth).length;
    const todayStr = new Date().toISOString().split('T')[0];
    const presentToday = this.attendance.filter(a => a.date === todayStr && a.status === 'present').length;

    return `
      <div class="welcome-banner animate-in">
        <h2><i class="fas fa-chart-line"></i> Welcome, Administrator</h2>
        <p>Manage your organization's employees, payslips, leaves and attendance from this panel.</p>
        <div class="date-display"><i class="far fa-calendar"></i> ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card saffron animate-in animate-delay-1">
          <div class="stat-icon"><i class="fas fa-users"></i></div>
          <div class="stat-value">${totalEmp}</div>
          <div class="stat-label">Total Employees</div>
        </div>
        <div class="stat-card blue animate-in animate-delay-2">
          <div class="stat-icon"><i class="fas fa-user-check"></i></div>
          <div class="stat-value">${presentToday}</div>
          <div class="stat-label">Present Today</div>
        </div>
        <div class="stat-card green animate-in animate-delay-3">
          <div class="stat-icon"><i class="fas fa-file-invoice"></i></div>
          <div class="stat-value">${payslipsThisMonth}</div>
          <div class="stat-label">Payslips This Month</div>
        </div>
        <div class="stat-card red animate-in animate-delay-4">
          <div class="stat-icon"><i class="fas fa-clock"></i></div>
          <div class="stat-value">${pendingLeaves}</div>
          <div class="stat-label">Pending Leave Requests</div>
        </div>
      </div>

      <div class="content-grid">
        <div class="card animate-in animate-delay-3">
          <div class="card-header">
            <h3><i class="fas fa-users" style="margin-right:8px; color: var(--primary-light)"></i> Recent Employees</h3>
          </div>
          <div class="card-body">
            ${totalEmp === 0 ? 
              '<div style="text-align:center; padding: 40px; color: var(--text-light);"><i class="fas fa-user-plus" style="font-size:40px; margin-bottom:12px; display:block; opacity:0.3;"></i><p>No employees created yet.<br>Go to "Create Employee" to add staff.</p></div>' :
              this.renderEmployeeTable(this.employees.slice(-5))
            }
          </div>
        </div>
        <div class="card animate-in animate-delay-4">
          <div class="card-header">
            <h3><i class="fas fa-bell" style="margin-right:8px; color: var(--warning)"></i> Pending Actions</h3>
          </div>
          <div class="card-body">
            ${pendingLeaves === 0 ? 
              '<div style="text-align:center; padding: 30px; color: var(--text-light);"><i class="fas fa-check-circle" style="font-size:36px; color: var(--success); margin-bottom:10px; display:block;"></i><p>All caught up! No pending actions.</p></div>' :
              this.leaves.filter(l => l.status === 'pending').slice(0, 4).map(l => {
                const emp = this.employees.find(e => e.id === l.employeeId);
                return `<div class="announcement-item">
                  <div class="ann-date"><i class="far fa-clock"></i> ${l.fromDate} to ${l.toDate}</div>
                  <div class="ann-title">${emp ? emp.name : 'Unknown'} - ${l.leaveType}</div>
                  <div class="ann-body">${l.reason}</div>
                </div>`;
              }).join('')
            }
          </div>
        </div>
      </div>
    `;
  },


  renderEmployeeDashboard() {
    const emp = this.currentUser;
    const myLeaves = this.leaves.filter(l => l.employeeId === emp.id);
    const approvedLeaves = myLeaves.filter(l => l.status === 'approved').length;
    const pendingLeaves = myLeaves.filter(l => l.status === 'pending').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const myAttendance = this.attendance.filter(a => a.employeeId === emp.id);
    const presentDays = myAttendance.filter(a => a.status === 'present').length;
    const myPayslips = this.payslips.filter(p => p.employeeId === emp.id);

    return `
      <div class="welcome-banner animate-in">
        <h2><i class="fas fa-hand-wave"></i> Welcome, ${emp.name}</h2>
        <p>${emp.designation} | ${emp.department}</p>
        <div class="date-display"><i class="far fa-calendar"></i> ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card saffron animate-in animate-delay-1">
          <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
          <div class="stat-value">${presentDays}</div>
          <div class="stat-label">Days Present</div>
        </div>
        <div class="stat-card blue animate-in animate-delay-2">
          <div class="stat-icon"><i class="fas fa-file-invoice-dollar"></i></div>
          <div class="stat-value">${myPayslips.length}</div>
          <div class="stat-label">Payslips Generated</div>
        </div>
        <div class="stat-card green animate-in animate-delay-3">
          <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
          <div class="stat-value">${approvedLeaves}</div>
          <div class="stat-label">Leaves Approved</div>
        </div>
        <div class="stat-card red animate-in animate-delay-4">
          <div class="stat-icon"><i class="fas fa-hourglass-half"></i></div>
          <div class="stat-value">${pendingLeaves}</div>
          <div class="stat-label">Leaves Pending</div>
        </div>
      </div>

      <div class="content-grid">
        <div class="card animate-in animate-delay-3">
          <div class="card-header">
            <h3><i class="fas fa-bullhorn" style="margin-right:8px; color: var(--warning)"></i> Latest Announcements</h3>
          </div>
          <div class="card-body">
            ${this.announcements.length === 0 ? 
              '<div style="text-align:center; padding:30px; color:var(--text-light)"><i class="fas fa-inbox" style="font-size:36px; margin-bottom:10px; display:block; opacity:0.3"></i><p>No announcements yet</p></div>' :
              this.announcements.slice(-3).reverse().map(a => `
                <div class="announcement-item">
                  <div class="ann-date"><i class="far fa-clock"></i> ${a.date}</div>
                  <div class="ann-title">${a.title}</div>
                  <div class="ann-body">${a.body}</div>
                </div>
              `).join('')
            }
          </div>
        </div>
        <div class="card animate-in animate-delay-4">
          <div class="card-header">
            <h3><i class="fas fa-bolt" style="margin-right:8px; color: var(--accent)"></i> Quick Actions</h3>
          </div>
          <div class="card-body">
            <div class="quick-actions">
              <button class="quick-action-btn" onclick="App.showPage('my-payslips')">
                <i class="fas fa-file-invoice-dollar"></i>
                <div><div class="action-text">View Payslips</div><div class="action-desc">Download salary slips</div></div>
              </button>
              <button class="quick-action-btn" onclick="App.showPage('my-leaves')">
                <i class="fas fa-paper-plane"></i>
                <div><div class="action-text">Apply Leave</div><div class="action-desc">Request time off</div></div>
              </button>
              <button class="quick-action-btn" onclick="App.showPage('my-attendance')">
                <i class="fas fa-calendar-days"></i>
                <div><div class="action-text">Attendance</div><div class="action-desc">View attendance record</div></div>
              </button>
              <button class="quick-action-btn" onclick="App.showPage('my-profile')">
                <i class="fas fa-id-badge"></i>
                <div><div class="action-text">My Profile</div><div class="action-desc">View your details</div></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },


  renderEmployeeTable(list) {
    if (list.length === 0) return '<p style="color:var(--text-light); text-align:center; padding: 20px;">No employees found</p>';
    return `
      <table class="data-table">
        <thead>
          <tr><th>Name</th><th>Employee ID</th><th>Department</th><th>Designation</th></tr>
        </thead>
        <tbody>
          ${list.map(e => `
            <tr>
              <td><strong>${e.name}</strong></td>
              <td>${e.empId}</td>
              <td>${e.department}</td>
              <td>${e.designation}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  renderManageEmployees() {
    return `
      <h2 class="section-title animate-in">Manage Employees</h2>
      <p class="section-subtitle animate-in animate-delay-1">View and manage all registered employees</p>
      
      <div class="card animate-in animate-delay-2">
        <div class="card-header">
          <h3>All Employees (${this.employees.length})</h3>
          <button class="btn-primary" onclick="App.showPage('create-employee')">
            <i class="fas fa-plus"></i> Add New
          </button>
        </div>
        <div class="card-body">
          ${this.employees.length === 0 ? 
            '<div style="text-align:center; padding:50px; color:var(--text-light)"><i class="fas fa-users" style="font-size:50px; margin-bottom:16px; display:block; opacity:0.2"></i><p style="font-size:15px">No employees registered yet</p><p style="font-size:13px; margin-top:8px">Click "Add New" to create employee accounts</p></div>' :
            `<table class="data-table">
              <thead>
                <tr><th>Name</th><th>Emp ID</th><th>Department</th><th>Designation</th><th>Phone</th><th>Actions</th></tr>
              </thead>
              <tbody>
                ${this.employees.map(e => `
                  <tr>
                    <td><strong>${e.name}</strong></td>
                    <td>${e.empId}</td>
                    <td>${e.department}</td>
                    <td>${e.designation}</td>
                    <td>${e.phone || '-'}</td>
                    <td>
                      <button onclick="App.deleteEmployee('${e.id}')" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:14px;" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
          }
        </div>
      </div>
    `;
  },


  renderCreateEmployee() {
    return `
      <h2 class="section-title animate-in">Create Employee Account</h2>
      <p class="section-subtitle animate-in animate-delay-1">Add new employee credentials and details to the portal</p>
      
      <div class="card animate-in animate-delay-2">
        <div class="card-header">
          <h3><i class="fas fa-user-plus" style="margin-right:8px; color: var(--primary-light)"></i> New Employee Registration</h3>
        </div>
        <div class="card-body">
          <form class="admin-form" id="createEmployeeForm">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="empName" placeholder="Enter full name" required>
              </div>
              <div class="form-group">
                <label>Employee ID *</label>
                <input type="text" id="empId" placeholder="e.g. KOF-001" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Department *</label>
                <select id="empDept" required>
                  <option value="">Select Department</option>
                  <option value="Administration">Administration</option>
                  <option value="Accounts & Finance">Accounts & Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="Storage & Warehouse">Storage & Warehouse</option>
                  <option value="Transport">Transport</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>
              <div class="form-group">
                <label>Designation *</label>
                <input type="text" id="empDesignation" placeholder="e.g. Manager, Clerk" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="empPhone" placeholder="Mobile number">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="empEmail" placeholder="Email address">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Login Username *</label>
                <input type="text" id="empUsername" placeholder="Login username for employee" required>
              </div>
              <div class="form-group">
                <label>Login Password *</label>
                <input type="text" id="empPassword" placeholder="Set initial password" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date of Joining</label>
                <input type="date" id="empDoj">
              </div>
              <div class="form-group">
                <label>Basic Salary (₹)</label>
                <input type="number" id="empSalary" placeholder="Monthly basic salary">
              </div>
            </div>
            <div style="margin-top: 24px; display: flex; gap: 12px;">
              <button type="submit" class="btn-primary">
                <i class="fas fa-check"></i> Create Employee Account
              </button>
              <button type="button" class="btn-secondary" onclick="App.showPage('manage-employees')">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },


  renderManagePayslips() {
    return `
      <h2 class="section-title animate-in">Manage Payslips</h2>
      <p class="section-subtitle animate-in animate-delay-1">Generate and manage employee salary slips</p>
      
      ${this.employees.length === 0 ? 
        '<div class="card animate-in animate-delay-2"><div class="card-body" style="text-align:center; padding:50px; color:var(--text-light)"><i class="fas fa-user-plus" style="font-size:40px; margin-bottom:12px; display:block; opacity:0.3"></i><p>Create employees first before generating payslips</p></div></div>' :
        `<div class="card animate-in animate-delay-2">
          <div class="card-header">
            <h3><i class="fas fa-file-invoice-dollar" style="margin-right:8px; color: var(--success)"></i> Generate Payslip</h3>
          </div>
          <div class="card-body">
            <form class="admin-form" id="payslipForm">
              <div class="form-row">
                <div class="form-group">
                  <label>Select Employee *</label>
                  <select id="payEmpId" required>
                    <option value="">Choose Employee</option>
                    ${this.employees.map(e => `<option value="${e.id}">${e.name} (${e.empId})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>Month & Year *</label>
                  <input type="month" id="payMonth" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Basic Pay (₹) *</label>
                  <input type="number" id="payBasic" placeholder="Basic salary" required>
                </div>
                <div class="form-group">
                  <label>DA (₹)</label>
                  <input type="number" id="payDA" placeholder="Dearness Allowance" value="0">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>HRA (₹)</label>
                  <input type="number" id="payHRA" placeholder="House Rent Allowance" value="0">
                </div>
                <div class="form-group">
                  <label>Other Allowances (₹)</label>
                  <input type="number" id="payOther" placeholder="Other allowances" value="0">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>PF Deduction (₹)</label>
                  <input type="number" id="payPF" placeholder="Provident Fund" value="0">
                </div>
                <div class="form-group">
                  <label>Tax Deduction (₹)</label>
                  <input type="number" id="payTax" placeholder="Income Tax" value="0">
                </div>
              </div>
              <button type="submit" class="btn-primary" style="margin-top: 16px;">
                <i class="fas fa-receipt"></i> Generate Payslip
              </button>
            </form>
          </div>
        </div>

        ${this.payslips.length > 0 ? `
          <div class="card animate-in animate-delay-3" style="margin-top:24px">
            <div class="card-header"><h3>Generated Payslips (${this.payslips.length})</h3></div>
            <div class="card-body">
              <table class="data-table">
                <thead><tr><th>Employee</th><th>Month</th><th>Net Pay</th><th>Date</th></tr></thead>
                <tbody>
                  ${this.payslips.slice(-10).reverse().map(p => {
                    const emp = this.employees.find(e => e.id === p.employeeId);
                    return `<tr><td>${emp ? emp.name : 'N/A'}</td><td>${p.month}</td><td style="font-weight:700; color:var(--success)">₹${p.netPay.toLocaleString()}</td><td>${p.date}</td></tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      `}
    `;
  },


  renderManageLeaves() {
    return `
      <h2 class="section-title animate-in">Manage Leave Requests</h2>
      <p class="section-subtitle animate-in animate-delay-1">Approve or reject employee leave applications</p>
      
      <div class="card animate-in animate-delay-2">
        <div class="card-header">
          <h3>Leave Applications (${this.leaves.length})</h3>
        </div>
        <div class="card-body">
          ${this.leaves.length === 0 ? 
            '<div style="text-align:center; padding:50px; color:var(--text-light)"><i class="fas fa-inbox" style="font-size:40px; margin-bottom:12px; display:block; opacity:0.3"></i><p>No leave requests yet</p></div>' :
            `<table class="data-table">
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                ${this.leaves.map(l => {
                  const emp = this.employees.find(e => e.id === l.employeeId);
                  return `<tr>
                    <td><strong>${emp ? emp.name : 'Unknown'}</strong></td>
                    <td>${l.leaveType}</td>
                    <td>${l.fromDate}</td>
                    <td>${l.toDate}</td>
                    <td style="max-width:150px; overflow:hidden; text-overflow:ellipsis">${l.reason}</td>
                    <td><span class="status-badge ${l.status}">${l.status.charAt(0).toUpperCase() + l.status.slice(1)}</span></td>
                    <td>
                      ${l.status === 'pending' ? `
                        <button onclick="App.updateLeaveStatus('${l.id}','approved')" style="background:var(--success); color:white; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:11px; margin-right:4px"><i class="fas fa-check"></i></button>
                        <button onclick="App.updateLeaveStatus('${l.id}','rejected')" style="background:var(--danger); color:white; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:11px"><i class="fas fa-times"></i></button>
                      ` : '-'}
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>`
          }
        </div>
      </div>
    `;
  },

  renderManageAttendance() {
    const today = new Date().toISOString().split('T')[0];
    return `
      <h2 class="section-title animate-in">Mark Attendance</h2>
      <p class="section-subtitle animate-in animate-delay-1">Record daily attendance for employees</p>
      
      ${this.employees.length === 0 ? 
        '<div class="card animate-in animate-delay-2"><div class="card-body" style="text-align:center; padding:50px; color:var(--text-light)"><p>Create employees first to mark attendance</p></div></div>' :
        `<div class="card animate-in animate-delay-2">
          <div class="card-header">
            <h3><i class="fas fa-clipboard-list" style="margin-right:8px; color: var(--info)"></i> Today's Attendance - ${new Date().toLocaleDateString('en-IN')}</h3>
          </div>
          <div class="card-body">
            <form id="attendanceForm">
              <table class="data-table">
                <thead><tr><th>Employee</th><th>Emp ID</th><th>Status</th></tr></thead>
                <tbody>
                  ${this.employees.map(e => {
                    const existing = this.attendance.find(a => a.employeeId === e.id && a.date === today);
                    return `<tr>
                      <td><strong>${e.name}</strong></td>
                      <td>${e.empId}</td>
                      <td>
                        <select class="att-select" data-emp-id="${e.id}" style="padding:8px 12px; border:2px solid #e8ecf0; border-radius:8px; font-family:inherit; font-size:13px;">
                          <option value="present" ${existing && existing.status === 'present' ? 'selected' : ''}>Present</option>
                          <option value="absent" ${existing && existing.status === 'absent' ? 'selected' : ''}>Absent</option>
                          <option value="half-day" ${existing && existing.status === 'half-day' ? 'selected' : ''}>Half Day</option>
                          <option value="on-leave" ${existing && existing.status === 'on-leave' ? 'selected' : ''}>On Leave</option>
                        </select>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
              <button type="submit" class="btn-primary" style="margin-top:20px">
                <i class="fas fa-save"></i> Save Attendance
              </button>
            </form>
          </div>
        </div>`
      }
    `;
  },


  renderPostAnnouncement() {
    return `
      <h2 class="section-title animate-in">Post Announcement</h2>
      <p class="section-subtitle animate-in animate-delay-1">Publish announcements visible to all employees</p>
      
      <div class="card animate-in animate-delay-2">
        <div class="card-header">
          <h3><i class="fas fa-bullhorn" style="margin-right:8px; color: var(--accent)"></i> New Announcement</h3>
        </div>
        <div class="card-body">
          <form class="admin-form" id="announcementForm">
            <div class="form-group" style="margin-bottom:16px">
              <label>Title *</label>
              <input type="text" id="annTitle" placeholder="Announcement title" required>
            </div>
            <div class="form-group" style="margin-bottom:16px">
              <label>Message *</label>
              <textarea id="annBody" rows="4" placeholder="Write your announcement..." required style="width:100%; padding:12px 16px; border:2px solid #e8ecf0; border-radius:10px; font-family:inherit; font-size:14px; resize:vertical;"></textarea>
            </div>
            <button type="submit" class="btn-primary">
              <i class="fas fa-paper-plane"></i> Publish Announcement
            </button>
          </form>
        </div>
      </div>

      ${this.announcements.length > 0 ? `
        <div class="card animate-in animate-delay-3" style="margin-top:24px">
          <div class="card-header"><h3>Previous Announcements</h3></div>
          <div class="card-body">
            ${this.announcements.slice().reverse().map(a => `
              <div class="announcement-item">
                <div class="ann-date"><i class="far fa-clock"></i> ${a.date}</div>
                <div class="ann-title">${a.title}</div>
                <div class="ann-body">${a.body}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  },


  renderMyPayslips() {
    const myPayslips = this.payslips.filter(p => p.employeeId === this.currentUser.id);
    return `
      <h2 class="section-title animate-in">My Payslips</h2>
      <p class="section-subtitle animate-in animate-delay-1">View your salary details and download payslips</p>
      
      ${myPayslips.length === 0 ? 
        `<div class="card animate-in animate-delay-2"><div class="card-body" style="text-align:center; padding:60px; color:var(--text-light)">
          <i class="fas fa-file-invoice-dollar" style="font-size:50px; margin-bottom:16px; display:block; opacity:0.2"></i>
          <p style="font-size:15px">No payslips generated yet</p>
          <p style="font-size:13px; margin-top:8px">Your payslips will appear here once generated by the administrator</p>
        </div></div>` :
        myPayslips.slice().reverse().map(p => `
          <div class="payslip-card animate-in animate-delay-2" style="margin-bottom:20px">
            <div class="payslip-header">
              <h3><i class="fas fa-file-invoice-dollar"></i> Salary Slip - ${p.month}</h3>
              <p>Generated on ${p.date} | Employee: ${this.currentUser.name} (${this.currentUser.empId})</p>
            </div>
            <div class="payslip-body">
              <div class="payslip-row"><span class="label">Basic Pay</span><span class="value credit">₹${p.basic.toLocaleString()}</span></div>
              <div class="payslip-row"><span class="label">Dearness Allowance (DA)</span><span class="value credit">₹${p.da.toLocaleString()}</span></div>
              <div class="payslip-row"><span class="label">House Rent Allowance (HRA)</span><span class="value credit">₹${p.hra.toLocaleString()}</span></div>
              <div class="payslip-row"><span class="label">Other Allowances</span><span class="value credit">₹${p.other.toLocaleString()}</span></div>
              <div class="payslip-row"><span class="label">PF Deduction</span><span class="value debit">- ₹${p.pf.toLocaleString()}</span></div>
              <div class="payslip-row"><span class="label">Tax Deduction</span><span class="value debit">- ₹${p.tax.toLocaleString()}</span></div>
              <div class="payslip-row"><span class="label" style="font-weight:700; color:var(--text)">Net Pay</span><span class="value" style="font-size:18px; color:var(--success)">₹${p.netPay.toLocaleString()}</span></div>
            </div>
          </div>
        `).join('')
      }
    `;
  },

  renderMyLeaves() {
    const myLeaves = this.leaves.filter(l => l.employeeId === this.currentUser.id);
    return `
      <h2 class="section-title animate-in">My Leaves</h2>
      <p class="section-subtitle animate-in animate-delay-1">Apply for leave and track your applications</p>
      
      <div class="leave-balance-grid animate-in animate-delay-2">
        <div class="leave-balance-card">
          <div class="leave-count" style="color: var(--info)">12</div>
          <div class="leave-total">/ 12 days</div>
          <div class="leave-type">Casual Leave</div>
          <div class="leave-bar"><div class="leave-bar-fill" style="width:100%"></div></div>
        </div>
        <div class="leave-balance-card">
          <div class="leave-count" style="color: var(--success)">15</div>
          <div class="leave-total">/ 15 days</div>
          <div class="leave-type">Earned Leave</div>
          <div class="leave-bar"><div class="leave-bar-fill" style="width:100%"></div></div>
        </div>
        <div class="leave-balance-card">
          <div class="leave-count" style="color: var(--warning)">10</div>
          <div class="leave-total">/ 10 days</div>
          <div class="leave-type">Sick Leave</div>
          <div class="leave-bar"><div class="leave-bar-fill" style="width:100%"></div></div>
        </div>
      </div>

      <div class="card animate-in animate-delay-3">
        <div class="card-header">
          <h3><i class="fas fa-paper-plane" style="margin-right:8px; color:var(--primary-light)"></i> Apply for Leave</h3>
        </div>
        <div class="card-body">
          <form class="admin-form" id="leaveRequestForm">
            <div class="form-row">
              <div class="form-group">
                <label>Leave Type *</label>
                <select id="leaveType" required>
                  <option value="">Select Type</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Compensatory Off">Compensatory Off</option>
                </select>
              </div>
              <div class="form-group">
                <label>Reason *</label>
                <input type="text" id="leaveReason" placeholder="Reason for leave" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>From Date *</label>
                <input type="date" id="leaveFrom" required>
              </div>
              <div class="form-group">
                <label>To Date *</label>
                <input type="date" id="leaveTo" required>
              </div>
            </div>
            <button type="submit" class="btn-primary" style="margin-top:12px">
              <i class="fas fa-paper-plane"></i> Submit Application
            </button>
          </form>
        </div>
      </div>

      ${myLeaves.length > 0 ? `
        <div class="card animate-in animate-delay-4" style="margin-top:24px">
          <div class="card-header"><h3>My Leave History</h3></div>
          <div class="card-body">
            <table class="data-table">
              <thead><tr><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th></tr></thead>
              <tbody>
                ${myLeaves.map(l => `
                  <tr>
                    <td>${l.leaveType}</td>
                    <td>${l.fromDate}</td>
                    <td>${l.toDate}</td>
                    <td>${l.reason}</td>
                    <td><span class="status-badge ${l.status}">${l.status.charAt(0).toUpperCase() + l.status.slice(1)}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
    `;
  },


  renderMyAttendance() {
    const myAtt = this.attendance.filter(a => a.employeeId === this.currentUser.id);
    const present = myAtt.filter(a => a.status === 'present').length;
    const absent = myAtt.filter(a => a.status === 'absent').length;
    const halfDay = myAtt.filter(a => a.status === 'half-day').length;

    // Generate calendar for current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let calendarHTML = dayNames.map(d => `<div class="attendance-day header">${d}</div>`).join('');
    for (let i = 0; i < firstDay; i++) calendarHTML += '<div class="attendance-day"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const record = myAtt.find(a => a.date === dateStr);
      const dayOfWeek = new Date(year, month, d).getDay();
      let cls = dayOfWeek === 0 ? 'weekend' : '';
      if (record) cls = record.status;
      calendarHTML += `<div class="attendance-day ${cls}">${d}</div>`;
    }

    return `
      <h2 class="section-title animate-in">My Attendance</h2>
      <p class="section-subtitle animate-in animate-delay-1">${now.toLocaleDateString('en-IN', {month: 'long', year: 'numeric'})} attendance record</p>
      
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
        <div class="stat-card green animate-in animate-delay-2">
          <div class="stat-icon"><i class="fas fa-check"></i></div>
          <div class="stat-value">${present}</div>
          <div class="stat-label">Days Present</div>
        </div>
        <div class="stat-card red animate-in animate-delay-3">
          <div class="stat-icon"><i class="fas fa-times"></i></div>
          <div class="stat-value">${absent}</div>
          <div class="stat-label">Days Absent</div>
        </div>
        <div class="stat-card saffron animate-in animate-delay-4">
          <div class="stat-icon"><i class="fas fa-adjust"></i></div>
          <div class="stat-value">${halfDay}</div>
          <div class="stat-label">Half Days</div>
        </div>
      </div>

      <div class="card animate-in animate-delay-4">
        <div class="card-header">
          <h3><i class="fas fa-calendar" style="margin-right:8px; color:var(--primary-light)"></i> ${now.toLocaleDateString('en-IN', {month: 'long', year: 'numeric'})}</h3>
        </div>
        <div class="card-body">
          <div class="attendance-grid">${calendarHTML}</div>
          <div style="display:flex; gap:16px; margin-top:16px; flex-wrap:wrap;">
            <span style="font-size:11px; display:flex; align-items:center; gap:6px;"><span style="width:12px;height:12px;border-radius:4px;background:#d1fae5;"></span> Present</span>
            <span style="font-size:11px; display:flex; align-items:center; gap:6px;"><span style="width:12px;height:12px;border-radius:4px;background:#fee2e2;"></span> Absent</span>
            <span style="font-size:11px; display:flex; align-items:center; gap:6px;"><span style="width:12px;height:12px;border-radius:4px;background:#fef3c7;"></span> Half Day</span>
            <span style="font-size:11px; display:flex; align-items:center; gap:6px;"><span style="width:12px;height:12px;border-radius:4px;background:#f1f5f9;"></span> Weekend</span>
          </div>
        </div>
      </div>
    `;
  },

  renderMyProfile() {
    const emp = this.currentUser;
    return `
      <h2 class="section-title animate-in">My Profile</h2>
      <p class="section-subtitle animate-in animate-delay-1">Your personal and employment details</p>
      
      <div class="card animate-in animate-delay-2">
        <div class="card-body" style="padding:30px">
          <div style="display:flex; align-items:center; gap:20px; margin-bottom:28px; padding-bottom:20px; border-bottom:2px solid #f1f5f9;">
            <div style="width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg, var(--primary), var(--primary-light)); display:flex; align-items:center; justify-content:center; color:white; font-size:28px; font-weight:700;">
              ${emp.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
            </div>
            <div>
              <h3 style="font-size:20px; margin-bottom:4px">${emp.name}</h3>
              <p style="color:var(--text-light); font-size:14px">${emp.designation} | ${emp.department}</p>
              <p style="color:var(--primary-light); font-size:12px; font-weight:600; margin-top:4px">${emp.empId}</p>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <div><label style="font-size:11px; color:var(--text-light); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Department</label><p style="font-size:15px; font-weight:500; margin-top:4px">${emp.department}</p></div>
            <div><label style="font-size:11px; color:var(--text-light); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Designation</label><p style="font-size:15px; font-weight:500; margin-top:4px">${emp.designation}</p></div>
            <div><label style="font-size:11px; color:var(--text-light); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Phone</label><p style="font-size:15px; font-weight:500; margin-top:4px">${emp.phone || 'Not provided'}</p></div>
            <div><label style="font-size:11px; color:var(--text-light); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Email</label><p style="font-size:15px; font-weight:500; margin-top:4px">${emp.email || 'Not provided'}</p></div>
            <div><label style="font-size:11px; color:var(--text-light); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Date of Joining</label><p style="font-size:15px; font-weight:500; margin-top:4px">${emp.doj || 'Not set'}</p></div>
            <div><label style="font-size:11px; color:var(--text-light); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Basic Salary</label><p style="font-size:15px; font-weight:500; margin-top:4px">${emp.salary ? '₹' + parseInt(emp.salary).toLocaleString() : 'Not disclosed'}</p></div>
          </div>
        </div>
      </div>
    `;
  },


  renderProducts() {
    return `
      <h2 class="section-title animate-in">Our Products</h2>
      <p class="section-subtitle animate-in animate-delay-1">Karnataka Co-operative Oilseeds Growers' Federation Products</p>
      
      <div class="product-grid">
        <div class="product-card animate-in animate-delay-1">
          <img src="https://kofchitradurga.com/wp-content/uploads/2021/02/Refined-Sunflower-Oil.jpg" alt="Refined Sunflower Oil" onerror="this.src='https://images.unsplash.com/photo-1474979266404-7f28b8ce3ad4?w=400&h=300&fit=crop'">
          <div class="product-info">
            <div class="product-name">KOF Refined Sunflower Oil</div>
            <div class="product-desc">Premium quality refined sunflower oil, cold-pressed and pure.</div>
          </div>
        </div>
        <div class="product-card animate-in animate-delay-2">
          <img src="https://kofchitradurga.com/wp-content/uploads/2021/02/Groundnut-Oil.jpg" alt="Groundnut Oil" onerror="this.src='https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=300&fit=crop'">
          <div class="product-info">
            <div class="product-name">KOF Groundnut Oil</div>
            <div class="product-desc">Traditional filtered groundnut oil for authentic cooking.</div>
          </div>
        </div>
        <div class="product-card animate-in animate-delay-3">
          <img src="https://kofchitradurga.com/wp-content/uploads/2021/02/Sesame-Oil.jpg" alt="Sesame Oil" onerror="this.src='https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop'">
          <div class="product-info">
            <div class="product-name">KOF Sesame Oil</div>
            <div class="product-desc">Cold-pressed sesame oil, rich in natural nutrients.</div>
          </div>
        </div>
        <div class="product-card animate-in animate-delay-4">
          <img src="https://kofchitradurga.com/wp-content/uploads/2021/02/Coconut-Oil.jpg" alt="Coconut Oil" onerror="this.src='https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=300&fit=crop'">
          <div class="product-info">
            <div class="product-name">KOF Coconut Oil</div>
            <div class="product-desc">Pure coconut oil for cooking and wellness.</div>
          </div>
        </div>
        <div class="product-card animate-in animate-delay-5">
          <img src="https://kofchitradurga.com/wp-content/uploads/2021/02/Safflower-Oil.jpg" alt="Safflower Oil" onerror="this.src='https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400&h=300&fit=crop'">
          <div class="product-info">
            <div class="product-name">KOF Safflower Oil</div>
            <div class="product-desc">Heart-healthy safflower oil from Karnataka's finest oilseeds.</div>
          </div>
        </div>
        <div class="product-card animate-in animate-delay-5">
          <img src="https://kofchitradurga.com/wp-content/uploads/2021/02/Niger-Seed-Oil.jpg" alt="Niger Seed Oil" onerror="this.src='https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=400&h=300&fit=crop'">
          <div class="product-info">
            <div class="product-name">KOF Niger Seed Oil</div>
            <div class="product-desc">Traditional niger seed oil, a Karnataka specialty.</div>
          </div>
        </div>
      </div>
    `;
  },

  renderAnnouncements() {
    return `
      <h2 class="section-title animate-in">Announcements</h2>
      <p class="section-subtitle animate-in animate-delay-1">Organization-wide notices and updates</p>
      
      <div class="card animate-in animate-delay-2">
        <div class="card-body">
          ${this.announcements.length === 0 ? 
            '<div style="text-align:center; padding:60px; color:var(--text-light)"><i class="fas fa-bullhorn" style="font-size:50px; margin-bottom:16px; display:block; opacity:0.2"></i><p style="font-size:15px">No announcements yet</p></div>' :
            this.announcements.slice().reverse().map(a => `
              <div class="announcement-item">
                <div class="ann-date"><i class="far fa-calendar-alt"></i> ${a.date}</div>
                <div class="ann-title">${a.title}</div>
                <div class="ann-body">${a.body}</div>
              </div>
            `).join('')
          }
        </div>
      </div>
    `;
  },


  // ============ EVENT BINDINGS ============

  bindLoginEvents() {
    const form = document.getElementById('loginForm');
    const roleTabs = document.querySelectorAll('.role-tab');
    let selectedRole = 'admin';

    roleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        roleTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        selectedRole = tab.dataset.role;
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      const errorEl = document.getElementById('loginError');
      const errorText = document.getElementById('errorText');

      if (selectedRole === 'admin') {
        if (username === this.adminCredentials.username && password === this.adminCredentials.password) {
          this.currentUser = { role: 'admin', name: 'Administrator' };
          this.currentPage = 'dashboard';
          this.render();
        } else {
          errorText.textContent = 'Invalid admin credentials. Please try again.';
          errorEl.classList.add('show');
          setTimeout(() => errorEl.classList.remove('show'), 4000);
        }
      } else {
        const emp = this.employees.find(e => e.username === username && e.password === password);
        if (emp) {
          this.currentUser = { ...emp, role: 'employee' };
          this.currentPage = 'dashboard';
          this.render();
        } else {
          errorText.textContent = 'Invalid credentials. Contact admin for account access.';
          errorEl.classList.add('show');
          setTimeout(() => errorEl.classList.remove('show'), 4000);
        }
      }
    });
  },

  bindDashboardEvents() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      this.currentUser = null;
      this.currentPage = 'dashboard';
      this.render();
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showPage(btn.dataset.page);
      });
    });
  },

  bindCreateEmployeeEvents() {
    const form = document.getElementById('createEmployeeForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newEmp = {
        id: 'emp_' + Date.now(),
        name: document.getElementById('empName').value.trim(),
        empId: document.getElementById('empId').value.trim(),
        department: document.getElementById('empDept').value,
        designation: document.getElementById('empDesignation').value.trim(),
        phone: document.getElementById('empPhone').value.trim(),
        email: document.getElementById('empEmail').value.trim(),
        username: document.getElementById('empUsername').value.trim(),
        password: document.getElementById('empPassword').value.trim(),
        doj: document.getElementById('empDoj').value,
        salary: document.getElementById('empSalary').value
      };

      // Check duplicate username
      if (this.employees.find(e => e.username === newEmp.username)) {
        this.showToast('Username already exists!', true);
        return;
      }

      this.employees.push(newEmp);
      this.save();
      this.showToast('Employee account created successfully!');
      this.showPage('manage-employees');
    });
  },


  bindPayslipEvents() {
    const form = document.getElementById('payslipForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const basic = parseInt(document.getElementById('payBasic').value) || 0;
      const da = parseInt(document.getElementById('payDA').value) || 0;
      const hra = parseInt(document.getElementById('payHRA').value) || 0;
      const other = parseInt(document.getElementById('payOther').value) || 0;
      const pf = parseInt(document.getElementById('payPF').value) || 0;
      const tax = parseInt(document.getElementById('payTax').value) || 0;
      const netPay = basic + da + hra + other - pf - tax;

      const payslip = {
        id: 'pay_' + Date.now(),
        employeeId: document.getElementById('payEmpId').value,
        month: document.getElementById('payMonth').value,
        basic, da, hra, other, pf, tax, netPay,
        date: new Date().toISOString().split('T')[0]
      };

      this.payslips.push(payslip);
      this.save();
      this.showToast('Payslip generated successfully!');
      this.showPage('manage-payslips');
    });
  },

  bindLeaveManageEvents() {
    // Leave approve/reject handled via inline onclick
  },

  bindAttendanceEvents() {
    const form = document.getElementById('attendanceForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const today = new Date().toISOString().split('T')[0];
      const selects = document.querySelectorAll('.att-select');
      
      selects.forEach(sel => {
        const empId = sel.dataset.empId;
        const status = sel.value;
        // Update or add
        const existing = this.attendance.findIndex(a => a.employeeId === empId && a.date === today);
        if (existing >= 0) {
          this.attendance[existing].status = status;
        } else {
          this.attendance.push({ id: 'att_' + Date.now() + '_' + empId, employeeId: empId, date: today, status });
        }
      });

      this.save();
      this.showToast('Attendance saved successfully!');
    });
  },

  bindAnnouncementEvents() {
    const form = document.getElementById('announcementForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const announcement = {
        id: 'ann_' + Date.now(),
        title: document.getElementById('annTitle').value.trim(),
        body: document.getElementById('annBody').value.trim(),
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      this.announcements.push(announcement);
      this.save();
      this.showToast('Announcement published!');
      this.showPage('post-announcement');
    });
  },

  bindLeaveRequestEvents() {
    const form = document.getElementById('leaveRequestForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const leave = {
        id: 'leave_' + Date.now(),
        employeeId: this.currentUser.id,
        leaveType: document.getElementById('leaveType').value,
        reason: document.getElementById('leaveReason').value.trim(),
        fromDate: document.getElementById('leaveFrom').value,
        toDate: document.getElementById('leaveTo').value,
        status: 'pending'
      };
      this.leaves.push(leave);
      this.save();
      this.showToast('Leave application submitted!');
      this.showPage('my-leaves');
    });
  },


  // ============ UTILITY METHODS ============

  updateLeaveStatus(leaveId, status) {
    const leave = this.leaves.find(l => l.id === leaveId);
    if (leave) {
      leave.status = status;
      this.save();
      this.showToast(`Leave ${status === 'approved' ? 'approved' : 'rejected'}!`);
      this.showPage('manage-leaves');
    }
  },

  deleteEmployee(empId) {
    if (confirm('Are you sure you want to delete this employee? This will also remove their payslips, leaves and attendance records.')) {
      this.employees = this.employees.filter(e => e.id !== empId);
      this.payslips = this.payslips.filter(p => p.employeeId !== empId);
      this.leaves = this.leaves.filter(l => l.employeeId !== empId);
      this.attendance = this.attendance.filter(a => a.employeeId !== empId);
      this.save();
      this.showToast('Employee deleted successfully');
      this.showPage('manage-employees');
    }
  },

  showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toastText');
    if (!toast) return;
    text.textContent = message;
    toast.className = 'notification-toast' + (isError ? ' error' : '');
    toast.querySelector('i').className = isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  },

  startClock() {
    const update = () => {
      const clockEl = document.getElementById('headerClock');
      if (clockEl) {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    };
    update();
    setInterval(update, 1000);
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => App.init());
