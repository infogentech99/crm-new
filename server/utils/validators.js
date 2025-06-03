export const isEmail = email => /\S+@\S+\.\S+/.test(email);
export const minLength = (str, len) => typeof str === 'string' && str.length >= len;
export const isStrongPassword = password => {
  return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password);
};
