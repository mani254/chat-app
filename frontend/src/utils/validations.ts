type ValidationAction = string;
export function validation(action: ValidationAction, value: string): string {
  switch (action) {
    case "title": {
      const regex = /^.{1,50}$/;
      if (value === "") {
        return "Title is required";
      }
      if (!regex.test(value)) {
        return "Title should be between 1 and 50 characters";
      }
      return "";
    }
    case "overview": {
      const overview = /^.{1,400}$/;
      if (value === "") {
        return "Overview is required";
      }
      if (!overview.test(value)) {
        return "Overview should be between 1 and 400 characters";
      }
      return "";
    }
    case "sku": {
      const sku = /^.{1,20}$/;
      if (value === "") {
        return "Sku is required";
      }
      if (!sku.test(value)) {
        return "SKU must be less then 1 and 20";
      }
      return "";
    }
    case "email": {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        return "Invalid email address";
      }
      return "";
    }
    case "password": {
      const passwordRegex =
        /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/;
      if (!passwordRegex.test(value)) {
        return "At least 6 charecters and 1 special Charecter";
      }
      return "";
    }
    default: {
      return "";
    }
  }
}
