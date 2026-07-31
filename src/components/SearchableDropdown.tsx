import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface OptionItem<T extends string = string> {
  value: T;
  label: string;
  sublabel?: string;
  badge?: string;
  disabled?: boolean;
}

interface SearchableDropdownProps<T extends string = string> {
  options: OptionItem<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
  id?: string;
  hideBadge?: boolean;
}

export function SearchableDropdown<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  label,
  required,
  disabled,
  hasError = false,
  className = '',
  id = 'searchable-dropdown',
  hideBadge = false,
}: SearchableDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (opt.badge && opt.badge.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: T, isDisabled?: boolean) => {
    if (isDisabled) return;
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef} id={id}>
      {label && (
        <label className="block text-sm font-semibold text-slate-800 mb-1">
          {label} {required && <span className="text-orange-600">*</span>}
        </label>
      )}

      <button
        type="button"
        id={`${id}-trigger`}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-xl text-left text-slate-800 shadow-2xs transition-all text-base md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
          disabled
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : hasError && !value
            ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
            : isOpen
            ? 'border-amber-500 ring-2 ring-amber-500/20'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <span className="truncate">
          {selectedOption ? (
            <span className="flex items-center gap-2">
              <span className="font-medium text-slate-800">{selectedOption.label}</span>
              {!hideBadge && selectedOption.badge && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
                  {selectedOption.badge}
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ml-2 shrink-0 ${
            isOpen ? 'rotate-180 text-amber-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id={`${id}-menu`}
          className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              id={`${id}-search`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pilihan..."
              className="w-full text-base md:text-xs py-1.5 bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-xs text-center text-slate-400 font-medium">
                Tiada padanan dijumpai.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value, opt.disabled)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      opt.disabled
                        ? 'opacity-50 cursor-not-allowed bg-slate-50'
                        : isSelected
                        ? 'bg-amber-50 text-amber-950 font-semibold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{opt.label}</span>
                        {!hideBadge && opt.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded border border-slate-200">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <span className="text-[11px] text-slate-500">{opt.sublabel}</span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-600 ml-2 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
