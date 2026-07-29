import { Search, UserPlus, Key, Edit2, UserMinus, UserCheck, Trash2 } from 'lucide-react';
import type { SuperAdminAccount } from '../../superAdminDashboardData';

export default function AdminsTab({
  searchTerm,
  setSearchTerm,
  admins,
  openAdminForm,
  setCreatedAdminCredentials,
  toggleAdminStatus,
  deleteAdmin,
}: {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  admins: SuperAdminAccount[];
  openAdminForm: (admin?: SuperAdminAccount | null) => void;
  setCreatedAdminCredentials: (admin: SuperAdminAccount | null) => void;
  toggleAdminStatus: (id: string) => void;
  deleteAdmin: (id: string) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
        <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:max-w-xs bg-slate-50">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search admins..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-xs w-full" />
        </div>
        <button onClick={() => openAdminForm(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm">
          <UserPlus className="w-4 h-4" /> Create Admin
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Admin Details</th>
                <th className="px-5 py-3">Role & Region</th>
                <th className="px-5 py-3">Login Password</th>
                <th className="px-5 py-3">Passcode</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {admins.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase())).map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">{admin.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{admin.email} • {admin.phone || 'N/A'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200 block w-fit mb-1">{admin.role}</span>
                    <p className="text-[10px] font-medium text-slate-500">{admin.region}</p>
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-xs font-mono bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200">{admin.password || 'adminpassword'}</code>
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-xs font-mono bg-slate-50 text-slate-800 px-2 py-1 rounded border border-slate-200 font-bold">{admin.passcode || '12345'}</code>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${admin.status === 'Active' ? 'bg-slate-50 text-slate-700 border-slate-200' : admin.status === 'Suspended' ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setCreatedAdminCredentials(admin)} className="p-1.5 hover:bg-slate-100 rounded-lg text-primary-container cursor-pointer" title="View Credentials Card"><Key className="w-3.5 h-3.5" /></button>
                      <button onClick={() => openAdminForm(admin)} className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-600 cursor-pointer" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toggleAdminStatus(admin.id)} className="p-1.5 hover:bg-slate-100 rounded-lg text-secondary cursor-pointer" title={admin.status === 'Active' ? 'Suspend' : 'Activate'}>
                        {admin.status === 'Active' ? <UserMinus className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => deleteAdmin(admin.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
