const Card = ({ children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition">
      {children}
    </div>
  );
};

export default Card;
