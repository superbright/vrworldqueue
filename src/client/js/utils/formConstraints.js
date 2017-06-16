export default {
  firstname: {
    presence: true,
    length: {
      minimum: 2,
      message: 'must be at least 2 characters',
    },
  },
  lastname: {
    presence: true,
    length: {
      minimum: 2,
      message: 'must be at least 2 characters',
    },
  },
  email: {
    presence: true,
    email: true,
  },
  phone: {
    presence: true,
    length: {
      minimum: 10,
      message: 'must be at least 10 numbers',
    },
    numericality: true,
  },
  screenname: {
    presence: true,
    length: {
      minimum: 2,
      message: 'must be at least 2 characters',
    },
  },
};
