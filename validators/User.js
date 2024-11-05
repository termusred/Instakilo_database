import Joi from "joi"


export const UserPostSchema = Joi.object({
    username: Joi.string().required().min(3).max(20),
    password: Joi.string().required(),
    email: Joi.string().required().min(6),
    role: Joi.string().valid('admin', 'user'),
    phone_number : Joi.string().min(6).required()
})


export const UserPatchSchema = Joi.object({
    username: Joi.string().min(3).max(20),
    password: Joi.string(),
    role: Joi.string().valid('admin', 'user'),
    phone_number : Joi.string().min(6)
})


export const UserLoginSchema = Joi.object({
    email: Joi.string().required().min(3).max(20),
    password: Joi.string().required(),
})

export const UserNumberLogin = Joi.object({
    phone_number: Joi.string().required().min(6),
    password: Joi.string().required(),
})