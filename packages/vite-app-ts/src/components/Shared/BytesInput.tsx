import { Input } from 'antd';
import { TextAreaRef } from 'antd/lib/input/TextArea';
import React, { FC, Ref, SyntheticEvent } from 'react';

const { TextArea } = Input;

export interface IBytesInputProps {
  disabled?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  placeholder: string;
  wrapperStyle: any;
  ref?: Ref<TextAreaRef>;
}

const BytesInput: FC<IBytesInputProps> = (props) => {
  const formatValue = (v: string | undefined) => {
    if (!v) return '';

    if (!v.toString().startsWith('0x')) {
      v = `0x${v}`;
    }
    return v;
  };

  const update = (event: SyntheticEvent) => {
    let v = (event.target as HTMLInputElement).value;
    props.onChange?.(formatValue(v));
  };

  return (
    <TextArea
      rows={5}
      placeholder={props.placeholder}
      disabled={props.disabled}
      style={{ ...props.wrapperStyle, textAlign: 'left' }}
      value={formatValue(props.value)}
      onChange={update}
      ref={props.ref}
    />
  );
};
export default BytesInput;
