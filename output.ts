export const RegistrationForm = {
  login: {
    required: true,
    regex: "^[\\w_]{4,100}$",
    errorMessage: null
  },
  password: {
    required: true,
    regex: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){5;150}$",
    errorMessage: "Invalid"
  },
  tel: {
    required: true,
    regex: "^\\d{3}-\\d{3}-\\d{4}$",
    errorMessage: "Invalid"
  },
  name: {
    required: false,
    regex: "^([а-яА-ЯёЁa-zA-Z]+ [а-яА-ЯёЁa-zA-Z]? [а-яА-ЯёЁa-zA-Z]? [\\-\\s]*){1;150}$",
    errorMessage: null
  }
};
