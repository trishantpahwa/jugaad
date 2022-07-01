import axios from 'axios';
import SessionService from './session.service';

axios.defaults.baseURL = ''//process.env.REACT_APP_API_BASE_URL;
axios.interceptors.request.use((config) => {
    const innerConfig = config;
    const token = SessionService.get('user-token');
    if (token) {
        innerConfig.headers.Authorization = `Bearer ${token}`;
    }
    return innerConfig;
});

const ApiService = {
    get: async (url) => {
        try {
            const { data } = await axios({ method: 'GET', url });
            return data;
        } catch (error) {
            return error.response ? error.response.data : {};
        }
    },

    post: async (url, body) => {
        try {
            const { data } = await axios({ method: 'POST', url, data: body });
            return data;
        } catch (error) {
            return error.response ? error.response.data : {};
        }
    },

    put: async (url, body) => {
        try {
            const { data } = await axios({ method: 'PUT', url, data: body });
            return data;
        } catch (error) {
            return error.response ? error.response.data : {};
        }
    },

    delete: async (url) => {
        try {
            const { data } = await axios({ method: 'DELETE', url });
            return data;
        } catch (error) {
            return error.response ? error.response.data : {};
        }
    },
    // test: async () => {
    //     try {
    //         const url = 'https://api64.ipify.org?format=json';
    //         const { data } = await axios({ method: 'GET', url });
    //         return data;
    //     } catch (error) {
    //         return error.response ? error.response.data : {};
    //     }
    // }
};

export default ApiService;