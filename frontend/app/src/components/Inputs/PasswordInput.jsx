import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  return (
    <div className="relative flex items-center bg-white border-2 border-gray-300 rounded-lg mb-4 focus-within:border-blue-500 transition-colors">
      <input
        value={value}
        onChange={onChange}
        type={isShowPassword ? "text" : "password"}
        placeholder={placeholder || "Password"}
        className="w-full text-sm bg-transparent py-3 px-4 rounded-lg outline-none"
      />
      <button
        type="button"
        onClick={toggleShowPassword}
        className="absolute right-3 p-1 text-gray-500 hover:text-blue-600 transition-colors"
      >
        {isShowPassword ? (
          <EyeOff size={20} />
        ) : (
          <Eye size={20} />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;