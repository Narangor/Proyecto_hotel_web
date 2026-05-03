import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
}

export default function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-[#C6A75E] text-white px-4 py-2 rounded-xl hover:bg-[#a98c4e] transition"
    >
      {children}
    </button>
  );
}