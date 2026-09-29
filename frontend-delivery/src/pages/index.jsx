import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, PackagePlus, Truck, Users, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminApi, deliveriesApi, driversApi } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Loader } from '../components/common/Loader';
import { StatsCard } from '../components/common/StatsCard';

const PageHeader = ({ title, subtitle, action }) => <div className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
const isActive = (d) => !['DELIVERED', 'CANCELLED', 'FAILED'].includes(d.delivery_status);

export function LoginPage() { return <AuthForm register={false} />; }
export function RegisterPage() { return <AuthForm register />; }

function AuthForm({ register }) {
  const { login, register: signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate(); const toast = useToast();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', confirmPassword: '', role: 'CUSTOMER' });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated, navigate]);
  const field = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    if (register && form.password !== form.confirmPassword) return toast.error('Passwords do not match.');
    setSaving(true);
    try {
      if (register) await signUp(form); else await login(form.email, form.password);
      toast.success(register ? 'Account created successfully.' : 'Welcome back.'); navigate('/');
    } catch (error) { toast.error(error.message); } finally { setSaving(false); }
  };
  return <main className="auth-shell"><section className="auth-card glass-panel"><div className="brand-lockup"><Truck size={28} /> SwiftTrack</div><h1>{register ? 'Create your account' : 'Welcome back'}</h1><p>Secure delivery operations, in real time.</p><form onSubmit={submit} className="form-stack">
    {register && <><Input label="Full name" value={form.fullName} onChange={field('fullName')} required /><Input label="Phone" value={form.phone} onChange={field('phone')} required /><label>Role<select value={form.role} onChange={field('role')}><option value="CUSTOMER">Customer</option><option value="DRIVER">Delivery partner</option></select></label></>}
    <Input label="Email" type="email" value={form.email} onChange={field('email')} required /><Input label="Password" type="password" minLength="8" value={form.password} onChange={field('password')} required />
    {register && <Input label="Confirm password" type="password" value={form.confirmPassword} onChange={field('confirmPassword')} required />}
    <Button type="submit" isLoading={saving}>{register ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></Button>
  </form><p className="auth-switch">{register ? 'Already have an account?' : 'New to SwiftTrack?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create one'}</Link></p></section></main>;
}

export function DashboardPage() {
  const { user, isAdmin, isDriver } = useAuth();
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => {
    const request = isAdmin ? adminApi.getStats() : isDriver ? driversApi.getMyDeliveries() : deliveriesApi.getAll();
    request.then((result) => setData(result.data)).catch((e) => setError(e.message));
  }, [isAdmin, isDriver]);
  if (error) return <Card title="Unable to load dashboard">{error}</Card>;
  if (!data) return <Loader />;
  if (isAdmin) return <AdminDashboard data={data} />;
  const deliveries = data;
  const active = deliveries.filter(isActive);
  return <><PageHeader title={`Hello, ${user.full_name?.split(' ')[0] || 'there'}`} subtitle={isDriver ? 'Your live delivery queue.' : 'Your deliveries at a glance.'} action={!isDriver && <Link to="/orders/new"><Button icon={PackagePlus}>Create delivery</Button></Link>} />
    <div className="stats-grid"><StatsCard title="Active" value={active.length} icon={Activity} /><StatsCard title="Completed" value={deliveries.filter((d) => d.delivery_status === 'DELIVERED').length} icon={CheckCircle2} color="success" /></div>
    <Card title={isDriver ? 'Assigned deliveries' : 'Active deliveries'}>{active.length ? <DeliveryRows deliveries={active} /> : <div className="empty-state">No active deliveries right now.</div>}</Card></>;
}

function AdminDashboard({ data }) {
  const m = data.metrics;
  return <><PageHeader title="Fleet overview" subtitle="Live operational health across your delivery network." />
    <div className="stats-grid"><StatsCard title="Active deliveries" value={m.activeDeliveriesCount} icon={Activity} /><StatsCard title="Available drivers" value={m.availableDriversCount} icon={Truck} color="success" /><StatsCard title="Customers" value={m.customersCount} icon={Users} color="purple" /><StatsCard title="Completion rate" value={`${m.completionRate}%`} icon={CheckCircle2} color="warning" /></div>
    <Card title="Current deliveries">{data.recentDeliveries.length ? <DeliveryRows deliveries={data.recentDeliveries} /> : <div className="empty-state">No active deliveries.</div>}</Card></>;
}

function DeliveryRows({ deliveries }) { return <div className="delivery-list">{deliveries.map((d) => <Link className="delivery-row" to={`/tracking/${d.id}`} key={d.id}><div><strong>#{d.delivery_number || d.order?.order_number}</strong><p>{d.order?.delivery_address_text || 'Delivery details'}</p></div><Badge status={d.delivery_status} /><ArrowRight size={18} /></Link>)}</div>; }
