const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  handleValidationErrors
];

const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 3 })
    .withMessage('Nome deve ter no mínimo 3 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  handleValidationErrors
];

const validateResident = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório'),
  body('document')
    .notEmpty()
    .withMessage('Documento é obrigatório'),
  body('condominiumId')
    .notEmpty()
    .withMessage('ID do condomínio é obrigatório'),
  handleValidationErrors
];

const validateCondominium = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório'),
  body('address')
    .notEmpty()
    .withMessage('Endereço é obrigatório'),
  body('type')
    .isIn(['CONDOMINIUM', 'COMMERCIAL'])
    .withMessage('Tipo deve ser CONDOMINIUM ou COMMERCIAL'),
  handleValidationErrors
];

const validateDevice = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório'),
  body('ip')
    .isIP()
    .withMessage('IP inválido'),
  body('model')
    .notEmpty()
    .withMessage('Modelo é obrigatório'),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  validateResident,
  validateCondominium,
  validateDevice,
  handleValidationErrors
};
