'use client';

import React from 'react';
import Select from 'react-select';

export interface OptionType {
  label: string;
  value: string;
}

interface Props {
  options: OptionType[];
  selected: OptionType[];
  setSelected: (selected: OptionType[]) => void;
  placeholder?: string;
}

export default function MultiSelectDropdown({
  options,
  selected,
  setSelected,
  placeholder = 'Select users...',
}: Props) {
  return (
    <div className="w-full">
      <Select
        options={options}
        value={selected}
        onChange={(selectedOptions) =>
          setSelected(selectedOptions as OptionType[])
        }
        isMulti
        placeholder={placeholder}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: '40px',
            borderRadius: '6px',
            borderColor: state.isFocused ? '#9ca3af' : '#d1d5db',
            paddingLeft: '8px',
            fontSize: '14px',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(156, 163, 175, 0.3)' : 'none', 
            backgroundColor: 'white',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#9ca3af'
            },
          }),
          option: (base, { isFocused, isSelected }) => ({
            ...base,
            backgroundColor: isSelected
              ? '#f3f4f6'
              : isFocused
              ? '#f9fafb'
              : 'white',
            color: '#111827',
            fontSize: '14px',
            padding: '8px 12px',
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: '#f3f4f6',
            fontSize: '14px',
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: '#4b5563',
            fontSize: '14px',
            padding: '0 4px',
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: '#6b7280',
            ':hover': {
              backgroundColor: '#e5e7eb',
              color: '#1f2937',
            },
          }),
          placeholder: (base) => ({
            ...base,
            color: '#9ca3af',
            fontSize: '14px',
          })
        }}
      />
    </div>
  );
}
