import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "@/hooks/form-context";
import { lazy } from "react";

const CalendarField = lazy(() => import("@/components/forms/calendar-field"));
const TextField = lazy(() => import("@/components/forms/text-field"));
const TextareaField = lazy(() => import("@/components/forms/textarea-field"));
const SelectField = lazy(() => import("@/components/forms/select-field"));
const PhoneField = lazy(() => import("@/components/forms/phone-field"));
const MultiselectField = lazy(
  () => import("@/components/forms/multiselect-field"),
);
const SubscribeButton = lazy(
  () => import("@/components/forms/subscribe-button"),
);

// https://tanstack.com/form/latest/docs/framework/react/guides/form-composition
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    CalendarField,
    TextField,
    TextareaField,
    SelectField,
    MultiselectField,
    PhoneField,
  },
  formComponents: {
    SubscribeButton,
  },
});
