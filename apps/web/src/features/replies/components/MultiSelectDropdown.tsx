import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Filter } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface MultiSelectDropdownProps {
  id: string;
  label: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  icon?: React.ReactNode;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  id,
  label,
  options,
  selectedValues,
  onChange,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const selectAll = () => {
    onChange(options.map((opt) => opt.value));
  };

  const clearAll = () => {
    onChange([]);
  };

  const isSelected = (val: string) => selectedValues.includes(val);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} id={id}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition shadow-xs cursor-pointer ${
          selectedValues.length > 0
            ? 'bg-blue-50/80 border-blue-300 text-blue-900 ring-1 ring-blue-500/20'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        {icon || <Filter className="w-3.5 h-3.5 text-slate-400" />}
        <span>{label}</span>
        {selectedValues.length > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
            {selectedValues.length}
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1 mb-2 border-b border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 pb-1">
              Filter by {label}
            </div>
            {options.length > 5 && (
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
            <div className="flex items-center justify-between px-2 pt-1.5 text-[11px]">
              <button
                type="button"
                onClick={selectAll}
                className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const checked = isSelected(opt.value);
                return (
                  <label
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition ${
                      checked ? 'bg-blue-50/70 text-blue-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                          checked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="truncate">
                        <div className="truncate">{opt.label}</div>
                        {opt.sublabel && (
                          <div className="text-[10px] text-slate-400 truncate">{opt.sublabel}</div>
                        )}
                      </div>
                    </div>
                    {opt.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono shrink-0">
                        {opt.badge}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
