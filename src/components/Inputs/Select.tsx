import { InputHTMLAttributes, ReactElement, useEffect, useState, useRef, ReactNode, ChangeEvent } from "react";
import Opt, { SelectOptionItemProps } from "../Shared/Option";
import ChevronDown from "../Shared/ChevronDown";
import CloseIcon from "../Shared/ClosedIcon";
import useIntersectionObserver from "../../helpers/useIntersectionObserver";
import useOnClickOutside from "../../helpers/useOnClickOutside";

interface SelectProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: ReactNode;
  defaultValue?: any;
  className?: string;
  listClassName?: string;
  placeholder?: string;
  searchable?: boolean;
  allowClear?: boolean;
  searchText?: string;
  children?: ReactElement<SelectOptionItemProps> | ReactElement<SelectOptionItemProps>[];
  onChange?: (value: string) => void;
}
const Select = ({
  id,
  name,
  label,
  value,
  defaultValue,
  className,
  listClassName,
  children,
  placeholder,
  onChange,
  allowClear = false,
  searchable = false,
  searchText,
  disabled = false,
}: SelectProps) => {
  const [isOpen, toggle] = useState(false);
  const [positionOptions, setPositionOptions] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const options = children ? (Array.isArray(children) ? children?.map((x) => x.props) : [children.props]) : [];
  const selectedOption = options.find((x) => (typeof value !== "undefined" ? x.value === value : x.value === defaultValue));
  const [searchedOptions, setSearchedOptions] = useState<SelectOptionItemProps[]>(options);
  const clear = (e: any) => {
    e.stopPropagation();
    toggle(false);
    onChange?.("");
    setSearchedOptions([]);
  };
  const handleClose = () => {
    toggle(false);
  };
  const onSelect = (v: string) => {
    onChange?.(v);
    toggle(false);
  };
  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value.length) setSearchedOptions(options.filter((x) => x.value !== "" && ~(x.text ?? (x.children as string)).indexOf(value)));
    else setSearchedOptions(options);
  };

  useOnClickOutside(ref, handleClose, isOpen);
  const { ref: wrapperOptionsRef } = useIntersectionObserver({
    options: {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    },
    callback(entry) {
      if(!isOpen) return; 
      if (entry.intersectionRatio === 0) {
        toggle(false);
      }
      if (!entry.isIntersecting) {
        setPositionOptions((prev) => !prev);
      }
    },
  });

  useEffect(() => {
    setSearchedOptions(children ? (Array.isArray(children) ? children?.map((x) => x.props) : [children.props]) : []);
  }, [children]);

  return (
    <div
      ref={ref}
      className={`select-control${allowClear && selectedOption ? " clearable" : ""} ${className ?? ""}${isOpen ? " is-open" : ""}${
        disabled ? " disabled" : ""
      }`}
    >
      {label ? <label htmlFor={name}>{label}</label> : null}
      <div className={`input-wrapper `} onClick={disabled ? undefined : () => toggle((s) => !s)}>
        {selectedOption?.text ?? selectedOption?.children ?? (placeholder ? <span className="placeholder">{placeholder}</span> : null) ?? <span>&nbsp;</span>}
        <ChevronDown className="indicator" />
        {allowClear && selectedOption && <CloseIcon className="clear-icon" onClick={disabled ? undefined : (e: any) => clear(e)} />}
      </div>
      {isOpen && (
        <ul ref={wrapperOptionsRef} className={`select-options ${positionOptions ? "openDown" : "openUp"} ${listClassName ?? ""}`}>
          {searchable ? (
            <li className="search-wrapper">
              <input ref={searchRef} type="text" onChange={onSearch} placeholder={searchText} />
            </li>
          ) : null}
          {searchedOptions?.map((x, idx) => (
            <li
              key={x.value}
              className={`${x.disabled ? "disabled" : ""}${x.value === value ? " selected" : ""}`}
              onClick={() => (x.disabled ? undefined : onSelect(x.value))}
            >
              <Opt key={idx} text={x.text} value={x.value} disabled={x.disabled}>
                {x.children}
              </Opt>
            </li>
          ))}
        </ul>
      )}
      <input type="hidden" value={value} name={name} id={id} />
    </div>
  );
};
Select.Option = Opt;
export default Select;