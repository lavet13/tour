import { createFormHookContexts } from "@tanstack/react-form";

// https://tanstack.com/form/latest/docs/framework/react/guides/form-composition
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();
