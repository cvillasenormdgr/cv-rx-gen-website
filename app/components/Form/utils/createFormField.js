import { Fragment } from "react";
import FormMedicine from "../FormMedicine"
import FormInput from "../FormInput"
import FormMessage from "../FormMessage";
import FormDate from "../FormDate";

const createFormField = ({
  field,
  register,
  errors,
  key,
  append,
  remove,
  fields,
  control,
}) => {
  const {
    "Name": name,
    "Type": type,
    "Label": label,
    "Required": required = false,
    "Placeholder": placeholder,
  } = field;

  switch (type) {
    case "text":
      return (
        <Fragment key={key}>
          <FormInput
            name={name}
            label={label}
            required={required}
            placeholder={placeholder}
            register={register}
            errors={errors}
          />
        </Fragment>
      );
    case "medicine":
      return (
        <Fragment key={key}>
          <FormMedicine
            key={key}
            name={name}
            label={label}
            required={required}
            placeholder={placeholder}
            register={register}
            errors={errors}
            append={append}
            remove={remove}
            fields={fields}
            control={control}
          />
        </Fragment>
      );
    case "message":
      return (
        <Fragment key={key}>
          <FormMessage name={name} label={label} />
        </Fragment>
      );
    case "date":
      return (
        <Fragment key={key}>
          <FormDate name={name} label={label} required={required} register={register} errors={errors} />
        </Fragment>
      );
    default:
      return null
  }
}

export default createFormField