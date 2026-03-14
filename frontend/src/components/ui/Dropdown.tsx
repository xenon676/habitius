import { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  className?: string;
  placeholder?: string;
}

export default function Dropdown({ value, onChange, options, className = '', placeholder }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const selected = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className} text-[0.95rem]`} ref={ref}>
      <button
        type="button"
        className="w-full px-3 py-2 border border-main-gray3 rounded-sm bg-main-white text-main-gray7 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-main-gray3"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected ? selected.label : (placeholder || 'Select...')}</span>
        <svg className="w-4 h-4 ml-2 text-main-gray5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <ul className="absolute left-0 right-0 mt-1 bg-main-white border border-main-gray3 rounded-sm shadow-lg z-10 max-h-48 overflow-auto" role="listbox">
          {options.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`px-2 py-0.5 cursor-pointer text-main-gray7 hover:bg-main-gray2 ${opt.value === value ? 'bg-main-gray2 font-medium' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 