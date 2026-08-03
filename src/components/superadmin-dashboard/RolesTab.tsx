import { Plus, AlertTriangle } from 'lucide-react';
import type { CustomRole } from '../../superAdminDashboardData';

export default function RolesTab({
  roles,
  setShowRoleModal,
}: {
  roles: CustomRole[];
  setShowRoleModal: (val: boolean) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
        <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC)</h3>
        <button
          onClick={() => setShowRoleModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Custom Role
        </button>
      </div>

      {/* Not a UI polish note -- this is load-bearing. Nothing anywhere
          checks a role's permissions array; access control is still just
          the raw admin/superadmin flag on the JWT. Without this, someone
          creating a role here would reasonably assume it restricts access. */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          <span className="font-bold">Permissions shown below are not yet enforced.</span> Roles and their permission lists are saved for record-keeping, but no endpoint currently checks them — every admin's actual access is still governed only by their Admin / Super Admin flag. Treat this as a directory, not an access control mechanism, until enforcement is built.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Role Name</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Permissions</th>
                <th className="px-5 py-3">Assigned</th>
                <th className="px-5 py-3">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {roles.map(role => (
                <tr key={role.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-bold text-slate-900">{role.name}</td>
                  <td className="px-5 py-4 text-slate-600 text-[11px] max-w-[280px]">{role.description}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">{role.permissions.length} permissions</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{role.assignedCount} admins</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${role.isSystem ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                      {role.isSystem ? 'System' : 'Custom'}
                    </span>
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
