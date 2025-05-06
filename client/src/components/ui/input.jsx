export function Input({ type, placeholder, ...props }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="w-full p-2 border rounded"
      {...props}
    />
  );
}
