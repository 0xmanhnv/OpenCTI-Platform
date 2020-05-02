import React from 'react';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { fieldToKeyboardDatePicker } from 'formik-material-ui-pickers';
import { parse } from '../utils/Time';

const DatePickerField = (props) => {
  const {
    form: { setFieldValue, setTouched },
    field: { name },
    onChange,
    onFocus,
    onSubmit,
  } = props;
  const internalOnAccept = React.useCallback(
    (date) => {
      setTouched(true);
      if (typeof onSubmit === 'function') {
        onSubmit(name, date.toISOString());
      }
    },
    [setTouched, onSubmit, name],
  );
  const internalOnChange = React.useCallback(
    (date) => {
      setFieldValue(name, date);
      if (typeof onChange === 'function') {
        onChange(name, date);
      }
    },
    [setFieldValue, onChange, name],
  );
  const internalOnFocus = React.useCallback(() => {
    if (typeof onFocus === 'function') {
      onFocus(name);
    }
  }, [onFocus, name]);
  const internalOnBlur = React.useCallback(
    (event) => {
      setTouched(true);
      const { value } = event.target;
      if (typeof onSubmit === 'function') {
        onSubmit(name, parse(value).toISOString());
      }
    },
    [setTouched, onSubmit, name],
  );
  return (
    <KeyboardDatePicker
      {...fieldToKeyboardDatePicker(props)}
      variant="inline"
      disableToolbar={false}
      autoOk={true}
      allowKeyboardControl={true}
      format="YYYY-MM-DD"
      onAccept={internalOnAccept}
      onChange={internalOnChange}
      onFocus={internalOnFocus}
      onBlur={internalOnBlur}
    />
  );
};

export default DatePickerField;
