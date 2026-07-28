import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// The mobile-overlay + <aside> skeleton (translate/collapse classes, brand
// header, nav item mapping) was identical across AdminDashboard,
// SuperAdminDashboard, HospitalDashboard, and VolunteerDashboard -- only
// colors, the brand icon/label, badge styling (or its absence, in
// SuperAdmin's case), nav item density, and the optional footer block
// differed. Those differences are all still driven from each call site via
// props below rather than papered over.

export interface DashboardSidebarNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface DashboardSidebarProps {
  items: DashboardSidebarNavItem[];
  activeTab: string;
  onSelect: (id: string) => void;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  onCloseMobile: () => void;
  bgClass: string;
  brandIcon: LucideIcon;
  brandIconWrapperClass: string;
  brandLabel: ReactNode;
  brandLabelClass?: string;
  activeAccentBorderClass: string;
  /** Omit to match SuperAdminDashboard, which never renders badge pills. */
  badgeClass?: string;
  navItemPaddingClass?: string;
  navIconSizeClass?: string;
  navIconMarginClass?: string;
  footer?: ReactNode;
}

export default function DashboardSidebar({
  items,
  activeTab,
  onSelect,
  sidebarCollapsed,
  mobileSidebarOpen,
  onCloseMobile,
  bgClass,
  brandIcon: BrandIcon,
  brandIconWrapperClass,
  brandLabel,
  brandLabelClass = 'text-lg',
  activeAccentBorderClass,
  badgeClass,
  navItemPaddingClass = 'p-3 text-sm',
  navIconSizeClass = 'w-5 h-5',
  navIconMarginClass = 'mr-3.5',
  footer,
}: DashboardSidebarProps) {
  const expanded = !sidebarCollapsed || mobileSidebarOpen;

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 ${bgClass} text-white transition-all duration-300 flex flex-col justify-between select-none ${
          mobileSidebarOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        <div>
          <div className="p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${brandIconWrapperClass}`}>
                <BrandIcon className="w-5 h-5" />
              </div>
              {expanded && (
                <span className={`font-headline-lg ${brandLabelClass} font-black text-white tracking-tight truncate`}>
                  {brandLabel}
                </span>
              )}
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1 max-h-[calc(100vh-160px)] overflow-y-auto">
            {items.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between rounded-xl ${navItemPaddingClass} font-semibold transition-all cursor-pointer ${
                    isActive
                      ? `bg-white/10 text-white shadow-sm border-l-4 ${activeAccentBorderClass}`
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center">
                    <IconComp className={`${navIconSizeClass} shrink-0 ${sidebarCollapsed && !mobileSidebarOpen ? 'mx-auto' : navIconMarginClass}`} />
                    {expanded && <span>{item.label}</span>}
                  </div>
                  {expanded && badgeClass && item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${badgeClass}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {footer && <div className="p-3 border-t border-white/10 space-y-1">{footer}</div>}
      </aside>
    </>
  );
}

interface SidebarFooterButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  expanded: boolean;
  colorClass?: string;
}

// Shared shape for the "Return to Main Website" / "Secure Logout" buttons
// that live in DashboardSidebar's optional footer slot (Hospital and
// Volunteer dashboards).
export function SidebarFooterButton({
  icon: Icon,
  label,
  onClick,
  expanded,
  colorClass = 'text-white/70 hover:text-white hover:bg-white/10',
}: SidebarFooterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center rounded-xl p-2.5 text-xs font-semibold cursor-pointer transition-colors ${colorClass}`}
    >
      <Icon className={`w-4.5 h-4.5 shrink-0 ${expanded ? 'mr-3' : 'mx-auto'}`} />
      {expanded && <span>{label}</span>}
    </button>
  );
}
