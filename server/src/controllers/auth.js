import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import bcrypt from 'bcryptjs'
import User from '../models/user'
import Book from '../models/book'
import Author from '../models/author'
import Genre from '../models/genre'
import sendEmailToUser from '../mailer/send'
import sendEmailToAdmin from '../mailer/new-user'
import sendEmailToUserPassword from '../mailer/forgotten-password'
import { validateSignin, validateSignup, validateChangePassword, validateEmail, validatePassword } from '../utils/validation'
import moment from 'moment'

const signup = async (req, res) => {
  try {
      const { isValid, errors } = validateSignup(req.body)
      if(!isValid) {
          return res.status(400).json(Object.keys(errors))
      }
      const user = await User.findOne({email : req.body.email})
      if (user && user.confirmed) {
        errors.EMAIL_WAS_USED = 'Email was used!'
        return res.status(400).json(Object.keys(errors))
      }
      if (user && !user.confirmed) {
        sendEmailToUser(user.email, user.id)
        errors.EMAIL_WAITING_FOR_CONFIRMATION = 'Email was used and waiting for confiration!'
        return res.status(400).json(Object.keys(errors))
      }
      bcrypt.genSalt(10, async (err, salt) => {
        bcrypt.hash(req.body.password, salt, async (err, hash) => {
          const newUser = new User(req.body)
          newUser.password = hash
          if (newUser.email === process.env.ADMIN_EMAIL) {
            newUser.role = 'ADMIN'
          }

          const result = await newUser.save()
          Promise.all[
            sendEmailToUser(result.email, result._id)
              .then(() => res.json({MAIL_CONFIRMATION_SEND_SUCCESS: `Email confirmation send successfully from ${process.env.USER_MAILER}`}))
              .catch(e => {
                errors.MAIL_CONFIRMATION_SEND_ERROR = 'Email confirmation send failed'
                res.status(400).json(Object.keys(errors))
              }),
            sendEmailToAdmin(result, 'Nouvel utilisateur').then(() => console.log('Email notification send successfully'))
          ]
        })
      })
  } catch (error) {
      res.status(401).json(error)
  }
}


const signin = async (req, res) => {
  try {
      const { isValid, errors } = validateSignin(req.body)
      if(!isValid) {
          return res.status(400).json(Object.keys(errors))
      }
      const user = req.user
      if(!user) {
        errors.USER_NOT_FOUND = 'User not found'
        return res.status(400).json(Object.keys(errors))
      }
      const isMatch = await bcrypt.compare(req.body.password, user.password)
      if (isMatch) {
          if(!user.confirmed) {
              errors.USER_NOT_CONFIRMED = 'User not confirmed'
              return res.status(400).json(Object.keys(errors))
          }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: 86400 * 30 })

        sendEmailToAdmin(user, `${user.name} est connecté il y ${moment(new Date(user.createdAt)).fromNow()}`)
          .then(() => console.log('Email notification send successfully'))
        return res.json({
          success: true,
          token: "Bearer " + token,
          isAdmin: user.role ==="ADMIN" ? true : false,
          user: {id: user._id, name: user.name, email: user.email, confirmed: user.confirmed},
        })
      } else {
        errors.INCORRECT_PASSWORD = 'Password is incorrect'
        return res.status(400).json(Object.keys(errors))
      }

  } catch (error) {
    res.status(401).json(error)
  }
}

const confirm = async (req, res) => {
  try {
      const { id } = req.params
      const user = await User.findById(id)

      if (!user) {
        res.status(400).json({COULD_NOT_FIND: 'Could not find you'})
      }
      else if (user && !user.confirmed) {
        const updatedUser = await User.findOneAndUpdate({_id: id}, { confirmed: true },{new: true, useFindAndModify: false})
        updatedUser && res.json({ USER_CONFIRMED: "Your account is now confirmed" })
      }
      else  {
        res.json({ ACCOUNT_CONFIRMED: "Your count is already confirmed" })
      }
  } catch (error) {
      res.status(400).json(error)
  }
}

const changePassword = async (req, res) => {
    try {
        const { isValid, errors } = validateChangePassword(req.body)
        if(!isValid) {
            return res.status(400).json(errors)
        }
        const user = await req.user
          const isMatch = await bcrypt.compare(req.body.password, user.password)
          if (!isMatch) {
            errors.INCORRECT_PASSWORD = 'Password is incorrect'
            return res.status(400).json(Object.keys(errors))
          }
          bcrypt.genSalt(10, async (err, salt) => {
                bcrypt.hash(req.body.newPassword, salt, async (err, hash) => {
                  user.password = hash
                  user.updatedAt = Date.now()
                  const result = await user.save()
                  if(result) {
                      res.json(result)
                  } else {
                      errors.CHANGE_PASSWORD_FAILED = 'Your password has not changed'
                      return res.status(400).json(Object.keys(errors))     
                  }
                })
          })

    } catch (error) {
        res.status(400).json(error)
    }
}

const forgottenPassword = async (req, res) => {
  try {
      const { isValid, errors } = validateEmail(req.body)
      if(!isValid) {
          return res.status(400).json(Object.keys(errors))
      }
      const user = await User.findOne({email : req.body.email})
      if (!user) {
        errors.EMAIL_NOT_EXIST = 'Email not exist'
        return res.status(400).json(Object.keys(errors))
      }

      sendEmailToUserPassword(user.email, user._id)
        .then(() => res.json({MAIL_FORGOTTEN_PASSWORD_SEND_SUCCESS: `Email confirmation send successfully from ${process.env.USER_MAILER}`}))
        .catch(e => {
          errors.MAIL_FORGOTTEN_PASSWORD_SEND_ERROR = 'Email confirmation send failed'
          res.status(400).json(Object.keys(errors))
        })
  } catch (error) {
      res.status(400).json(error)
  }
}

const newPassword = async (req, res) => {
    try {
        const { isValid, errors } = validatePassword(req.body)
        if(!isValid) {
            return res.status(400).json(errors)
        }
        const user = await req.user

        bcrypt.genSalt(10, async (err, salt) => {
              bcrypt.hash(req.body.password, salt, async (err, hash) => {
                  user.password = hash
                  user.updatedAt = Date.now()
                  const result = await user.save()
                  if(result) {
                      sendEmailToAdmin(result, `${result.name} a un nouveau mot de passe, ${moment(new Date()).fromNow()}`)
                        .then(() => res.json({NEW_PASSWORD_SUCCESS: `Email confirmation send successfully`}))
                  } else {
                      errors.NEW_PASSWORD_ERROR = 'Your password has not changed'
                      return res.status(400).json(Object.keys(errors))     
                  }
              })
          })

    } catch (error) {
        res.status(400).json(error)
    }
}

const countAll = async (req, res) => {
    try {
          const books = await Book.countDocuments()
          const authors = await Author.countDocuments()
          const genres = await Genre.countDocuments()
          const users = await User.countDocuments()
          const nonConfirmed = await User.countDocuments({confirmed: false})
          const forMembers = await Book.countDocuments({member: true})
          res.json({books, authors, genres, users, forMembers, nonConfirmed})
    } catch (error) {
        res.status(400).json(error)
    }
}

const signout = (req, res) => {
  return res.status(200).json({
    message: "signed out"
  })
}

export default {
  signin,
  signup,
  signout,
  confirm,
  changePassword,
  forgottenPassword,
  newPassword,
  countAll
}
