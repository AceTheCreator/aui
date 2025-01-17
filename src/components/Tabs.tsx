import classNames from "../helpers/classNames";

type Tab = {
  id: string;
  name: string;
}

interface TabsProps {
  tabs: Tab[];
  current: string;
  onChange?: (id: string) => void;
}

export default function Tabs({
  tabs,
  current,
  onChange = () => {},
}: TabsProps) {
  return (
    <div>
      {/* Dropdown for smaller screens */}
      <div className="sm:hidden">
        <label htmlFor="AuthTabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="AuthTabs"
          name="tabs"
          onChange={(ev) => onChange(ev.target.value)}
          className="block mt-4 w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
          defaultValue={tabs.find((tab) => tab.id === current)?.id}
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs for larger screens */}
      <div className="hidden sm:block mt-6">
        <nav
          className="relative z-0 rounded-lg shadow flex divide-x divide-gray-200"
          aria-label="Tabs"
        >
          {tabs.map((tab, tabIdx) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={classNames(
                tab.id === current
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700",
                tabIdx === 0 ? "rounded-l-lg" : "",
                tabIdx === tabs.length - 1 ? "rounded-r-lg" : "",
                "group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10"
              )}
              aria-current={tab.id === current ? "page" : undefined}
            >
              <span>{tab.name}</span>
              <span
                aria-hidden="true"
                className={classNames(
                  tab.id === current ? "bg-indigo-500" : "bg-transparent",
                  "absolute inset-x-0 bottom-0 h-0.5"
                )}
              />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
