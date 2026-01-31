import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@ana:token')
      localStorage.removeItem('@ana:user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
