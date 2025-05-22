import axios from 'axios'

const fetchFile = (url) => axios.get(url, { timeout: 5000 })
  .then((response) => response.data)
  .catch((error) => {
    throw error
  })

export default fetchFile
