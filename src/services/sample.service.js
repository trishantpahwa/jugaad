import ApiService from "./api.service";

const SampleService = {
    test: async () =>  await ApiService.get('https://api64.ipify.org?format=json'),
};

export default SampleService;