import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'نام کاربری باید فقط شامل حروف و اعداد باشد',
      'string.min': 'نام کاربری باید حداقل ۳ کاراکتر باشد',
      'string.max': 'نام کاربری نمی‌تواند بیشتر از ۳۰ کاراکتر باشد',
      'any.required': 'نام کاربری الزامی است'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'لطفاً یک آدرس ایمیل معتبر وارد کنید',
      'any.required': 'ایمیل الزامی است'
    }),
  
  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'رمز عبور باید حداقل ۸ کاراکتر باشد',
      'string.max': 'رمز عبور نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد',
      'string.pattern.base': 'رمز عبور باید حداقل شامل یک حرف بزرگ، یک حرف کوچک، یک عدد و یک کاراکتر خاص باشد',
      'any.required': 'رمز عبور الزامی است'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'لطفاً یک آدرس ایمیل معتبر وارد کنید',
      'any.required': 'ایمیل الزامی است'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'رمز عبور الزامی است'
    })
});
