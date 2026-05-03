import { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4 text-[#4A2E2A]">
        {title}
      </h2>
      {children}
    </section>
  );
}