function Button({ text }) {
  return (
    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition">
      {text}
    </button>
  );
}

export default Button;