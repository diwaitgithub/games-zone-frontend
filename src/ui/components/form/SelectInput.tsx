import React from "react";
import DownArrow from "../common/DownArrow";

interface Props {
  label?: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: any }[];
  rounded: string;
}

const SelectInput: React.FC<Props> = (props) => {
  const { label, name, options, value, onChange, rounded } = props;
  return (
    <div className="relative" key={name}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`cursor-pointer appearance-none h-full ${rounded} border block w-full bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:bg-white focus:border-gray-500`}
      >
        {options.map((option, index) => {
          return (
            <option value={option.value} key={index}>
              {option.label}
            </option>
          );
        })}
      </select>
      <DownArrow />
    </div>
  );
};

export default SelectInput;
