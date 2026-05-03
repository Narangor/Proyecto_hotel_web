"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { btnDropdownItem, btnIconMenu } from "@/components/ui/buttonClasses";

interface DropdownMenuProps {
  children: React.ReactNode;
  ariaLabel?: string;
}

interface DropdownMenuItemProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function DropdownMenu({ children, ariaLabel }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={btnIconMenu}
        aria-label={ariaLabel || "Abrir menú"}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-lg bg-white shadow-lg border border-brown-200 py-1 z-50">
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({
  onClick,
  className = "",
  children,
  disabled = false,
}: DropdownMenuItemProps) {
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`${btnDropdownItem} disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
