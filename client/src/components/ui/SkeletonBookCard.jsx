const SkeletonBookCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 animate-pulse">

      {/* Image */}
      <div className="h-64 w-full rounded-xl bg-gray-200 dark:bg-gray-700 mb-4"></div>

      {/* Title */}
      <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>

      {/* Author */}
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Buttons */}
      <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
};

export default SkeletonBookCard;
