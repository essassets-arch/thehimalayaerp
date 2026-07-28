'use client';



export default function AuthLayout() {
  return (
    <div className="auth-layout-container" style={{
      width: '100vw',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgb(4, 15, 30) 0%, rgb(10, 31, 60) 90.2%)',
      padding: '20px',
      overflowX: 'hidden'
    }}>
      <Outlet />
    </div>
  );
}
