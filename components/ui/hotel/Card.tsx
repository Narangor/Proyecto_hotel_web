import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition">
      {children}
    </div>
  );
}