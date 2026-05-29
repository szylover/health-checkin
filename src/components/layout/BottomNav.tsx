import { NavLink } from 'react-router-dom'
import { TAB_LABELS } from '../../data/texts'

const tabs = [
  { to: '/', label: TAB_LABELS.home, icon: '🏠', end: true },
  { to: '/checkin', label: TAB_LABELS.checkin, icon: '✅' },
  { to: '/calories', label: TAB_LABELS.calories, icon: '🔥' },
  { to: '/eatwhat', label: '吃啥', icon: '🎲' },
  { to: '/progress', label: TAB_LABELS.progress, icon: '📊' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-400'
              }`
            }
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="text-[10px]">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
