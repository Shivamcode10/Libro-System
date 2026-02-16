// --- FIX: REMOVED INVALID IMPORT 'LucideIcon' ---
// We do NOT need to import a generic 'Icon' component.
// We will just use the specific icon passed via props (e.g., <Book />).

const StatsCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center">
      <div className={`p-3 rounded-full ${colorClass} bg-opacity-10 mr-4`}>
        {/* We render the Icon component passed from the parent (e.g., <Book />) */}
        {/* We add a class to color it dynamically */}
        <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-gray-500 text-sm uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
